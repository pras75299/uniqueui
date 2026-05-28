"use client";

import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

export interface TerminalProps {
  /** Commands typed out one after another. */
  commands: string[];
  /** Output lines shown after a command finishes typing, keyed by command index. */
  outputs?: Record<number, string[]>;
  /** Name shown (highlighted) in the shell prompt. */
  username?: string;
  /** Text shown in the window title bar. */
  title?: string;
  /** Additional CSS classes for the outer window. */
  className?: string;
  /** Visual theme. */
  theme?: "light" | "dark";
  /** Typing speed in milliseconds per character. */
  typingSpeed?: number;
  /** Pause in milliseconds between finishing one command and starting the next. */
  delayBetweenCommands?: number;
  /** Delay in milliseconds before the first command starts typing. */
  initialDelay?: number;
  /** Play a subtle keystroke click on each character (Web Audio, no asset). */
  enableSound?: boolean;
  /** Only begin the animation once the window scrolls into view. */
  startOnView?: boolean;
  /** Restart the sequence from the top once it finishes. */
  loop?: boolean;
  /** Show the replay + copy controls in the title bar. */
  showControls?: boolean;
  /** Fires once after the last command and its output have rendered. */
  onComplete?: () => void;
}

type Line = { kind: "command" | "output"; text: string };

const RUNNERS = new Set([
  "npx",
  "npm",
  "pnpm",
  "yarn",
  "bun",
  "git",
  "sudo",
  "docker",
  "node",
  "deno",
  "cd",
]);

function useKeystrokeSound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);

  return useCallback(() => {
    if (!enabled || typeof window === "undefined") return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = ctxRef.current ?? (ctxRef.current = new AudioCtx());
      if (ctx.state === "suspended") void ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = 180 + Math.random() * 120;
      gain.gain.setValueAtTime(0.025, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    } catch {
      // Browsers may block audio before a user gesture — fail silently.
    }
  }, [enabled]);
}

function CommandTokens({
  text,
  promptClass,
  accentClass,
}: {
  text: string;
  promptClass: string;
  accentClass: string;
}) {
  const tokens = text.split(/(\s+)/);
  let accentIndex = -1;
  const firstWord = tokens.findIndex((t) => t.trim().length > 0);
  if (firstWord !== -1) {
    const isRunner = RUNNERS.has(tokens[firstWord]);
    accentIndex = isRunner
      ? tokens.findIndex((t, i) => i > firstWord && t.trim().length > 0)
      : firstWord;
  }
  return (
    <>
      {tokens.map((tok, i) => (
        <span key={i} className={i === accentIndex ? accentClass : promptClass}>
          {tok}
        </span>
      ))}
    </>
  );
}

