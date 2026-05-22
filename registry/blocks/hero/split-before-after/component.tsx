"use client";

import type { ComponentProps, ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Split-screen "before / after" hero.
 *
 * Left half is the problem state — desaturated, muted, paused. Right half
 * is the solution — saturated, animated, glowing. Both halves enter
 * together with a small stagger and a vertical hairline divider that draws
 * in from the center as the seam between them.
 *
 * Why two slots instead of pre-baked content: real customers want to put
 * their own copy or screenshots in each half. The pre-defined "before/after"
 * content is a fallback only.
 */

type Side = "before" | "after";

type SplitHalfProps = {
  side: Side;
  children: ReactNode;
  className?: string;
};

function SplitHalf({ side, children, className }: SplitHalfProps) {
  const reduced = useReducedMotion();
  const isBefore = side === "before";
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, x: isBefore ? -16 : 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={
        reduced
          ? { duration: 0.2 }
          : {
              type: "spring",
              stiffness: 120,
              damping: 22,
              delay: isBefore ? 0.05 : 0.18,
            }
      }
      className={cn(
        "relative flex min-h-[50svh] flex-col items-center justify-center gap-6 p-10 sm:min-h-[100svh] sm:p-16",
        isBefore
          // Before: desaturated, cool gray, no glow
          ? "bg-[#101012] text-white/55 [filter:saturate(0.4)]"
          // After: saturated, accent glow
          : "bg-[#0a0a0a] text-white",
        className,
      )}
    >
      {/* Subtle background flourish on the "after" side only.
          A radial wash drifts behind content — never animated cursor-tracking
          because halves often appear side-by-side on a single page and one
          listener per hero is plenty. */}
      {!isBefore ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-0 bg-[radial-gradient(circle_at_50%_60%,rgba(168,85,247,0.18)_0%,transparent_55%)]"
        />
      ) : null}
      {children}
    </motion.div>
  );
}

type SplitBeforeAfterHeroProps = Omit<ComponentProps<"section">, "children"> & {
  /** Left-half content. If omitted, a placeholder "before" composition is rendered. */
  before?: ReactNode;
  /** Right-half content. If omitted, a placeholder "after" composition is rendered. */
  after?: ReactNode;
  /** Override classes for the left half only. */
  beforeClassName?: string;
  /** Override classes for the right half only. */
  afterClassName?: string;
};

export function SplitBeforeAfterHero({
  before,
  after,
  beforeClassName,
  afterClassName,
  className,
  ...rest
}: SplitBeforeAfterHeroProps) {
  const reduced = useReducedMotion();
  return (
    <section
      {...rest}
      className={cn(
        "relative isolate grid w-full grid-cols-1 overflow-hidden sm:grid-cols-2",
        className,
      )}
    >
      <SplitHalf side="before" className={beforeClassName}>
        {before ?? <DefaultBefore />}
      </SplitHalf>
      <SplitHalf side="after" className={afterClassName}>
        {after ?? <DefaultAfter />}
      </SplitHalf>

      {/* Center seam — draws in from middle outward on mount. Hidden on stacked
          mobile layout where the two halves are vertically arranged. */}
      <motion.span
        aria-hidden
        initial={reduced ? { opacity: 1 } : { scaleY: 0, opacity: 0 }}
        animate={reduced ? { opacity: 1 } : { scaleY: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px origin-center bg-gradient-to-b from-transparent via-white/30 to-transparent sm:block"
      />
    </section>
  );
}

function DefaultBefore() {
  return (
    <div className="relative z-10 max-w-md text-center">
      <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
        <span className="h-1.5 w-1.5 rounded-full bg-white/40" aria-hidden />
        Before
      </span>
      <h2 className="text-balance text-3xl font-semibold tracking-tight text-white/70 sm:text-4xl">
        Generic, undifferentiated UI.
      </h2>
      <p className="mt-4 text-pretty text-sm text-white/45 sm:text-base">
        Default templates, default animations, default everything. Your
        product is hard to remember after the demo.
      </p>
    </div>
  );
}

function DefaultAfter() {
  return (
    <div className="relative z-10 max-w-md text-center">
      <motion.span
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32, type: "spring", stiffness: 140, damping: 18 }}
        className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-300/30 bg-purple-300/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-purple-200"
      >
        <span
          className="h-1.5 w-1.5 rounded-full bg-purple-300 shadow-[0_0_10px_2px_rgba(216,180,254,0.6)]"
          aria-hidden
        />
        After
      </motion.span>
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 130, damping: 18 }}
        className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
      >
        UI your customers screenshot.
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 130, damping: 18 }}
        className="mt-4 text-pretty text-sm text-white/75 sm:text-base"
      >
        Motion-first components copy-pasted into your repo. You own the code,
        and the surface looks like nobody else&apos;s.
      </motion.p>
    </div>
  );
}
