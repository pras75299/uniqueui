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

export type AmbientGlassBentoItem = {
  title: string;
  description: string;
  /** `md` column span out of 5 — use `3` + `2` pairs for the classic bento rhythm. */
  colSpan: 2 | 3;
  /** Three blob colours (largest visual weight uses the first stop). */
  spotColors: readonly [string, string, string];
  /** Wider readable measure for the body line (matches the reference layout). */
  tightCopy?: boolean;
};

export type AmbientGlassBentoProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "children"
> & {
  items: readonly AmbientGlassBentoItem[];
};

const cardShell =
  "group relative h-full w-full overflow-hidden rounded-2xl border-0 bg-neutral-200 p-0 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.55),0_1px_0_0_rgb(255_255_255/0.35)] dark:bg-neutral-800 dark:shadow-[inset_0_1px_0_0_rgb(0_0_0/0.45),0_1px_0_0_rgb(0_0_0/0.35)]";

/** Single soft mesh; slow linear rotation so colour washes move smoothly inside the card. */
function AmbientMesh({
  c0,
  c1,
  c2,
}: {
  c0: string;
  c1: string;
  c2: string;
}) {
  const reduce = useReducedMotion();
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        className="absolute left-1/2 top-1/2 h-[210%] w-[210%]"
        style={{ transform: "translate(-50%, -50%)" }}
      >
        <motion.div
          className="h-full w-full blur-3xl"
          style={
            {
              opacity: 0.92,
              background: `
                radial-gradient(circle 40% at 30% 36%, ${c0}, transparent 70%),
                radial-gradient(circle 36% at 70% 44%, ${c1}, transparent 70%),
                radial-gradient(circle 34% at 48% 74%, ${c2}, transparent 72%)
              `,
            } as CSSProperties
          }
          initial={false}
          animate={reduce ? undefined : { rotate: [0, 360] }}
          transition={
            reduce
              ? undefined
              : {
                  duration: 48,
                  repeat: Infinity,
                  ease: "linear",
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
}: {
  item: AmbientGlassBentoItem;
  filterId: string;
}) {
  const reduce = useReducedMotion();
  const c0 = safeColor(item.spotColors[0], "#fda4c8");
  const c1 = safeColor(item.spotColors[1], "#fb7185");
  const c2 = safeColor(item.spotColors[2], "#fecdd3");

  return (
    <div className={cardShell}>
      <AmbientMesh c0={c0} c1={c1} c2={c2} />

      <CardNoiseOverlay filterId={filterId} />

      <motion.div
        aria-hidden
        className="absolute inset-x-0 top-0 z-[2] h-1 rounded-t-2xl opacity-80 blur-sm"
        style={{
          background: `linear-gradient(to right, ${c0}, ${c1}, ${c2})`,
        }}
        initial={false}
        animate={
          reduce
            ? undefined
            : { x: [0, 26, -18, 14, -6, 0] }
        }
        transition={
          reduce
            ? undefined
            : {
                duration: 11,
                repeat: Infinity,
                repeatType: "mirror",
                ease: [0.42, 0, 0.58, 1],
              }
        }
      />

      <div className="relative z-10 flex h-full min-h-[16rem] flex-col justify-end p-8">
        <div className={cn(item.tightCopy && "max-w-md")}>
          <h3 className="font-sans text-2xl font-medium tracking-tight text-neutral-900 dark:text-neutral-50">
            {item.title}
          </h3>
          <p className="mt-2 text-base text-neutral-600 dark:text-neutral-400">
            {item.description}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Asymmetric 2×2 **bento** grid of glassy feature tiles. Each tile uses one
 * oversized radial mesh that **rotates slowly** with linear easing so the wash
 * moves smoothly inside the frame; film-grain sits above. Copy stays on a high
 * `z-index`. Honors `prefers-reduced-motion` (static mesh).
 */
export function AmbientGlassBento({
  items,
  className,
  ...rest
}: AmbientGlassBentoProps) {
  const raw = useId();
  const baseId = raw.replace(/[^a-zA-Z0-9_-]/g, "");

  return (
    <div
      {...rest}
      className={cn(
        "grid grid-cols-1 gap-4 md:auto-rows-[16rem] md:grid-cols-5",
        className,
      )}
    >
      {items.map((item, i) => (
        <div
          key={`${item.title}-${i}`}
          className={item.colSpan === 3 ? "md:col-span-3" : "md:col-span-2"}
        >
          <AmbientGlassBentoCard
            item={item}
            filterId={`agb-noise-${baseId}-${i}`}
          />
        </div>
      ))}
    </div>
  );
}

/** Default four-tile marketing grid from the showcase reference. */
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
    spotColors: ["rgb(160, 200, 160)", "rgb(120, 180, 140)", "rgb(200, 230, 200)"],
  },
] as const;
