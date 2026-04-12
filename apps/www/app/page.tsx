"use client";

import { motion, Variants } from "motion/react";
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
  Layers,
  ScrollText,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  MorphingCardStack,
  type CardData,
} from "@/components/ui/morphing-card-stack";
import { PenCursor } from "@/components/ui/pen-cursor";
import { InteractiveCursor } from "@/components/ui/interactive-cursor";

export default function Home() {
  const [copied, setCopied] = useState(false);
  const playgroundCardRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

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

      {/* Interactive Global Cursor Demo */}
      <InteractiveCursor 
        hideSystemCursor={false} // keeping default true can be annoying for docs
        clickColor={isDark ? "#b280ff" : "#8b5cf6"}
        color={isDark ? "#a855f7" : "#7c3aed"}
        trailColor={isDark ? "rgba(168, 85, 247, 0.4)" : "rgba(124, 58, 237, 0.3)"}
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
                "font-semibold transition-colors",
                isDark
                  ? "text-white hover:text-purple-400"
                  : "text-neutral-900 hover:text-purple-600",
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

      {/* Social proof */}
      <section className="w-full max-w-6xl px-4 relative z-10 mt-20">
        <div
          className={cn(
            "flex flex-col md:flex-row md:items-center md:justify-between gap-6 rounded-2xl border px-5 py-6 md:px-8 md:py-7",
            isDark
              ? "border-neutral-800 bg-neutral-950/60"
              : "border-purple-100/70 bg-white/90 shadow-lg shadow-purple-100/40",
          )}
        >
          <div>
            <p
              className={cn(
                "text-xs font-medium uppercase tracking-[0.18em] mb-2",
                isDark ? "text-neutral-400" : "text-neutral-600",
              )}
            >
              Trusted building blocks
            </p>
            <p
              className={cn(
                "text-sm md:text-base",
                isDark ? "text-neutral-400" : "text-neutral-600",
              )}
            >
              Designed for production teams who care about motion, craft, and
              copy‑paste speed.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-xs md:text-sm">
            <div className="flex flex-col">
              <span className="font-semibold">Dozens</span>
              <span
                className={cn(isDark ? "text-neutral-500" : "text-neutral-600")}
              >
                of animated components
              </span>
            </div>
            <div className="h-10 w-px bg-linear-to-b from-transparent via-neutral-500/30 to-transparent" />
            <div className="flex flex-col">
              <span className="font-semibold">Motion‑first</span>
              <span
                className={cn(isDark ? "text-neutral-500" : "text-neutral-600")}
              >
                built on motion.dev springs
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Component strip */}
      <section className="w-full max-w-6xl px-4 relative z-10 mt-20 space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold">
              Component gallery
            </h2>
            <p
              className={cn(
                "mt-2 text-sm md:text-base max-w-xl",
                isDark ? "text-neutral-400" : "text-neutral-700",
              )}
            >
              A curated set of motion‑rich components
            </p>
          </div>
          <Link
            href="/components"
            className={cn(
              "hidden md:inline-flex text-sm items-center gap-1 font-medium",
              isDark
                ? "text-purple-300 hover:text-purple-200"
                : "text-purple-700 hover:text-purple-600",
            )}
          >
            Browse all components
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            theme={theme}
            title="Aurora hero"
            description="Gradient‑driven hero layout with floating aurora background and layered depth."
            icon={<Sparkles className="w-6 h-6" />}
          />
          <Card
            theme={theme}
            title="Morphing stack"
            description="Interactive card stack that morphs between layouts with springs."
            icon={<Layers className="w-6 h-6" />}
          />
          <Card
            theme={theme}
            title="Spotlight cards"
            description="Cards that track your cursor with soft, cinematic lighting."
            icon={<Ghost className="w-6 h-6" />}
          />
        </div>
      </section>

      {/* How it works */}
      <section className="w-full max-w-6xl px-4 relative z-10 mt-24 space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-2xl md:text-3xl font-semibold">
            How UniqueUI fits your stack
          </h2>
          <p
            className={cn(
              "max-w-2xl mx-auto text-sm md:text-base",
              isDark ? "text-neutral-400" : "text-neutral-600",
            )}
          >
            From install to customization in three steps. No design system
            overhaul, just focused drops of motion where it matters.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card
            theme={theme}
            title="1 · Install the CLI"
            description="Run `npx uniqueui init` once in your project to set up the generator and base styles."
            icon={<Terminal className="w-6 h-6" />}
          />
          <Card
            theme={theme}
            title="2 · Add components"
            description="Use `npx uniqueui add <component>` to drop in animated sections as single‑file React components."
            icon={<ScrollText className="w-6 h-6" />}
          />
          <Card
            theme={theme}
            title="3 · Tune the details"
            description="Edit Tailwind classes and motion.dev props to match your brand without touching low‑level motion."
            icon={<Sparkles className="w-6 h-6" />}
          />
        </div>
      </section>

      {/* Motion-rich preview band */}
      <section className="w-full max-w-6xl px-4 relative z-10 mt-24 mb-28 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <SpotlightCard
            theme={theme}
            className="h-64 flex flex-col justify-center items-center text-center"
          >
            <h3 className="text-2xl font-semibold mb-2">Spotlight hero</h3>
            <p className={isDark ? "text-neutral-400" : "text-neutral-700"}>
              Layer spotlight, gradients, and depth to turn any heading into a
              centerpiece.
            </p>
          </SpotlightCard>

          <TiltCard
            theme={theme}
            className={cn(
              "h-64 p-8 flex flex-col justify-center items-center text-center border",
              isDark
                ? "bg-neutral-900/50 border-neutral-800"
                : "bg-linear-to-br from-white/95 via-purple-50/70 to-sky-50/80 border-purple-100",
            )}
          >
            <h3 className="text-2xl font-semibold mb-2">3D tilt cards</h3>
            <p className={isDark ? "text-neutral-400" : "text-neutral-600"}>
              Parallax hover interactions that respect motion preferences and
              keep performance snappy.
            </p>
          </TiltCard>
        </div>

        <div className="flex justify-center mt-6">
          <Link
            href="/components"
            className={cn(
              "focus:outline-none focus:ring-2 focus:ring-offset-2",
              isDark
                ? "focus:ring-slate-400 focus:ring-offset-slate-50"
                : "focus:ring-slate-500 focus:ring-offset-white",
            )}
          >
            <div className="group relative inline-flex h-12 overflow-hidden rounded-full p-px">
              <motion.span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
              <motion.span
                className={cn(
                  "inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full px-8 py-1 text-sm font-medium backdrop-blur-3xl transition-colors",
                  isDark
                    ? "bg-slate-950 text-white hover:bg-slate-900"
                    : "bg-white text-slate-900 hover:bg-slate-100",
                )}
              >
                Explore all components
              </motion.span>
            </div>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-5xl mt-12 mb-16 px-4 relative z-10">
        <div
          className={cn(
            "border-t pt-8 text-center text-sm",
            isDark
              ? "border-neutral-800 text-neutral-500"
              : "border-neutral-200 text-neutral-600",
          )}
        >
          <p>
            Built with ❤️ by{" "}
            <a
              href="https://github.com/pras75299"
              className={cn(
                "transition-colors",
                isDark
                  ? "text-neutral-300 hover:text-white"
                  : "text-neutral-700 hover:text-neutral-900",
              )}
            >
              Prashant
            </a>
          </p>
          <div className="mt-4 flex justify-center gap-6">
            <Link
              href="/components"
              className={cn(
                "transition-colors",
                isDark ? "hover:text-white" : "hover:text-neutral-900",
              )}
            >
              Components
            </Link>
            <Link
              href="/docs"
              className={cn(
                "transition-colors",
                isDark ? "hover:text-white" : "hover:text-neutral-900",
              )}
            >
              Docs
            </Link>
            <Link
              href="/templates"
              className={cn(
                "transition-colors",
                isDark ? "hover:text-white" : "hover:text-neutral-900",
              )}
            >
              Templates
            </Link>
            <a
              href="https://github.com/pras75299/uniqueui"
              className={cn(
                "transition-colors",
                isDark ? "hover:text-white" : "hover:text-neutral-900",
              )}
            >
              GitHub
            </a>
            <a
              href="https://twitter.com"
              className={cn(
                "transition-colors",
                isDark ? "hover:text-white" : "hover:text-neutral-900",
              )}
            >
              Twitter
            </a>
          </div>
        </div>
      </footer>
    </motion.main>
  );
}

/* ─── Feature Card ─── */
function Card({
  title,
  description,
  icon,
  theme = "dark",
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  theme?: "light" | "dark";
}) {
  const isDark = theme === "dark";
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={cn(
        "group rounded-lg border px-5 py-8 transition-colors shadow-sm",
        isDark
          ? "border-neutral-800 bg-neutral-950/50 hover:border-neutral-700 hover:bg-neutral-900/50"
          : "border-neutral-200 bg-white hover:border-purple-200 hover:bg-purple-50/40",
      )}
    >
      <div
        className={cn(
          "mb-4 inline-block rounded-lg p-3",
          isDark
            ? "bg-neutral-900 text-neutral-200 group-hover:text-white"
            : "bg-neutral-100 text-neutral-700 group-hover:text-neutral-900",
        )}
      >
        {icon}
      </div>
      <h2 className="mb-3 text-2xl font-semibold">
        {title}{" "}
        <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
          -&gt;
        </span>
      </h2>
      <p
        className={cn(
          "m-0 max-w-[30ch] text-sm",
          isDark ? "opacity-50" : "text-neutral-600",
        )}
      >
        {description}
      </p>
    </motion.div>
  );
}
