"use client";

import { useEffect, useId, useRef, type ComponentProps, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

type LiquidAuroraMeshBackgroundProps = {
  className?: string;
  /** Three accent colors for the aurora ribbons. */
  palette?: [string, string, string];
  /** Cycle speed in seconds (lower = faster). */
  speed?: number;
};

export function LiquidAuroraMeshBackground({
  className,
  palette = ["#9b6bff", "#3effd0", "#ff77c4"],
  speed = 14,
}: LiquidAuroraMeshBackgroundProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(50);
  const py = useMotionValue(50);
  const sx = useSpring(px, { stiffness: 60, damping: 16, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 60, damping: 16, mass: 0.6 });
  const filterId = useId();
  // Clamp speed defensively — negative or non-finite values would yield invalid durations.
  const safeSpeed = Number.isFinite(speed) && speed > 0 ? speed : 0;
  const cycle = reduced ? 0 : safeSpeed;

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    // Listen on window so pointer events over foreground content (z-10 headline,
    // buttons) still drive the pocket — siblings can't capture them otherwise.
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      if (x < 0 || x > 100 || y < 0 || y > 100) return;
      px.set(x);
      py.set(y);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [px, py, reduced]);

  const [a, b, c] = palette;

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn("absolute inset-0 overflow-hidden bg-[#06060a]", className)}
    >
      <svg className="absolute -z-10 h-0 w-0" aria-hidden>
        <filter id={filterId} x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="2" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="80" />
        </filter>
      </svg>

      <div className="absolute inset-0" style={{ filter: `url(#${filterId})` }}>
        {/* Anchor `initial` to the first keyframe — motion v12 skips repeat:Infinity loops if SSR bakes in the target frame. */}
        <motion.div
          className="absolute inset-[-20%]"
          style={{
            background: `radial-gradient(60% 60% at 30% 30%, ${a}aa 0%, transparent 60%),
              radial-gradient(50% 50% at 75% 65%, ${b}99 0%, transparent 60%),
              radial-gradient(70% 70% at 50% 90%, ${c}88 0%, transparent 60%)`,
            mixBlendMode: "screen",
          }}
          initial={{ rotate: 0, scale: 1 }}
          animate={cycle ? { rotate: [0, 360], scale: [1, 1.08, 1] } : { rotate: 0 }}
          transition={cycle ? { duration: cycle, ease: "linear", repeat: Infinity } : undefined}
        />
        <motion.div
          className="absolute inset-[-30%]"
          style={{
            background: `conic-gradient(from 90deg at 50% 50%, ${a}55, ${b}55, ${c}55, ${a}55)`,
            mixBlendMode: "screen",
          }}
          // Match `animate` when reduced so reduced-motion users land static at 0deg instead of spinning once.
          initial={cycle ? { rotate: 360 } : { rotate: 0 }}
          animate={cycle ? { rotate: [360, 0] } : { rotate: 0 }}
          transition={cycle ? { duration: cycle * 1.6, ease: "linear", repeat: Infinity } : undefined}
        />
      </div>

      <motion.div
        className="pointer-events-none absolute h-[60vmin] w-[60vmin] rounded-full"
        style={{
          left: sx,
          top: sy,
          translateX: "-50%",
          translateY: "-50%",
          background: `radial-gradient(circle at center, ${b}55, transparent 65%)`,
          filter: "blur(50px)",
          mixBlendMode: "screen",
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_45%,_#06060a_92%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.9) 1px, transparent 0)",
          backgroundSize: "3px 3px",
        }}
      />
    </div>
  );
}

type LiquidAuroraMeshHeroProps = Omit<ComponentProps<"section">, "children"> & {
  children?: ReactNode;
  backgroundProps?: LiquidAuroraMeshBackgroundProps;
};

export function LiquidAuroraMeshHero({
  children,
  className,
  backgroundProps,
  ...rest
}: LiquidAuroraMeshHeroProps) {
  return (
    <section
      {...rest}
      className={cn(
        "relative isolate flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-[#06060a] text-white",
        className,
      )}
    >
      <LiquidAuroraMeshBackground {...backgroundProps} />
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        {children ?? <DefaultAuroraContent />}
      </div>
    </section>
  );
}

function DefaultAuroraContent() {
  return (
    <>
      <ChipReveal>Liquid · Aurora · Mesh</ChipReveal>
      <SplitHeadline text="Light, made fluid." />
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.42, type: "spring", stiffness: 110, damping: 18 }}
        className="mt-5 max-w-xl text-pretty text-base text-white/65 sm:text-lg"
      >
        A displacement-warped aurora mesh that drifts behind your headline.
        Mouse where you want the light to pool.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.54, type: "spring", stiffness: 110, damping: 18 }}
        className="mt-9 flex flex-wrap items-center justify-center gap-3"
      >
        <button
          type="button"
          className="group inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-medium text-black transition-transform duration-200 hover:-translate-y-px"
        >
          <span>Get started</span>
          <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
            →
          </span>
        </button>
        <button
          type="button"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-6 text-sm font-medium text-white/85 backdrop-blur transition-colors hover:bg-white/5"
        >
          See it move
        </button>
      </motion.div>
    </>
  );
}

function ChipReveal({ children }: { children: ReactNode }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06, type: "spring", stiffness: 130, damping: 20 }}
      className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/70 backdrop-blur"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300/90 shadow-[0_0_12px_2px] shadow-emerald-300/40" aria-hidden />
      {children}
    </motion.span>
  );
}

function SplitHeadline({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="inline-block overflow-hidden align-bottom pr-[0.18em]">
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            transition={{ delay: 0.18 + i * 0.08, type: "spring", stiffness: 110, damping: 18 }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </h1>
  );
}
