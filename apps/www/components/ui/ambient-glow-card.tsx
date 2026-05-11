"use client";

import {
  useId,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

const SAFE_CSS_COLOR =
  /^(?:#[0-9a-fA-F]{3,8}|rgba?\([\d.,\s%/]+\)|hsla?\([\d.,\s%deg/]+\)|oklch\([\d.,\s%/]+\)|[a-zA-Z]+)$/;

function safeColor(input: string, fallback: string): string {
  const trimmed = input.trim();
  return SAFE_CSS_COLOR.test(trimmed) ? trimmed : fallback;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Four corner anchor positions (% of card) the blob drifts through, returning to the first. */
const CORNERS_X = ["22%", "82%", "78%", "20%", "22%"] as const;
const CORNERS_Y = ["20%", "22%", "78%", "80%", "20%"] as const;
const CORNER_KEYFRAME_TIMES = [0, 0.25, 0.5, 0.75, 1] as const;

const DEFAULT_BLOB_STOPS: readonly [string, string, string] = [
  "rgb(255, 170, 200)",
  "rgb(255, 130, 165)",
  "rgb(255, 200, 200)",
];

export type AmbientGlowCardProps = Omit<
  ComponentPropsWithoutRef<"article">,
  "children"
> & {
  /** Card body — pass standard JSX (heading + paragraph). Headings inside pick up sensible tracking and colour; the font family is inherited from your page. */
  children: ReactNode;
  /**
   * Blob accent colour. Pass a single CSS colour (hex / rgb / oklch / named) for a
   * one-stop wash, or a tuple of three stops for a richer gradient. Defaults to
   * a warm pink that matches the reference.
   */
  blobColor?: string | readonly [string, string, string];
  /** Optional surface colour; omit for theme-aware neutral-100 / neutral-900. */
  cardBackground?: string;
  /**
   * Seconds for one full drift cycle through the four corners. Clamped to 6–120.
   * @default 24
   */
  animationDuration?: number;
  /** Disable drift (`prefers-reduced-motion` always disables regardless). */
  motionDisabled?: boolean;
  /** Inner padding scale. @default "md" */
  padding?: "sm" | "md" | "lg";
  /** SVG film-grain overlay. @default true */
  showNoise?: boolean;
  /** Minimum height when content is short. @default "13rem" */
  minHeight?: string;
};

const SHELL_BASE =
  "relative isolate flex h-full w-full flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-neutral-100 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.6),0_1px_2px_0_rgb(0_0_0/0.04)] dark:border-neutral-800/80 dark:bg-neutral-900 dark:shadow-[inset_0_1px_0_0_rgb(255_255_255/0.04),0_2px_8px_0_rgb(0_0_0/0.35)]";

/** Applies sensible defaults to headings dropped inside the card — colour, tracking, balance — without overriding the consumer's font family. `:where()` keeps specificity at 0 so any class the consumer adds still wins. */
const HEADING_STYLES =
  "[&_:where(h1,h2,h3,h4,h5,h6)]:tracking-tight [&_:where(h1,h2,h3,h4,h5,h6)]:text-balance [&_:where(h1,h2,h3,h4,h5,h6)]:text-neutral-900 dark:[&_:where(h1,h2,h3,h4,h5,h6)]:text-neutral-50";

const BODY_STYLES =
  "[&_p]:text-pretty [&_p]:max-w-prose [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-neutral-600 sm:[&_p]:text-base dark:[&_p]:text-neutral-400";

const PADDING_CLASS = {
  sm: "p-5 sm:p-6",
  md: "p-6 sm:p-8",
  lg: "p-8 sm:p-10",
} as const;

function resolveStops(
  input: AmbientGlowCardProps["blobColor"],
): { gradient: string } {
  if (typeof input === "string") {
    const c = safeColor(input, DEFAULT_BLOB_STOPS[0]);
    return {
      gradient: `radial-gradient(circle at 50% 50%, ${c} 0%, ${c} 30%, transparent 72%)`,
    };
  }
  const stops = input ?? DEFAULT_BLOB_STOPS;
  const c0 = safeColor(stops[0], DEFAULT_BLOB_STOPS[0]);
  const c1 = safeColor(stops[1], DEFAULT_BLOB_STOPS[1]);
  const c2 = safeColor(stops[2], DEFAULT_BLOB_STOPS[2]);
  return {
    gradient: `radial-gradient(circle at 50% 50%, ${c0} 0%, ${c1} 30%, ${c2} 55%, transparent 75%)`,
  };
}

function DriftingBlob({
  gradient,
  duration,
  motionOn,
}: {
  gradient: string;
  duration: number;
  motionOn: boolean;
}) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute z-0 h-[85%] w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-90 blur-3xl will-change-transform mix-blend-multiply dark:opacity-100 dark:mix-blend-screen"
      style={
        {
          background: gradient,
          left: motionOn ? undefined : CORNERS_X[0],
          top: motionOn ? undefined : CORNERS_Y[0],
        } as CSSProperties
      }
      animate={
        motionOn
          ? {
              left: [...CORNERS_X],
              top: [...CORNERS_Y],
            }
          : undefined
      }
      transition={
        motionOn
          ? {
              duration,
              repeat: Infinity,
              ease: [0.45, 0.05, 0.55, 0.95],
              times: [...CORNER_KEYFRAME_TIMES],
            }
          : undefined
      }
    />
  );
}

function GrainOverlay({ filterId }: { filterId: string }) {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1] h-full w-full rounded-[inherit] opacity-[0.09] mix-blend-overlay dark:opacity-[0.06]"
    >
      <defs>
        <filter
          id={filterId}
          x="-5%"
          y="-5%"
          width="110%"
          height="110%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            stitchTiles="stitch"
            result="n"
          />
          <feColorMatrix in="n" type="saturate" values="0" result="g" />
          <feComponentTransfer in="g">
            <feFuncA type="linear" slope="0.55" intercept="0" />
          </feComponentTransfer>
        </filter>
      </defs>
      <rect width="100%" height="100%" filter={`url(#${filterId})`} />
    </svg>
  );
}

