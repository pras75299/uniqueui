"use client";

import { motion, useReducedMotion, Variants } from "motion/react";
import { TypewriterText } from "@/components/ui/typewriter-text";
import { TiltCard } from "@/components/ui/3d-tilt-card";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/contexts/theme-context";
import { useRef, useState } from "react";
import {
  Check,
  Copy,
  Terminal,
  Ghost,
  Sparkles,
  ArrowRight,
  Heart,
  Folder,
  FileText,
  LayoutGrid,
  MousePointer2,
  Timer,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  MorphingCardStack,
  type CardData,
} from "@/components/ui/morphing-card-stack";
import { PenCursor } from "@/components/ui/pen-cursor";

export default function Home() {
  const [copied, setCopied] = useState(false);
  const playgroundCardRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const reduceMotion = useReducedMotion();
  const [copyAddCmd, setCopyAddCmd] = useState(false);

  const reveal = {
    hidden: reduceMotion
      ? { opacity: 1, y: 0 }
      : { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 380, damping: 32 },
    },
  } satisfies Variants;

  const heroVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 260, damping: 28 },
    },
  };

  const playgroundVariants: Variants = {
    hidden: { opacity: 0, y: 32 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 260, damping: 28, delay: 0.05 },
    },
  };

  const heroCards: CardData[] = [
    {
      id: "hero",
      title: "Hero Sections",
      description:
        "Glow, gradients, and depth that make your landing pages feel cinematic out of the box.",
    },
    {
      id: "cards",
      title: "Card Grids",
      description:
        "Responsive, animated card layouts with hover depth, tilt, and spotlight interactions.",
    },
    {
      id: "nav",
      title: "Navigation",
      description:
        "Floating docks, limelight navs, and magnetic buttons to anchor your app’s structure.",
    },
    {
      id: "timelines",
      title: "Timelines",
      description:
        "Animated timelines and progress stories for roadmaps, onboarding, and product journeys.",
    },
  ];

  const copyCommand = () => {
    navigator.clipboard.writeText("npx uniqueui init");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyAddCommand = () => {
    navigator.clipboard.writeText("npx uniqueui add morphing-card-stack");
    setCopyAddCmd(true);
    setTimeout(() => setCopyAddCmd(false), 2000);
  };

  return (
    <motion.main
      className={cn(
        "flex min-h-screen flex-col items-center selection:bg-purple-500/30 overflow-x-hidden",
        isDark ? "text-white" : "text-neutral-900",
      )}
      initial={false}
      animate={{
        backgroundColor: isDark ? "#0a0a0a" : "#f5f3ff",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Background Gradient */}
      <div
        className={cn(
          "fixed inset-0 z-0 h-full w-full items-center px-5 py-24 pointer-events-none",
          isDark
            ? "[background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)] opacity-20"
            : "[background:radial-gradient(120%_160%_at_0%_0%,#e0f2fe_0%,#eef2ff_35%,#fdf2ff_70%,#f5f3ff_100%)] opacity-70",
        )}
      />

      {/* Header */}
      <div className="z-10 w-full max-w-6xl items-center justify-between font-mono text-sm lg:flex p-4 md:p-8 pt-8 relative">
        <p
          className={cn(
            "fixed left-0 top-0 flex w-full justify-center border-b backdrop-blur-md pb-6 pt-8 font-bold lg:static lg:w-auto lg:rounded-xl lg:border lg:p-4 z-50 lg:z-auto",
            isDark
              ? "border-neutral-800 bg-neutral-950/50 text-neutral-400 lg:bg-neutral-900/30"
              : "border-purple-100 bg-white/80 text-neutral-600 lg:bg-white/80 shadow-sm",
          )}
        >
          UniqueUI &nbsp;
          <span
            className={cn(
              "font-normal",
              isDark ? "text-neutral-500" : "text-neutral-600",
            )}
          >
            v1.0.0
          </span>
        </p>
        <div
          className={cn(
            "fixed bottom-0 left-0 flex h-48 w-full items-end justify-center lg:static lg:h-auto lg:w-auto lg:bg-none z-50 lg:z-auto pointer-events-none lg:pointer-events-auto",
            isDark
              ? "bg-linear-to-t from-black via-black"
              : "bg-linear-to-t from-white via-purple-100/40",
          )}
        >
          <div className="pointer-events-auto flex items-center gap-5 p-8 lg:p-0">
            <ThemeToggle className="shrink-0" />
            <Link
              href="/components"
              className={cn(
                "transition-colors",
                isDark
                  ? "text-neutral-400 hover:text-white"
                  : "text-neutral-600 hover:text-neutral-900",
              )}
            >
              Components
            </Link>
            <Link
              href="/docs"
              className={cn(
                "transition-colors",
                isDark
                  ? "text-neutral-400 hover:text-white"
                  : "text-neutral-600 hover:text-neutral-900",
              )}
            >
              Docs
            </Link>
            <Link
              href="/templates"
              className={cn(
                "transition-colors",
                isDark
                  ? "text-neutral-400 hover:text-white"
                  : "text-neutral-600 hover:text-neutral-900",
              )}
            >
              Templates
            </Link>
            <a
              className={cn(
                "flex place-items-center gap-2 transition-colors",
                isDark
                  ? "text-neutral-400 hover:text-white"
                  : "text-neutral-600 hover:text-neutral-900",
              )}
              href="https://github.com/pras75299/uniqueui"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative z-10 mt-28 lg:mt-20 px-4 w-full max-w-6xl mx-auto">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-center">
          {/* Hero copy + CTAs */}
          <motion.div
            variants={heroVariants}
            initial="hidden"
            animate="visible"
            className="text-left"
          >
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-full border text-xs mb-6 px-3 py-1 font-medium",
                isDark
                  ? "bg-neutral-900 border-neutral-800 text-neutral-400"
                  : "bg-white/90 border-purple-100 text-purple-700 shadow-xs",
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
              Animated React components · motion.dev
            </span>

            <h1
              className={cn(
                "text-4xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent tracking-tight mb-4",
                isDark
                  ? "bg-linear-to-b from-white to-neutral-400"
                  : "bg-linear-to-b from-neutral-900 to-purple-700",
              )}
            >
              Ship cinematic UI in minutes, not weeks.
            </h1>

            <div
              className={cn(
                "mt-3 mb-8 text-base md:text-lg max-w-xl flex flex-wrap items-center gap-2",
                isDark ? "text-neutral-400" : "text-neutral-700",
              )}
            >
              <span>Copy‑pasteable</span>
              <TypewriterText
                words={["heroes", "cards", "navbars", "timelines"]}
                className="text-purple-400 font-semibold"
              />
              <span>powered by motion.dev and Tailwind.</span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
              <Link
                href="/components"
                className={cn(
                  "w-full sm:w-auto px-7 py-3.5 rounded-full font-semibold flex items-center justify-center gap-2 transition-colors",
                  isDark
                    ? "bg-white text-black hover:bg-neutral-200"
                    : "bg-neutral-900 text-white hover:bg-neutral-800",
                )}
                aria-label="Browse components"
              >
                Browse components
                <ArrowRight className="w-4 h-4" />
              </Link>

              <motion.div
                variants={playgroundVariants}
                initial="hidden"
                animate="visible"
                className="relative group w-full sm:w-auto"
              >
                <div className="absolute -inset-0.5 bg-linear-to-r from-purple-600 to-pink-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-700 group-hover:duration-150" />
                <div
                  className={cn(
                    "relative flex items-center rounded-full leading-none",
                    isDark ? "bg-black" : "bg-neutral-900",
                  )}
                >
                  <div className="flex items-center px-5 py-3.5">
                    <Terminal
                      className={cn(
                        "w-4 h-4 mr-3",
                        isDark ? "text-neutral-400" : "text-neutral-500",
                      )}
                    />
                    <code
                      className={cn(
                        "font-mono text-xs md:text-sm",
                        isDark ? "text-neutral-200" : "text-neutral-100",
                      )}
                    >
                      npx uniqueui add hero
                    </code>
                  </div>
                  <button
                    onClick={copyCommand}
                    aria-label="Copy install command"
                    className={cn(
                      "p-3.5 rounded-r-full transition-colors border-l",
                      isDark
                        ? "hover:bg-neutral-900 border-neutral-800"
                        : "hover:bg-neutral-800 border-neutral-700",
                    )}
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-neutral-400" />
                    )}
                  </button>
                </div>
              </motion.div>
            </div>

            <p
              className={cn(
                "text-xs md:text-sm flex flex-wrap items-center gap-2",
                isDark ? "text-neutral-500" : "text-neutral-500",
              )}
            >
              <span>Works with Next.js & React ·</span>
              <span>Zero-config motion.dev animations ·</span>
              <span>Copy-paste architecture</span>
            </p>
          </motion.div>

          {/* Component playground */}
          <motion.div
            variants={playgroundVariants}
            initial="hidden"
            animate="visible"
            className="relative"
          >
            <div
              ref={playgroundCardRef}
              className={cn(
                "relative overflow-hidden pointer-events-auto rounded-3xl border backdrop-blur-xl p-4 sm:p-6 lg:p-7 shadow-2xl",
                isDark
                  ? "border-neutral-800 bg-neutral-950/80"
                  : "border-purple-200/70 bg-white/95 shadow-[0_24px_80px_rgba(129,140,248,0.45)]",
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide">
                  <span
                    className={cn(
                      "h-6 px-3 inline-flex items-center rounded-full",
                      isDark
                        ? "bg-purple-500/10 text-purple-200 border border-purple-500/30"
                        : "bg-purple-50 text-purple-700 border border-purple-200",
                    )}
                  >
                    Live playground
                  </span>
                  <span
                    className={cn(
                      "hidden sm:inline-block",
                      isDark ? "text-neutral-500" : "text-neutral-500",
                    )}
                  >
                    Try different layouts
                  </span>
                </div>
              </div>

              <MorphingCardStack
                cards={heroCards}
                theme={isDark ? "dark" : "light"}
                className="mx-auto"
              />

              <div
                className={cn(
                  "mt-6 pt-6 border-t text-center space-y-2",
                  isDark ? "border-neutral-800" : "border-purple-100",
                )}
              >
                <p
                  className={cn(
                    "text-xs font-medium uppercase tracking-wide",
                    isDark ? "text-neutral-500" : "text-neutral-600",
                  )}
                >
                  Ribbon trail
                </p>
                <p
                  className={cn(
                    "text-sm",
                    isDark ? "text-neutral-400" : "text-neutral-600",
                  )}
                >
                  Move your mouse — a physics-driven ribbon trails the pointer.
                </p>
              </div>
              <PenCursor
                containerRef={playgroundCardRef}
                trailLength={40}
                maxWidth={1}
                minWidth={1}
                colorHead={isDark ? "159, 175, 155" : "100, 80, 200"}
                colorTail={isDark ? "198, 167, 106" : "180, 120, 230"}
                alphaHead={0.95}
                alphaTail={0}
                damping={0.55}
                speedInfluence={0.8}
                speedMax={500}
              />
            </div>

            <div className="pointer-events-none absolute -inset-x-10 -bottom-6 h-24 bg-linear-to-t from-black/40 to-transparent dark:from-black/40" />
          </motion.div>
        </div>
      </section>

      {/* ── Below hero: docs-first layout (see Matcha / shadcn / Linear patterns) ─ */}
      <div className="relative z-10 mt-24 w-full pb-12 md:mt-32 md:pb-20">
        {/* One column width — matches hero `max-w-6xl` so edges line up */}
        <div className="mx-auto w-full max-w-6xl px-4">
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={reveal}
            className="space-y-6"
          >
            <h2
              className={cn(
                "fs-syne text-2xl font-semibold tracking-tight md:text-3xl lg:max-w-3xl",
                isDark ? "text-neutral-100" : "text-neutral-900",
              )}
            >
              Built if you ship UI, not slide decks.
            </h2>
            <ul className="max-w-3xl space-y-3 text-sm md:text-base">
              {[
                "You want motion.dev springs in real pages, not a motion lab prototype.",
                "You prefer one `.tsx` you can diff, not a black-box runtime package.",
                "You already live in Tailwind and Next — this meets you there.",
              ].map((line) => (
                <li key={line} className="flex gap-3">
                  <Check
                    className={cn(
                      "mt-0.5 h-4 w-4 shrink-0",
                      isDark ? "text-emerald-400" : "text-emerald-600",
                    )}
                    aria-hidden
                  />
                  <span className={isDark ? "text-neutral-400" : "text-neutral-600"}>
                    {line}
                  </span>
                </li>
              ))}
            </ul>
          </motion.section>

        {/* Capability rows — scan like product docs */}
        <section className="mt-20 md:mt-28">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={reveal}
            className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
          >
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                Surfaces in the registry
              </p>
              <h2
                className={cn(
                  "mt-2 fs-syne text-2xl font-semibold tracking-tight md:text-3xl",
                  isDark ? "text-white" : "text-neutral-900",
                )}
              >
                Same flow as reading internal docs.
              </h2>
            </div>
            <Link
              href="/components"
              className={cn(
                "inline-flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 ease-out",
                isDark
                  ? "text-violet-300 hover:text-violet-200"
                  : "text-violet-700 hover:text-violet-900",
              )}
            >
              Full index
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <div
            className={cn(
              "divide-y rounded-xl border",
              isDark
                ? "divide-neutral-800 border-neutral-800 bg-neutral-950/40"
                : "divide-neutral-200 border-neutral-200 bg-white",
            )}
          >
            {[
              {
                icon: <Sparkles className="h-5 w-5" />,
                title: "Marketing & hero",
                desc: "Aurora, gradients, and stacked narratives that read expensive without a design agency.",
              },
              {
                icon: <LayoutGrid className="h-5 w-5" />,
                title: "Layouts & bento",
                desc: "Grids, card stacks, and spatial transitions you can tune with plain Tailwind utilities.",
              },
              {
                icon: <MousePointer2 className="h-5 w-5" />,
                title: "Input & chrome",
                desc: "Docks, tabs, drawers, and micro-interactions that behave correctly with keyboard and screen readers.",
              },
              {
                icon: <Ghost className="h-5 w-5" />,
                title: "Depth & lighting",
                desc: "Spotlight, tilt, and parallax tricks that stay on the GPU and respect reduced motion.",
              },
              {
                icon: <Timer className="h-5 w-5" />,
                title: "Progress & timelines",
                desc: "Roadmaps, onboarding sequences, and status stories with spring-based choreography.",
              },
            ].map((row) => (
              <Link
                key={row.title}
                href="/components"
                className={cn(
                  "group flex cursor-pointer gap-4 px-4 py-5 no-underline transition-colors duration-200 ease-out md:gap-6 md:px-6 md:py-6",
                  isDark
                    ? "hover:bg-neutral-900/60"
                    : "hover:bg-neutral-50",
                )}
              >
                <span
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border",
                    isDark
                      ? "border-neutral-800 bg-neutral-900 text-neutral-300"
                      : "border-neutral-200 bg-neutral-50 text-neutral-700",
                  )}
                >
                  {row.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <h3
                    className={cn(
                      "font-semibold tracking-tight",
                      isDark ? "text-white" : "text-neutral-900",
                    )}
                  >
                    {row.title}
                  </h3>
                  <p
                    className={cn(
                      "mt-1 text-sm leading-relaxed",
                      isDark ? "text-neutral-500" : "text-neutral-600",
                    )}
                  >
                    {row.desc}
                  </p>
                </div>
                <ArrowRight
                  className={cn(
                    "mt-1 h-5 w-5 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0",
                    isDark ? "text-neutral-600 group-hover:text-neutral-300" : "text-neutral-400 group-hover:text-neutral-700",
                  )}
                  aria-hidden
                />
              </Link>
            ))}
          </div>
        </section>

        {/* Repo preview: tree + terminal (shadcn-style DX) */}
        <section className="mt-20 md:mt-28">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={reveal}
            className="mb-8 lg:max-w-2xl"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
              What lands in your editor
            </p>
            <h2
              className={cn(
                "mt-2 fs-syne text-2xl font-semibold tracking-tight md:text-3xl",
                isDark ? "text-white" : "text-neutral-900",
              )}
            >
              Files you own. Commands you already type.
            </h2>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-30px" }}
              variants={reveal}
              className={cn(
                "overflow-hidden rounded-xl border font-mono text-xs md:text-sm",
                isDark
                  ? "border-neutral-800 bg-neutral-950/80"
                  : "border-neutral-200 bg-white shadow-sm",
              )}
            >
              <div
                className={cn(
                  "flex items-center gap-2 border-b px-4 py-2.5",
                  isDark ? "border-neutral-800 bg-neutral-900/50" : "border-neutral-200 bg-neutral-50",
                )}
              >
                <span className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                </span>
                <span className={cn("ml-2 text-[10px] md:text-xs", isDark ? "text-neutral-500" : "text-neutral-500")}>
                  explorer — src
                </span>
              </div>
              <div className="space-y-0.5 p-4 leading-relaxed">
                <div className="flex items-center gap-2 text-neutral-500">
                  <Folder className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                  <span>app</span>
                </div>
                <div className="flex items-center gap-2 pl-3 text-neutral-500">
                  <Folder className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                  <span>components</span>
                </div>
                <div className="flex items-center gap-2 pl-6 text-neutral-500">
                  <Folder className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                  <span>ui</span>
                </div>
                <div
                  className={cn(
                    "flex items-center gap-2 border-l-2 py-0.5 pl-[1.35rem] pr-2",
                    isDark ? "border-violet-500 bg-violet-500/5" : "border-violet-600 bg-violet-50",
                  )}
                >
                  <FileText className="h-3.5 w-3.5 shrink-0 text-violet-500" aria-hidden />
                  <span className={isDark ? "text-violet-200" : "text-violet-900"}>
                    morphing-card-stack.tsx
                  </span>
                </div>
                <div className="flex items-center gap-2 pl-6 text-neutral-500">
                  <FileText className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
                  <span>aurora-background.tsx</span>
                </div>
                <div className="flex items-center gap-2 pl-6 text-neutral-500">
                  <FileText className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
                  <span>spotlight-card.tsx</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-30px" }}
              variants={reveal}
              className={cn(
                "overflow-hidden rounded-xl border font-mono text-xs md:text-sm",
                isDark
                  ? "border-neutral-800 bg-neutral-950/80"
                  : "border-neutral-200 bg-white shadow-sm",
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-between border-b px-4 py-2.5",
                  isDark ? "border-neutral-800 bg-neutral-900/50" : "border-neutral-200 bg-neutral-50",
                )}
              >
                <span className="flex items-center gap-2">
                  <Terminal className="h-3.5 w-3.5 opacity-70" aria-hidden />
                  <span className={isDark ? "text-neutral-400" : "text-neutral-600"}>
                    zsh
                  </span>
                </span>
              </div>
              <div className="p-4">
                <p className={isDark ? "text-neutral-500" : "text-neutral-500"}>
                  <span className="text-emerald-500/90" aria-hidden>
                    $
                  </span>{" "}
                  project
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <code
                    className={cn(
                      "rounded-md px-2 py-1.5 text-[11px] md:text-xs",
                      isDark ? "bg-black/50 text-neutral-200" : "bg-neutral-100 text-neutral-800",
                    )}
                  >
                    npx uniqueui add morphing-card-stack
                  </code>
                  <button
                    type="button"
                    onClick={copyAddCommand}
                    aria-label="Copy add command"
                    className={cn(
                      "inline-flex cursor-pointer items-center rounded-md border p-1.5 transition-colors duration-200 ease-out",
                      isDark
                        ? "border-neutral-700 hover:bg-neutral-800"
                        : "border-neutral-200 hover:bg-neutral-100",
                    )}
                  >
                    {copyAddCmd ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 opacity-70" />
                    )}
                  </button>
                </div>
                <p className={cn("mt-4 text-[11px] leading-relaxed", isDark ? "text-neutral-500" : "text-neutral-500")}>
                  Installs npm deps from the registry entry, writes the file under{" "}
                  <span className={isDark ? "text-neutral-400" : "text-neutral-700"}>
                    components/ui
                  </span>
                  , merges Tailwind keyframes when needed.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Honest comparison — inspired by productized dev marketing */}
        <section className="mt-20 md:mt-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={reveal}
            className="mb-6"
          >
            <h2
              className={cn(
                "fs-syne text-xl font-semibold tracking-tight md:text-2xl",
                isDark ? "text-white" : "text-neutral-900",
              )}
            >
              Where UniqueUI wins time
            </h2>
            <p
              className={cn(
                "mt-2 max-w-xl text-sm",
                isDark ? "text-neutral-500" : "text-neutral-600",
              )}
            >
              Not a feature matrix for procurement — a quick read for engineers
              deciding how to spend the afternoon.
            </p>
          </motion.div>
          <div
            className={cn(
              "overflow-x-auto rounded-xl border",
              isDark ? "border-neutral-800" : "border-neutral-200",
            )}
          >
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className={cn("border-b", isDark ? "border-neutral-800 bg-neutral-900/40" : "border-neutral-200 bg-neutral-50")}>
                  <th className="px-4 py-3 font-medium text-neutral-500"> </th>
                  <th className="px-4 py-3 font-medium text-neutral-500">Hand-rolled</th>
                  <th className="px-4 py-3 font-medium text-neutral-500">Heavy UI kit</th>
                  <th
                    className={cn(
                      "px-4 py-3 font-medium",
                      isDark ? "text-violet-300" : "text-violet-600",
                    )}
                  >
                    UniqueUI
                  </th>
                </tr>
              </thead>
              <tbody className={isDark ? "divide-neutral-800 divide-y" : "divide-neutral-200 divide-y"}>
                {[
                  ["Time to first spring hero", "Days–weeks", "Hours + lock-in", "Minutes"],
                  ["You keep the source", "Yes", "Often no", "Yes — pasted files"],
                  ["Motion style", "Whatever you write", "Kit defaults", "motion.dev springs"],
                ].map(([label, a, b, c]) => (
                  <tr key={String(label)} className={isDark ? "bg-neutral-950/30" : "bg-white"}>
                    <td className={cn("px-4 py-3 font-medium", isDark ? "text-neutral-300" : "text-neutral-800")}>
                      {label}
                    </td>
                    <td className="px-4 py-3 text-neutral-500">{a}</td>
                    <td className="px-4 py-3 text-neutral-500">{b}</td>
                    <td className={cn("px-4 py-3", isDark ? "text-emerald-400" : "text-emerald-700")}>{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Live materials — minimal chrome */}
        <section className="mt-20 md:mt-28">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={reveal}
            className="mb-8 lg:max-w-2xl"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
              Still interactive
            </p>
            <h2
              className={cn(
                "mt-2 fs-syne text-2xl font-semibold tracking-tight md:text-3xl",
                isDark ? "text-white" : "text-neutral-900",
              )}
            >
              Same primitives as inside your app.
            </h2>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-2">
            <SpotlightCard theme={theme} className="min-h-56 flex flex-col justify-center rounded-xl p-8 text-center md:min-h-64">
              <h3 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-neutral-900")}>
                Spotlight
              </h3>
              <p className={cn("mt-2 text-sm", isDark ? "text-neutral-400" : "text-neutral-600")}>
                Soft follow-light for heroes and pricing columns.
              </p>
            </SpotlightCard>
            <TiltCard
              theme={theme}
              className={cn(
                "flex min-h-56 flex-col justify-center rounded-xl border p-8 text-center md:min-h-64",
                isDark ? "border-neutral-800 bg-neutral-900/30" : "border-neutral-200 bg-neutral-50",
              )}
            >
              <h3 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-neutral-900")}>
                Tilt
              </h3>
              <p className={cn("mt-2 text-sm", isDark ? "text-neutral-400" : "text-neutral-600")}>
                Hover parallax with sane limits for trackpads.
              </p>
            </TiltCard>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/components"
              className={cn(
                "inline-flex cursor-pointer items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-colors duration-200 ease-out",
                isDark ? "bg-white text-black hover:bg-neutral-200" : "bg-neutral-900 text-white hover:bg-neutral-800",
              )}
            >
              Browse components
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/docs"
              className={cn(
                "inline-flex cursor-pointer items-center rounded-full border px-6 py-2.5 text-sm font-medium transition-colors duration-200 ease-out",
                isDark
                  ? "border-neutral-700 text-neutral-200 hover:bg-neutral-900"
                  : "border-neutral-300 text-neutral-800 hover:bg-neutral-50",
              )}
            >
              Documentation
            </Link>
          </div>
        </section>

        <footer className="mt-20 border-t pt-10 pb-8 md:mt-24">
          <div className="grid gap-10 md:grid-cols-[1.1fr_minmax(0,1fr)] md:gap-16">
            <div>
              <p
                className={cn(
                  "fs-syne text-2xl font-semibold tracking-tight",
                  isDark ? "text-white" : "text-neutral-900",
                )}
              >
                UniqueUI
              </p>
              <p
                className={cn(
                  "mt-3 max-w-sm text-sm leading-relaxed",
                  isDark ? "text-neutral-400" : "text-neutral-600",
                )}
              >
                Copy-paste React components with motion.dev craftsmanship — no
                theme runtime between you and the DOM.
              </p>
              <p
                className={cn(
                  "mt-6 inline-flex items-center gap-2 text-sm",
                  isDark ? "text-neutral-500" : "text-neutral-600",
                )}
              >
                <span>Built with</span>
                <Heart className="h-3.5 w-3.5 text-violet-500" aria-hidden strokeWidth={2} />
                <span>by</span>
                <a
                  href="https://github.com/pras75299"
                  className={cn(
                    "font-medium underline-offset-4 transition-colors hover:underline",
                    isDark ? "text-neutral-200 hover:text-white" : "text-neutral-900 hover:text-violet-700",
                  )}
                >
                  Prashant
                </a>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Product</p>
                <ul className="mt-3 space-y-2 text-sm">
                  <li>
                    <Link
                      href="/components"
                      className={cn(
                        "transition-colors duration-200 ease-out",
                        isDark ? "text-neutral-300 hover:text-white" : "text-neutral-700 hover:text-neutral-950",
                      )}
                    >
                      Components
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/docs"
                      className={cn(
                        "transition-colors duration-200 ease-out",
                        isDark ? "text-neutral-300 hover:text-white" : "text-neutral-700 hover:text-neutral-950",
                      )}
                    >
                      Docs
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/templates"
                      className={cn(
                        "transition-colors duration-200 ease-out",
                        isDark ? "text-neutral-300 hover:text-white" : "text-neutral-700 hover:text-neutral-950",
                      )}
                    >
                      Templates
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Source</p>
                <ul className="mt-3 space-y-2 text-sm">
                  <li>
                    <a
                      href="https://github.com/pras75299/uniqueui"
                      className={cn(
                        "transition-colors duration-200 ease-out",
                        isDark ? "text-neutral-300 hover:text-white" : "text-neutral-700 hover:text-neutral-950",
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GitHub
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://twitter.com"
                      className={cn(
                        "transition-colors duration-200 ease-out",
                        isDark ? "text-neutral-300 hover:text-white" : "text-neutral-700 hover:text-neutral-950",
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Twitter
                    </a>
                  </li>
                </ul>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Quick start</p>
                <pre
                  className={cn(
                    "mt-3 overflow-x-auto rounded-lg border px-3 py-2.5 font-mono text-[11px] leading-relaxed",
                    isDark ? "border-neutral-800 bg-black/50 text-neutral-300" : "border-neutral-200 bg-neutral-50 text-neutral-800",
                  )}
                >
                  <code>npx uniqueui init</code>
                </pre>
              </div>
            </div>
          </div>
        </footer>
        </div>
      </div>
    </motion.main>
  );
}
