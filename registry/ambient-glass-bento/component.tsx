"use client";

import {
  useId,
  type ComponentPropsWithoutRef,
  type CSSProperties,
} from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

const SAFE_CSS_COLOR =
  /^(?:#[0-9a-fA-F]{3,8}|rgba?\([\d.,\s%/]+\)|hsla?\([\d.,\s%deg/]+\)|oklch\([\d.,\s%/]+\)|[a-zA-Z]+)$/;

function safeColor(input: string, fallback: string): string {
  const t = input.trim();
  return SAFE_CSS_COLOR.test(t) ? t : fallback;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

const SPAN_CLASS: Record<number, string> = {
  1: "md:col-span-1",
  2: "md:col-span-2",
  3: "md:col-span-3",
  4: "md:col-span-4",
  5: "md:col-span-5",
  6: "md:col-span-6",
  7: "md:col-span-7",
  8: "md:col-span-8",
  9: "md:col-span-9",
  10: "md:col-span-10",
  11: "md:col-span-11",
  12: "md:col-span-12",
};

const COLS_CLASS: Record<number, string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
  6: "md:grid-cols-6",
  7: "md:grid-cols-7",
  8: "md:grid-cols-8",
  9: "md:grid-cols-9",
  10: "md:grid-cols-10",
  11: "md:grid-cols-11",
  12: "md:grid-cols-12",
};

export type AmbientGlassBentoItem = {
  /** Primary heading (plain text). */
  title: string;
  /** Supporting copy (plain text). */
  description: string;
  /**
   * Column span at `md+` within `columns`. Clamped to `1…columns`.
   * Example: with `columns={5}`, use `3` and `2` for a classic bento row.
   */
  colSpan: number;
  /** Three CSS colours for the moving radial wash (hex, rgb, oklch, etc.). */
  spotColors: readonly [string, string, string];
  /** Solid card surface behind the mesh (any valid CSS colour). */
  cardBackground?: string;
  /** Narrower measure for the description block. */
  tightCopy?: boolean;
  /** Extra classes on the outer card shell (surface + overflow clip). */
  cardClassName?: string;
  /** Overrides default title typography when set. */
  titleClassName?: string;
  /** Overrides default body typography when set. */
  descriptionClassName?: string;
};

export type AmbientGlassBentoProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "children"
> & {
  items: readonly AmbientGlassBentoItem[];
  /**
   * Number of equal columns at `md+` (the “how many tracks per row” control).
   * Allowed: 2–12. Default: 5.
   */
  columns?: number;
  /**
   * When `true`, `md+` uses two equal-height rows (`1fr` / `1fr`) so cards
   * stretch in the preview / fixed-height parents. When `false`, row heights
   * follow content (`minmax(0,auto)` flow).
   */
  equalHeightRows?: boolean;
  /** Seconds for one full 360° rotation of the colour mesh. Default 42. */
  meshRotationDuration?: number;
  /** Disable moving gradients (still respects `prefers-reduced-motion`). */
  ambientMotion?: boolean;
  /** Gap scale between cards. Default `md`. */
  gap?: "sm" | "md" | "lg";
  /** Merged onto every card shell after defaults. */
  cardClassName?: string;
  /** Default heading classes (merged with each item’s `titleClassName`). */
  titleClassName?: string;
  /** Default description classes (merged with each item’s `descriptionClassName`). */
  descriptionClassName?: string;
};

const cardShellBase =
  "group relative isolate h-full min-h-0 w-full overflow-hidden rounded-2xl border border-neutral-200/90 p-0 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.75),0_1px_0_0_rgb(0_0_0/0.05)] dark:border-neutral-800 dark:shadow-[inset_0_1px_0_0_rgb(255_255_255/0.06),0_1px_0_0_rgb(0_0_0/0.45)]";

const defaultCardTint =
  "bg-neutral-100 dark:bg-neutral-900";

const gapClass = {
  sm: "gap-2 md:gap-3",
  md: "gap-3 md:gap-4",
  lg: "gap-4 md:gap-5",
} as const;

/** Moving colour field: linear spin + independent px drift (percent drift was too subtle on large layers). */
function AmbientMesh({
  c0,
  c1,
  c2,
  rotateDuration,
  motionEnabled,
}: {
  c0: string;
  c1: string;
  c2: string;
  rotateDuration: number;
  motionEnabled: boolean;
}) {
  const reduce = useReducedMotion();
  const off = reduce || !motionEnabled;
  const drift = rotateDuration * 0.32;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div
        className="absolute left-1/2 top-1/2 h-[220%] min-h-[18rem] w-[220%] min-w-[18rem] sm:min-h-[28rem] sm:min-w-[28rem] md:min-h-[32rem] md:min-w-[32rem]"
        style={{ transform: "translate(-50%, -50%)" }}
      >
        <motion.div
          className="h-full w-full opacity-90 mix-blend-overlay will-change-transform blur-3xl dark:opacity-[0.92] dark:mix-blend-screen"
          style={
            {
              background: `
                radial-gradient(circle 44% at 36% 40%, ${c0}, transparent 58%),
                radial-gradient(circle 40% at 66% 44%, ${c1}, transparent 58%),
                radial-gradient(circle 38% at 50% 74%, ${c2}, transparent 60%)
              `,
            } as CSSProperties
          }
          initial={false}
          animate={
            off
              ? undefined
              : {
                  rotate: [0, 360],
                  x: [-22, 32, -18, 26, -22],
                  y: [18, -28, 22, -20, 18],
                }
          }
          transition={
            off
              ? undefined
              : {
                  rotate: {
                    duration: rotateDuration,
                    repeat: Infinity,
                    ease: "linear",
                  },
                  x: {
                    duration: drift,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: [0.45, 0.05, 0.55, 0.95],
                  },
                  y: {
                    duration: drift * 1.15,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: [0.45, 0.05, 0.55, 0.95],
                  },
                }
          }
        />
      </div>
    </div>
  );
}