export function Terminal({
  commands,
  outputs = {},
  username = "user",
  title = "bash",
  className,
  theme = "dark",
  typingSpeed = 50,
  delayBetweenCommands = 800,
  initialDelay = 500,
  enableSound = true,
  startOnView = true,
  loop = false,
  showControls = true,
  onComplete,
}: TerminalProps) {
  const dark = theme !== "light";
  const reduceMotion = useReducedMotion();
  const playSound = useKeystrokeSound(enableSound && !reduceMotion);

  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, amount: 0.3 });

  const [history, setHistory] = useState<Line[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [replayKey, setReplayKey] = useState(0);

  // Key the typing effect on the *content* of commands/outputs rather than
  // their reference. Callers pass inline arrays/objects (and `outputs`
  // defaults to a fresh `{}`), so depending on identity would cancel and
  // restart the animation on every re-render — including the re-renders this
  // effect's own setState triggers, which would stall the terminal.
  const commandsKey = JSON.stringify(commands);
  const outputsKey = JSON.stringify(outputs);
  const stableCommands = useMemo<string[]>(
    () => JSON.parse(commandsKey),
    [commandsKey],
  );
  const stableOutputs = useMemo<Record<number, string[]>>(
    () => JSON.parse(outputsKey),
    [outputsKey],
  );
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  useEffect(() => {
    if (reduceMotion) {
      const lines: Line[] = [];
      stableCommands.forEach((cmd, i) => {
        lines.push({ kind: "command", text: cmd });
        (stableOutputs[i] ?? []).forEach((o) =>
          lines.push({ kind: "output", text: o }),
        );
      });
      setHistory(lines);
      setCurrent(null);
      setDone(true);
      return;
    }
    if (startOnView && !inView) return;

    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        timeouts.push(setTimeout(resolve, ms));
      });

    (async () => {
      setHistory([]);
      setCurrent(null);
      setDone(false);

      await sleep(initialDelay);
      for (let i = 0; i < stableCommands.length; i++) {
        const cmd = stableCommands[i];
        setCurrent("");
        for (let c = 1; c <= cmd.length; c++) {
          if (cancelled) return;
          setCurrent(cmd.slice(0, c));
          playSound();
          await sleep(typingSpeed);
        }
        if (cancelled) return;
        setHistory((prev) => [
          ...prev,
          { kind: "command", text: cmd },
          ...(stableOutputs[i] ?? []).map(
            (o): Line => ({ kind: "output", text: o }),
          ),
        ]);
        setCurrent(null);
        await sleep(delayBetweenCommands);
      }
      if (cancelled) return;
      setDone(true);
      onCompleteRef.current?.();
      if (loop) {
        await sleep(Math.max(delayBetweenCommands, 1200));
        if (!cancelled) setReplayKey((k) => k + 1);
      }
    })();

    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, [
    reduceMotion,
    startOnView,
    inView,
    replayKey,
    stableCommands,
    stableOutputs,
    typingSpeed,
    delayBetweenCommands,
    initialDelay,
    loop,
    playSound,
  ]);

  const handleCopy = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(commands.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [commands]);

  const promptClass = dark ? "text-neutral-200" : "text-neutral-800";
  const accentClass = dark ? "text-emerald-400" : "text-emerald-600";
  const userClass = dark ? "text-sky-400" : "text-blue-600";
  const sigilClass = dark ? "text-neutral-500" : "text-neutral-400";
  const outputClass = dark ? "text-neutral-400" : "text-neutral-500";

  const renderPrompt = () => (
    <span>
      <span className={userClass}>{username}</span>
      <span className={sigilClass}>:~$ </span>
    </span>
  );

  const cursor = (
    <motion.span
      aria-hidden="true"
      className={cn(
        "ml-px inline-block h-[1.05em] w-[0.55em] translate-y-[0.15em] align-baseline",
        dark ? "bg-neutral-200" : "bg-neutral-700",
      )}
      animate={{ opacity: [1, 1, 0, 0] }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );

  return (
    <motion.div
      ref={containerRef}
      initial={false}
      className={cn(
        "w-full max-w-2xl overflow-hidden rounded-xl border font-mono text-sm shadow-2xl",
        dark
          ? "border-neutral-800 bg-neutral-900"
          : "border-neutral-200 bg-white",
        className,
      )}
    >
      <div
        className={cn(
          "relative flex items-center gap-2 px-4 py-3",
          dark ? "bg-neutral-800" : "bg-neutral-100",
        )}
      >
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span
          className={cn(
            "absolute inset-x-0 text-center text-xs font-medium",
            dark ? "text-neutral-400" : "text-neutral-500",
          )}
        >
          {title}
        </span>
        {showControls && (
          <div className="z-10 ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopy}
              aria-label={copied ? "Copied" : "Copy commands"}
              className={cn(
                "rounded p-1 transition-colors",
                dark
                  ? "text-neutral-500 hover:bg-neutral-700 hover:text-neutral-200"
                  : "text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700",
              )}
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
            </button>
            {done && !loop && (
              <button
                type="button"
                onClick={() => setReplayKey((k) => k + 1)}
                aria-label="Replay"
                className={cn(
                  "rounded p-1 transition-colors",
                  dark
                    ? "text-neutral-500 hover:bg-neutral-700 hover:text-neutral-200"
                    : "text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700",
                )}
              >
                <ReplayIcon />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-1 p-4 leading-relaxed" aria-hidden="true">
        {history.map((line, i) =>
          line.kind === "command" ? (
            <div key={i} className="whitespace-pre-wrap break-all">
              {renderPrompt()}
              <CommandTokens
                text={line.text}
                promptClass={promptClass}
                accentClass={accentClass}
              />
            </div>
          ) : (
            <div
              key={i}
              className={cn("whitespace-pre-wrap break-all", outputClass)}
            >
              {line.text}
            </div>
          ),
        )}
        {!done && (
          <div className="whitespace-pre-wrap break-all">
            {renderPrompt()}
            <CommandTokens
              text={current ?? ""}
              promptClass={promptClass}
              accentClass={accentClass}
            />
            {cursor}
          </div>
        )}
        {done && (
          <div className="whitespace-pre-wrap break-all">
            {renderPrompt()}
            {cursor}
          </div>
        )}
      </div>

      <div className="sr-only">
        {commands.map((cmd, i) => (
          <div key={i}>
            <span>
              {username}:~$ {cmd}
            </span>
            {(outputs[i] ?? []).map((o, j) => (
              <div key={j}>{o}</div>
            ))}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

const DEFAULT_COMMANDS = [
  "npx shadcn@latest init",
  "npm install motion",
  "npx shadcn@latest add button card",
];

const DEFAULT_OUTPUTS: Record<number, string[]> = {
  0: [
    "✔ Preflight checks passed.",
    "✔ Created components.json",
    "✔ Initialized project.",
  ],
  1: ["added 1 package in 2s"],
  2: ["✔ Done. Installed button, card."],
};

type TerminalHeroProps = Omit<ComponentProps<"section">, "children"> &
  Partial<
    Pick<
      TerminalProps,
      | "commands"
      | "outputs"
      | "username"
      | "title"
      | "typingSpeed"
      | "delayBetweenCommands"
      | "initialDelay"
      | "enableSound"
      | "loop"
    >
  > & {
    /** Slotted hero content above the terminal. Omit to render the default headline. */
    children?: ReactNode;
  };

export function TerminalHero({
  children,
  commands = DEFAULT_COMMANDS,
  outputs = DEFAULT_OUTPUTS,
  username = "you",
  title = "zsh — your-project",
  typingSpeed,
  delayBetweenCommands,
  initialDelay,
  enableSound = false,
  loop,
  className,
  ...rest
}: TerminalHeroProps) {
  return (
    <section
      {...rest}
      className={cn(
        "relative isolate flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden bg-[#08080a] px-6 py-20 text-white",
        className,
      )}
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(45,212,191,0.12)_0%,_transparent_60%)]" />
      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center text-center">
        {children ?? <DefaultTerminalContent />}
      </div>
      <div className="relative z-10 mt-12 flex w-full max-w-2xl justify-center">
        <Terminal
          commands={commands}
          outputs={outputs}
          username={username}
          title={title}
          typingSpeed={typingSpeed}
          delayBetweenCommands={delayBetweenCommands}
          initialDelay={initialDelay}
          enableSound={enableSound}
          loop={loop}
        />
      </div>
    </section>
  );
}

function DefaultTerminalContent() {
  return (
    <>
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, type: "spring", stiffness: 120, damping: 18 }}
        className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/70 backdrop-blur"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
        One command to ship
      </motion.span>
      <motion.h1
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, type: "spring", stiffness: 110, damping: 18 }}
        className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl"
      >
        Watch your stack build itself.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, type: "spring", stiffness: 110, damping: 18 }}
        className="mt-5 max-w-xl text-pretty text-base text-white/65 sm:text-lg"
      >
        Copy-paste components, zero config. Run the commands below and your
        project is production-ready before the cursor stops blinking.
      </motion.p>
    </>
  );
}

function CopyIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ReplayIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
}
