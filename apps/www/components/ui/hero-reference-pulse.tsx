"use client";

import type { ComponentProps, ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const DEFAULT_PULSE_COLOR = "hsla(268, 95%, 70%, 0.45)";

/** Build halo stops from a single hue (used when `conicPalette` is omitted). */
function conicPaletteFromHue(hue: number): string[] {
  return [
    `hsla(${hue}, 95%, 62%, 0.55)`,
    `hsla(${hue + 60}, 95%, 60%, 0.35)`,
    `hsla(${hue - 40}, 95%, 60%, 0.55)`,
    `hsla(${hue}, 95%, 62%, 0.55)`,
  ];
}

type ReferencePulseBackgroundProps = ComponentProps<"div"> & {
  /**
   * Hue in degrees — generates the conic halo when `conicPalette` is omitted.
   * Prefer explicit `conicPalette` stops in docs / copy-paste examples.
   */
  hue?: number;
  /** Pulse cycle in seconds. Lower = faster heartbeat. */
  speed?: number;
  /** Dark vignette / section base (e.g. `#08080a`). */
  baseColor?: string;
  /** Rotating conic-gradient halo stops (violet / magenta / blue by default). */
  conicPalette?: ReadonlyArray<string>;
  /** Radial pulse glow at center. */
  pulseColor?: string;
};

export function ReferencePulseBackground({
  hue = 268,
  speed = 7,
  baseColor = "#08080a",
  conicPalette,
  pulseColor = DEFAULT_PULSE_COLOR,
  className,
  style,
  ...rest
}: ReferencePulseBackgroundProps) {
  const reduced = useReducedMotion();
  // Clamp speed defensively — negative or non-finite values would yield invalid durations.
  const safeSpeed = Number.isFinite(speed) && speed > 0 ? speed : 0;
  const cycle = reduced ? 0 : safeSpeed;
  // `??` only fires on null/undefined — an empty array would yield
  // `conic-gradient(from 0deg, )`, which is invalid CSS. Treat an empty array
  // as "no palette supplied" and fall back to the hue-derived stops.
  const resolvedConic =
    conicPalette && conicPalette.length > 0 ? conicPalette : conicPaletteFromHue(hue);
  const conicGradient = `conic-gradient(from 0deg, ${resolvedConic.join(", ")})`;

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={style}
      {...rest}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, rgba(10,10,12,0) 0%, ${baseColor} 72%)`,
        }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-[120vmax] w-[120vmax] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: conicGradient,
          filter: "blur(80px)",
        }}
        initial={false}
        animate={cycle ? { rotate: 360 } : { rotate: 0 }}
        transition={cycle ? { duration: cycle * 4, ease: "linear", repeat: Infinity } : undefined}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: `radial-gradient(circle at center, ${pulseColor}, transparent 65%)`,
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

function DefaultPulseContent() {
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
