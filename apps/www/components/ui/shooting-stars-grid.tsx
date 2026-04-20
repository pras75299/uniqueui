"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type ShootingStarDirection = "horizontal" | "vertical" | "both";

export interface ShootingStarsGridProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Number of concurrent shooting-star streaks. Range: 1–80. */
  starCount?: number;
  /** Base duration (seconds) per streak. Each star is randomised ±30% around this. */
  speed?: number;
  /** 0–1 multiplier applied to box-shadow intensity. */
  glowStrength?: number;
  /** Pixel spacing between grid lines. */
  gridSize?: number;
  /** Which axis streaks travel along. "both" picks per-star randomly. */
  direction?: ShootingStarDirection;
  /**
   * Streak colour. Pass a single CSS colour for a monochrome shower, an array
   * of colours to sample from per star, or omit to use the built-in multi-hue
   * palette (white, teal, amber, magenta, violet, cyan).
   *
   * Accepts any format `rgb()` understands — `#rrggbb`, `#rgb`, `rgb(...)`,
   * named colours, etc. Colour is used for both the core gradient and the glow.
   */
  color?: string | readonly string[];
  /** Optional content layered above the background at z-10. */
  children?: React.ReactNode;
}

interface Star {
  id: number;
  /** Grid-snapped offset along the axis perpendicular to travel, in px. */
  lane: number;
  length: number;
  duration: number;
  delay: number;
  opacity: number;
  isHorizontal: boolean;
  /** true = L→R / T→B, false = the reverse. */
  forward: boolean;
  /** Resolved CSS colour for this star's core + glow. */
  color: string;
}

// Multi-hued default palette — roughly matches the reference hero mock:
// white-hot core streaks with occasional brand accents.
const DEFAULT_PALETTE: readonly string[] = [
  "#ffffff",         // pure white
  "#e6fffa",         // icy mint
  "#a0ffcc",         // mint-green
  "#7fe7ff",         // electric cyan
  "#ffd27f",         // warm amber
  "#ff9ecf",         // hot pink
  "#c89bff",         // violet
];

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function pickDirection(direction: ShootingStarDirection): boolean {
  if (direction === "horizontal") return true;
  if (direction === "vertical") return false;
  return Math.random() < 0.5;
}

function resolvePalette(color?: string | readonly string[]): readonly string[] {
  if (typeof color === "string") return [color];
  if (Array.isArray(color) && color.length > 0) return color;
  return DEFAULT_PALETTE;
}

function makeStars(
  count: number,
  gridSize: number,
  baseSpeed: number,
  direction: ShootingStarDirection,
  width: number,
  height: number,
  palette: readonly string[],
): Star[] {
  // Snap lanes to interior grid lines so streaks visibly ride the grid.
  const laneCountH = Math.max(1, Math.floor(height / gridSize) - 1);
  const laneCountV = Math.max(1, Math.floor(width / gridSize) - 1);
  return Array.from({ length: count }, (_, id) => {
    const isHorizontal = pickDirection(direction);
    const laneIndex = isHorizontal
      ? 1 + Math.floor(Math.random() * laneCountH)
      : 1 + Math.floor(Math.random() * laneCountV);
    return {
      id,
      lane: laneIndex * gridSize,
      length: rand(40, 90),
      duration: baseSpeed * rand(0.7, 1.3),
      delay: rand(0, 5),
      opacity: rand(0.6, 1),
      isHorizontal,
      forward: Math.random() < 0.5,
      color: palette[Math.floor(Math.random() * palette.length)],
    };
  });
}

