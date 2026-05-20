"use client";

import type { ComponentProps, ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type ReferencePulseBackgroundProps = ComponentProps<"div"> & {
  /** Hue rotation in degrees applied to the layered gradients. */
  hue?: number;
  /** Pulse cycle in seconds. Lower = faster heartbeat. */
  speed?: number;
};

export function ReferencePulseBackground({
  hue = 268,
  speed = 7,
  className,
  style,
  ...rest
}: ReferencePulseBackgroundProps) {
  const reduced = useReducedMotion();
  // Clamp speed defensively — negative or non-finite values would yield invalid durations.
  const safeSpeed = Number.isFinite(speed) && speed > 0 ? speed : 0;
  const cycle = reduced ? 0 : safeSpeed;

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{ ["--rp-hue" as string]: `${hue}deg`, ...style }}
      {...rest}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(10,10,12,0)_0%,_#08080a_72%)]" />
      <motion.div
        className="absolute left-1/2 top-1/2 h-[120vmax] w-[120vmax] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, hsl(var(--rp-hue) 95% 62% / 0.55), hsl(calc(var(--rp-hue) + 60deg) 95% 60% / 0.35), hsl(calc(var(--rp-hue) - 40deg) 95% 60% / 0.55), hsl(var(--rp-hue) 95% 62% / 0.55))",
          filter: "blur(80px)",
        }}
        initial={false}
        animate={cycle ? { rotate: 360 } : { rotate: 0 }}
        transition={cycle ? { duration: cycle * 4, ease: "linear", repeat: Infinity } : undefined}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle at center, hsl(var(--rp-hue) 95% 70% / 0.45), transparent 65%)",
          filter: "blur(40px)",
        }}
        initial={{ scale: 0.85, opacity: 0.7 }}
        animate={cycle ? { scale: [0.85, 1.05, 0.85], opacity: [0.65, 0.95, 0.65] } : { scale: 1, opacity: 0.85 }}
        transition={cycle ? { duration: cycle, ease: "easeInOut", repeat: Infinity } : undefined}
      />
      <div
        className="absolute inset-0 mix-blend-overlay opacity-[0.18]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)",
          backgroundSize: "3px 3px",
        }}
      />
    </div>
  );
}

type ReferencePulseHeroProps = Omit<ComponentProps<"section">, "children"> & {
  children?: ReactNode;
  backgroundProps?: ReferencePulseBackgroundProps;
};

export function ReferencePulseHero({
  children,
  className,
  backgroundProps,
  ...rest
}: ReferencePulseHeroProps) {
  return (
    <section
      {...rest}
      className={cn(
        "relative isolate flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-[#08080a] text-white",
        className,
      )}
    >
      <ReferencePulseBackground {...backgroundProps} />
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        {children ?? <DefaultPulseContent />}
      </div>
    </section>
  );
}

export function DefaultPulseContent() {
  return (
    <>
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, type: "spring", stiffness: 120, damping: 18 }}
        className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/70 backdrop-blur"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-white/80" aria-hidden />
        Hero block
      </motion.span>
      <motion.h1
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, type: "spring", stiffness: 110, damping: 18 }}
        className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl"
      >
        Build with light, not boxes.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, type: "spring", stiffness: 110, damping: 18 }}
        className="mt-5 max-w-xl text-pretty text-base text-white/65 sm:text-lg"
      >
        A reference hero block. Drop in your own children to override the default
        composition — the background lives on its own as well.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32, type: "spring", stiffness: 110, damping: 18 }}
        className="mt-9 flex flex-wrap items-center justify-center gap-3"
      >
        <button
          type="button"
          className="group relative inline-flex h-11 items-center gap-2 overflow-hidden rounded-full bg-white px-6 text-sm font-medium text-black transition-transform duration-200 hover:-translate-y-px"
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
          Read docs
        </button>
      </motion.div>
    </>
  );
}
