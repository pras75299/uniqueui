"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const DEFAULT_FOIL_PALETTE = [
  "#ff9bd1",
  "#ffd66b",
  "#9bffd6",
  "#6bb5ff",
  "#c89bff",
  "#ff9bd1",
] as const;

type IridescentSweepBackgroundProps = {
  className?: string;
  /** Conic-gradient rotation cycle in seconds. */
  speed?: number;
  /** Hue offset in degrees — shifts the whole foil. */
  hue?: number;
  /** Grain intensity 0–1. */
  grain?: number;
  /** Section / vignette base (e.g. `#0e0a14`). */
  baseColor?: string;
  /** Holographic foil stops for the rotating conic gradient. */
  palette?: ReadonlyArray<string>;
};

export function IridescentSweepBackground({
  className,
  speed = 22,
  hue = 0,
  grain = 0.35,
  baseColor = "#0e0a14",
  palette = DEFAULT_FOIL_PALETTE,
}: IridescentSweepBackgroundProps) {
  const reduced = useReducedMotion();
  // Clamp speed defensively — negative or non-finite values would yield invalid durations.
  const safeSpeed = Number.isFinite(speed) && speed > 0 ? speed : 0;
  const cycle = reduced ? 0 : safeSpeed;
  const filterId = useId();
  // Default-only fires on undefined; treat an explicit empty array as "no
  // palette" so `palette.join(", ")` can't produce an invalid `conic-gradient(...)`.
  const resolvedPalette =
    palette && palette.length > 0 ? palette : DEFAULT_FOIL_PALETTE;

  return (
    <div
      aria-hidden
      className={cn("absolute inset-0 overflow-hidden", className)}
      style={{ backgroundColor: baseColor, filter: `hue-rotate(${hue}deg)` }}
    >
      <svg className="absolute -z-10 h-0 w-0" aria-hidden>
        <filter id={filterId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.7 0" />
        </filter>
      </svg>

      <motion.div
        className="absolute inset-[-20%]"
        style={{
          background: `conic-gradient(from 0deg at 50% 50%, ${resolvedPalette.join(", ")})`,
          filter: "blur(60px) saturate(1.4)",
          mixBlendMode: "screen",
          opacity: 0.85,
        }}
        // Anchor `initial` to 0deg — motion v12 skips repeat:Infinity loops if SSR bakes in the target frame.
        initial={{ rotate: 0 }}
        animate={cycle ? { rotate: 360 } : { rotate: 0 }}
        transition={cycle ? { duration: cycle, ease: "linear", repeat: Infinity } : undefined}
      />
      <motion.div
        className="absolute inset-[-10%]"
        style={{
          background:
            "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.35) 45%, transparent 60%)",
          mixBlendMode: "overlay",
        }}
        initial={{ x: "-60%" }}
        animate={cycle ? { x: "60%" } : { x: "0%" }}
        transition={cycle ? { duration: 6, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.4 } : undefined}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, transparent 30%, ${baseColor} 92%)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 mix-blend-overlay"
        style={{ filter: `url(#${filterId})`, opacity: grain }}
      >
        <div className="absolute inset-0 bg-white/30" />
      </div>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(0deg, rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
    </div>
  );
}

type IridescentSweepHeroProps = Omit<ComponentProps<"section">, "children"> & {
  children?: ReactNode;
  backgroundProps?: IridescentSweepBackgroundProps;
};

export function IridescentSweepHero({
  children,
  className,
  backgroundProps,
  ...rest
}: IridescentSweepHeroProps) {
  return (
    <section
      {...rest}
      className={cn(
        "relative isolate flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-[#0e0a14] text-white",
        className,
      )}
    >
      <IridescentSweepBackground {...backgroundProps} />
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        {children ?? <DefaultSweepContent />}
      </div>
    </section>
  );
}

function DefaultSweepContent() {
  return (
    <>
      <motion.span
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.06, type: "spring", stiffness: 140, damping: 22 }}
        className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/85 backdrop-blur"
      >
        <FoilDot />
        Edition · MMXXVI
      </motion.span>
      <FoilHeadline text="Pressed in light." />
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.42, type: "spring", stiffness: 120, damping: 18 }}
        className="mt-5 max-w-xl text-pretty text-base text-white/75 sm:text-lg"
      >
        Conic foil under a turbulence grain, with a sheen that sweeps across
        the type on a slow cadence. Editorial energy, zero plug-ins.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.54, type: "spring", stiffness: 120, damping: 18 }}
        className="mt-9 flex flex-wrap items-center justify-center gap-3"
      >
        <button
          type="button"
          className="group inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-medium text-neutral-900 transition-transform duration-200 hover:-translate-y-px"
        >
          <span>Reserve a copy</span>
          <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
            →
          </span>
        </button>
        <button
          type="button"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-white/25 px-6 text-sm font-medium text-white/90 backdrop-blur transition-colors hover:bg-white/10"
        >
          Read the editorial
        </button>
      </motion.div>
    </>
  );
}

function FoilDot() {
  return (
    <span
      aria-hidden
      className="h-1.5 w-1.5 rounded-full"
      style={{
        background:
          "conic-gradient(from 0deg, #ff9bd1, #ffd66b, #9bffd6, #6bb5ff, #c89bff, #ff9bd1)",
        boxShadow: "0 0 12px 2px rgba(255,255,255,0.4)",
      }}
    />
  );
}

function FoilHeadline({ text }: { text: string }) {
  return (
    <h1 className="relative inline-block text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
      <span
        className="bg-clip-text text-transparent"
        style={{
          backgroundImage:
            "linear-gradient(120deg, #ffffff 0%, #f5e6ff 28%, #ffe9c2 50%, #c8f1ff 72%, #ffffff 100%)",
        }}
      >
        {text}
      </span>
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-clip-text text-transparent"
        style={{
          backgroundImage:
            "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.95) 50%, transparent 70%)",
          backgroundSize: "200% 100%",
        }}
        initial={{ backgroundPositionX: "120%" }}
        animate={{ backgroundPositionX: "-20%" }}
        transition={{ delay: 0.3, duration: 1.6, ease: "easeOut" }}
      >
        {text}
      </motion.span>
    </h1>
  );
}