/**
 * **AmbientGlowCard** — a single self-contained marketing tile.
 *
 * Drops into any column / grid cell at `w-full h-full`; renders a soft radial-gradient
 * **blob** that slowly drifts between the four corners while your `children` sit on
 * top. Pass any JSX inside — headings inherit the page font and pick up sensible
 * tracking and colour; paragraphs get muted body styling.
 *
 * - `blobColor`: single colour string **or** `[stop0, stop1, stop2]` tuple.
 * - `animationDuration`: seconds per full corner loop (clamped 6–120, default 24).
 * - `motionDisabled` + `prefers-reduced-motion`: either pins the blob to a single corner.
 */
export function AmbientGlowCard({
  children,
  blobColor = DEFAULT_BLOB_STOPS,
  cardBackground,
  animationDuration = 24,
  motionDisabled = false,
  padding = "md",
  showNoise = true,
  minHeight = "13rem",
  className,
  style,
  ...rest
}: AmbientGlowCardProps) {
  const rawId = useId();
  const grainId = `agc-grain-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const { gradient } = resolveStops(blobColor);
  const duration = clamp(animationDuration, 6, 120);

  const reduce = useReducedMotion();
  const motionOn = !motionDisabled && !reduce;

  const surface = cardBackground ? safeColor(cardBackground, "") : "";
  const hasCustomSurface = surface.length > 0;
  const composedStyle: CSSProperties = {
    minHeight,
    ...(hasCustomSurface ? { backgroundColor: surface } : null),
    ...style,
  };

  return (
    <article
      {...rest}
      className={cn(SHELL_BASE, HEADING_STYLES, BODY_STYLES, className)}
      style={composedStyle}
    >
      <DriftingBlob gradient={gradient} duration={duration} motionOn={motionOn} />

      {showNoise ? <GrainOverlay filterId={grainId} /> : null}

      <div
        className={cn(
          "relative z-10 mt-auto flex flex-col justify-end gap-2",
          PADDING_CLASS[padding],
        )}
      >
        {children}
      </div>
    </article>
  );
}