export function ShootingStarsGrid({
  className,
  style,
  children,
  starCount = 15,
  speed = 2.5,
  glowStrength = 1,
  gridSize = 80,
  direction = "both",
  color,
  ...rest
}: ShootingStarsGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  // Clamp to a sensible range so consumers can't accidentally nuke the GPU.
  const safeCount = Math.max(1, Math.min(starCount, 80));
  // Guard derived animation inputs against zero/negative/NaN values that would
  // otherwise produce Infinity lanes, zero-duration loops, or invalid color-mix %.
  const safeGridSize = Math.max(8, Number.isFinite(gridSize) ? gridSize : 80);
  const safeSpeed = Math.max(0.1, Number.isFinite(speed) ? speed : 2.5);
  const safeGlow = Math.max(0, Math.min(Number.isFinite(glowStrength) ? glowStrength : 1, 1));

  // Track container size so lane snapping reflects actual width/height.
  // Initial state zero keeps the server render empty → no hydration mismatch.
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize((prev) =>
        Math.abs(prev.w - width) < 1 && Math.abs(prev.h - height) < 1
          ? prev
          : { w: width, h: height },
      );
    });
    ro.observe(el);
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setSize({ w: rect.width, h: rect.height });
    }
    return () => ro.disconnect();
  }, []);

  // Memoise the resolved palette so a string or omitted prop keeps stable array
  // identity — otherwise `stars` regenerates on every parent render.
  const palette = useMemo(() => resolvePalette(color), [color]);

  const stars = useMemo(() => {
    if (size.w === 0 || size.h === 0) return [];
    return makeStars(
      safeCount,
      safeGridSize,
      safeSpeed,
      direction,
      size.w,
      size.h,
      palette,
    );
  }, [safeCount, safeGridSize, safeSpeed, direction, size.w, size.h, palette]);

  const gridBackground = useMemo(
    () => ({
      backgroundImage: [
        "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px)",
        "linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
      ].join(", "),
      backgroundSize: `${safeGridSize}px ${safeGridSize}px`,
    }),
    [safeGridSize],
  );

  // Glow scales with `glowStrength` but the hue is per-star, so shadow is built
  // inside the map below. These alpha values keep the streak ~1px sharp with a
  // soft halo (no `spread` — would inflate the element's footprint).
  const innerAlpha = 0.55 * safeGlow;
  const outerAlpha = 0.2 * safeGlow;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full overflow-hidden bg-[#020808]",
        className,
      )}
      style={style}
      {...rest}
    >
      {/* Grid layer */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={gridBackground}
      />

      {/* Radial emerald glow (off-centre so it doesn't look like a flashlight). */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 65% 40%, rgba(0,50,25,0.45), transparent 70%)",
        }}
      />

      {/* Vignette — fades outer edges to pure black so the grid is centre-heavy. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      {/* Shooting stars — transform-only animations = compositor-friendly. */}
      {!prefersReduced &&
        stars.map((star) => {
          // color-mix keeps the per-star hue while letting glowStrength drive
          // the alpha — works for #hex, rgb(), and named colours alike.
          const innerGlow = `color-mix(in srgb, ${star.color} ${Math.round(
            innerAlpha * 100,
          )}%, transparent)`;
          const outerGlow = `color-mix(in srgb, ${star.color} ${Math.round(
            outerAlpha * 100,
          )}%, transparent)`;

          const common: React.CSSProperties = {
            position: "absolute",
            pointerEvents: "none",
            opacity: star.opacity,
            boxShadow: `0 0 2px ${innerGlow}, 0 0 6px ${outerGlow}`,
            willChange: "transform",
          };

          if (star.isHorizontal) {
            // Horizontal streak: head on the right of the gradient, tail on the left.
            const from = star.forward ? -star.length : size.w + star.length;
            const to = star.forward ? size.w + star.length : -star.length;
            return (
              <motion.div
                key={star.id}
                aria-hidden="true"
                style={{
                  ...common,
                  top: star.lane,
                  left: 0,
                  width: star.length,
                  height: 1,
                  background: star.forward
                    ? `linear-gradient(90deg, transparent, ${star.color})`
                    : `linear-gradient(270deg, transparent, ${star.color})`,
                  // Offset by -length so the head touches the start position exactly.
                  transform: `translateX(${from}px)`,
                }}
                animate={{ x: [from, to] }}
                transition={{
                  duration: star.duration,
                  ease: "linear",
                  repeat: Infinity,
                  delay: star.delay,
                }}
              />
            );
          }

          const from = star.forward ? -star.length : size.h + star.length;
          const to = star.forward ? size.h + star.length : -star.length;
          return (
            <motion.div
              key={star.id}
              aria-hidden="true"
              style={{
                ...common,
                left: star.lane,
                top: 0,
                width: 1,
                height: star.length,
                background: star.forward
                  ? `linear-gradient(180deg, transparent, ${star.color})`
                  : `linear-gradient(0deg, transparent, ${star.color})`,
                transform: `translateY(${from}px)`,
              }}
              animate={{ y: [from, to] }}
              transition={{
                duration: star.duration,
                ease: "linear",
                repeat: Infinity,
                delay: star.delay,
              }}
            />
          );
        })}

      {/* Content slot — sits above all background layers. */}
      {children && <div className="relative z-10 w-full h-full">{children}</div>}
    </div>
  );
}

export default ShootingStarsGrid;