function CardNoiseOverlay({ filterId }: { filterId: string }) {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1] h-full w-full opacity-[0.11] mix-blend-overlay"
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
            baseFrequency="0.85"
            numOctaves="3"
            stitchTiles="stitch"
            result="n"
          />
          <feColorMatrix in="n" type="saturate" values="0" result="g" />
          <feComponentTransfer in="g" result="t">
            <feFuncA type="linear" slope="0.55" intercept="0" />
          </feComponentTransfer>
        </filter>
      </defs>
      <rect width="100%" height="100%" filter={`url(#${filterId})`} />
    </svg>
  );
}

function AmbientGlassBentoCard({
  item,
  filterId,
  meshRotationDuration,
  ambientMotion,
  rootCardClassName,
  defaultTitleClassName,
  defaultDescriptionClassName,
}: {
  item: AmbientGlassBentoItem;
  filterId: string;
  meshRotationDuration: number;
  ambientMotion: boolean;
  rootCardClassName?: string;
  defaultTitleClassName?: string;
  defaultDescriptionClassName?: string;
}) {
  const reduce = useReducedMotion();
  const c0 = safeColor(item.spotColors[0], "#fda4c8");
  const c1 = safeColor(item.spotColors[1], "#fb7185");
  const c2 = safeColor(item.spotColors[2], "#fecdd3");

  const surfaceBg = item.cardBackground
    ? safeColor(item.cardBackground, "")
    : null;
  const surfaceStyle =
    surfaceBg && surfaceBg.length > 0
      ? ({ backgroundColor: surfaceBg } as CSSProperties)
      : undefined;
  const hasCustomSurface = Boolean(surfaceStyle);

  return (
    <div
      className={cn(
        cardShellBase,
        !hasCustomSurface && defaultCardTint,
        item.cardClassName,
        rootCardClassName,
      )}
      style={surfaceStyle}
    >
      <AmbientMesh
        c0={c0}
        c1={c1}
        c2={c2}
        rotateDuration={meshRotationDuration}
        motionEnabled={ambientMotion}
      />

      <CardNoiseOverlay filterId={filterId} />

      <motion.div
        aria-hidden
        className="absolute inset-x-0 top-0 z-[2] h-1 rounded-t-2xl opacity-80 blur-sm"
        style={{
          background: `linear-gradient(to right, ${c0}, ${c1}, ${c2})`,
        }}
        initial={false}
        animate={
          reduce || !ambientMotion
            ? undefined
            : { x: [0, 26, -18, 14, -6, 0] }
        }
        transition={
          reduce || !ambientMotion
            ? undefined
            : {
                duration: 11,
                repeat: Infinity,
                repeatType: "mirror",
                ease: [0.42, 0, 0.58, 1],
              }
        }
      />

      <div className="relative z-10 flex h-full min-h-[14rem] flex-col justify-end p-6 sm:p-8 md:min-h-0">
        <div className={cn(item.tightCopy && "max-w-md")}>
          <h3
            className={cn(
              "text-balance font-sans text-2xl font-medium tracking-tight text-neutral-900 antialiased dark:text-neutral-50",
              defaultTitleClassName,
              item.titleClassName,
            )}
          >
            {item.title}
          </h3>
          <p
            className={cn(
              "text-pretty mt-2 text-base leading-relaxed text-neutral-600 antialiased dark:text-neutral-400",
              defaultDescriptionClassName,
              item.descriptionClassName,
            )}
          >
            {item.description}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Configurable bento grid: set **`columns`** (md+ track count), per-item
 * **`colSpan`** and **`cardBackground`**, **`spotColors`** for the animated wash,
 * and optional typography classes. The ambient layer uses **transform-only**
 * motion (rotate + mirrored translate) so colour clearly moves inside each
 * card; `prefers-reduced-motion` and `ambientMotion={false}` disable it.
 */
export function AmbientGlassBento({
  items,
  className,
  columns = 5,
  equalHeightRows = true,
  meshRotationDuration = 42,
  ambientMotion = true,
  gap = "md",
  cardClassName: rootCardClassName,
  titleClassName: defaultTitleClassName,
  descriptionClassName: defaultDescriptionClassName,
  ...rest
}: AmbientGlassBentoProps) {
  const raw = useId();
  const baseId = raw.replace(/[^a-zA-Z0-9_-]/g, "");

  const colCount = clamp(columns, 2, 12);
  const mdCols = COLS_CLASS[colCount] ?? "md:grid-cols-5";

  const rowSizing = equalHeightRows
    ? "md:grid-auto-rows-[minmax(0,1fr)]"
    : "";

  return (
    <div
      {...rest}
      className={cn(
        "grid h-full w-full min-h-[22rem] grid-cols-1 sm:min-h-[24rem] md:min-h-0",
        mdCols,
        gapClass[gap],
        rowSizing,
        className,
      )}
    >
      {items.map((item, i) => {
        const span = clamp(item.colSpan ?? 1, 1, colCount);
        const spanCls = SPAN_CLASS[span] ?? "md:col-span-1";

        return (
          <div
            key={`${item.title}-${i}`}
            className={cn(
              "flex h-full min-h-[14rem] flex-col sm:min-h-[15rem] md:min-h-0",
              spanCls,
            )}
          >
            <AmbientGlassBentoCard
              item={item}
              filterId={`agb-noise-${baseId}-${i}`}
              meshRotationDuration={meshRotationDuration}
              ambientMotion={ambientMotion}
              rootCardClassName={rootCardClassName}
              defaultTitleClassName={defaultTitleClassName}
              defaultDescriptionClassName={defaultDescriptionClassName}
            />
          </div>
        );
      })}
    </div>
  );
}

/** Default four-tile marketing grid (uses theme surfaces; add `cardBackground` per item to pin a custom tint). */
export const AMBIENT_GLASS_BENTO_SHOWCASE: readonly AmbientGlassBentoItem[] = [
  {
    title: "Software That Actually Scales",
    description:
      "Not code. Not prototypes. Real, live systems running in production from day one.",
    colSpan: 3,
    tightCopy: true,
    spotColors: ["rgb(255, 126, 179)", "rgb(255, 117, 140)", "rgb(255, 177, 153)"],
  },
  {
    title: "Infrastructure Built In",
    description:
      "Deployment, scaling, and runtime handled automatically. No DevOps, no setup, no friction.",
    colSpan: 2,
    spotColors: ["rgb(130, 170, 240)", "rgb(100, 150, 255)", "rgb(180, 200, 255)"],
  },
  {
    title: "Build & Iterate Real Software",
    description:
      "Create, run, and improve real production systems — not one-shot prompts or demos.",
    colSpan: 2,
    spotColors: ["rgb(255, 200, 100)", "rgb(255, 170, 80)", "rgb(255, 220, 150)"],
  },
  {
    title: "AI That Owns the System",
    description:
      "AI doesn't just generate code — it builds, runs, and evolves the entire system end-to-end.",
    colSpan: 3,
    tightCopy: true,
    spotColors: ["rgb(120, 160, 200)", "rgb(90, 130, 170)", "rgb(190, 210, 230)"],
  },
] as const;
