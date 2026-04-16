"use client";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export interface RippleProps {
  className?: string;
  /** Controls the base size from which orb diameter is derived */
  mainCircleSize?: number;
  /** Overall opacity of every orb */
  mainCircleOpacity?: number;
  /** Number of luminous orbs (1–8) */
  numCircles?: number;
  /** Override all orb colours with a single hex (3/6-digit), rgb(), rgba(), or hsl() value */
  color?: string;
  /** Duration in seconds for one full drift cycle */
  duration?: number;
}

// Anchor points (% of container), warm palette, and keyframe paths.
// Drift distances are large enough to be visible through heavy blur.
const ORBS = [
  { cx: 15, cy: 22, color: "#f43f5e", dx: [0,  160,   60,  -80, 0], dy: [0,   70,  170,  100, 0], scale: [1,    1.18, 0.84, 1.06, 1],    opacity: [1,    0.70, 1.0,  0.80, 1]    },
  { cx: 80, cy: 18, color: "#a855f7", dx: [0, -160,  -70, -180, 0], dy: [0,   90,  -60,  130, 0], scale: [0.9,  1.14, 0.88, 1.0,  0.9],  opacity: [0.9,  1.0,  0.72, 1.0,  0.9]  },
  { cx: 50, cy: 58, color: "#fb923c", dx: [0,  100,  -80,  120, 0], dy: [0, -130,  -50,   90, 0], scale: [1,    0.82, 1.22, 0.94, 1],    opacity: [1,    0.65, 1.0,  0.78, 1]    },
  { cx:  8, cy: 70, color: "#fbbf24", dx: [0,  -50,  150,  -90, 0], dy: [0, -110, -130,  -55, 0], scale: [0.88, 1.16, 0.90, 1.12, 0.88], opacity: [0.80, 1.0,  0.70, 1.0,  0.80] },
  { cx: 88, cy: 52, color: "#e879f9", dx: [0, -130,   70, -170, 0], dy: [0,  -90,  130,   55, 0], scale: [1,    0.88, 1.18, 0.84, 1],    opacity: [1,    0.8,  1.0,  0.7,  1]    },
  { cx: 40, cy:  6, color: "#f97316", dx: [0,   85, -110,   60, 0], dy: [0,  150,   85,  185, 0], scale: [0.94, 1.12, 0.86, 1.2,  0.94], opacity: [0.85, 1.0,  0.70, 0.95, 0.85] },
  { cx: 66, cy: 84, color: "#c084fc", dx: [0,  -90,   55, -150, 0], dy: [0, -130,  -75, -165, 0], scale: [1,    1.10, 0.86, 1.16, 1],    opacity: [0.9,  0.7,  1.0,  0.8,  0.9]  },
  { cx: 24, cy: 46, color: "#fb7185", dx: [0,  145,  -55,  105, 0], dy: [0,  -65,  125, -110, 0], scale: [0.92, 1.16, 0.86, 1.0,  0.92], opacity: [0.88, 1.0,  0.72, 0.95, 0.88] },
];

/**
 * Converts any CSS color string (3/6-digit hex, rgb/rgba, hsl/hsla) into an
 * rgba(r,g,b,a) string with the given alpha.  Falls back to the original color
 * when the format cannot be parsed (e.g. CSS variables, named colors in SSR).
 */
function toRgbaString(color: string, alpha: number): string {
  const c = color.trim();

  // ── rgba(r,g,b,a) or rgb(r,g,b) ─────────────────────────────────────────
  const rgbMatch = c.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
  if (rgbMatch) {
    return `rgba(${rgbMatch[1]},${rgbMatch[2]},${rgbMatch[3]},${alpha})`;
  }

  // ── 3-digit hex: #rgb → #rrggbb ─────────────────────────────────────────
  const hex3 = c.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i);
  if (hex3) {
    const r = parseInt(hex3[1] + hex3[1], 16);
    const g = parseInt(hex3[2] + hex3[2], 16);
    const b = parseInt(hex3[3] + hex3[3], 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  // ── 6-digit hex: #rrggbb (also handles 8-digit by ignoring alpha digits) ─
  const hex6 = c.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
  if (hex6) {
    const r = parseInt(hex6[1], 16);
    const g = parseInt(hex6[2], 16);
    const b = parseInt(hex6[3], 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  // ── hsl/hsla: convert to rgb ─────────────────────────────────────────────
  const hslMatch = c.match(/^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%?\s*,\s*([\d.]+)%?\s*/i);
  if (hslMatch) {
    const h = parseFloat(hslMatch[1]) / 360;
    const s = parseFloat(hslMatch[2]) / 100;
    const l = parseFloat(hslMatch[3]) / 100;
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
    const g = Math.round(hue2rgb(p, q, h) * 255);
    const b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  // ── Unrecognised format (CSS variable, named color) — return as-is ────────
  return color;
}

export function Ripple({
  className,
  mainCircleSize = 120,
  mainCircleOpacity = 0.6,
  numCircles = 7,
  color,
  duration = 9,
}: RippleProps) {
  const count   = Math.min(numCircles, ORBS.length);
  const orbSize = mainCircleSize * 4.5;
  // Cap blur so very large sizes don't tank performance
  const blurPx  = Math.min(mainCircleSize * 1.3, 90);

  // Memoize opacity keyframes — without this, .map() produces a new array every
  // render and motion/react restarts all animations on any parent re-render.
  const opacityKeyframes = useMemo(
    () => ORBS.slice(0, count).map((orb) => orb.opacity.map((o) => o * mainCircleOpacity)),
    [count, mainCircleOpacity],
  );

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none",
        className
      )}
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, i) => {
        const orb      = ORBS[i];
        const orbColor = color ?? orb.color;
        // Stagger cycle lengths so orbs never lock into the same phase
        const dur   = duration * (0.72 + (i % 4) * 0.10);
        const delay = -(i / count) * dur; // negative delay = already mid-cycle on mount

        // Build alpha variants via helper — supports hex, rgb/rgba, hsl/hsla
        const colorMid  = toRgbaString(orbColor, 0.73);
        const colorOuter = toRgbaString(orbColor, 0.27);

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{
              x:       orb.dx,
              y:       orb.dy,
              scale:   orb.scale,
              opacity: opacityKeyframes[i],
            }}
            transition={{
              duration: dur,
              repeat:   Infinity,
              ease:     "easeInOut",
              delay,
            }}
            style={{
              position:     "absolute",
              left:         `${orb.cx}%`,
              top:          `${orb.cy}%`,
              width:        orbSize,
              height:       orbSize,
              // Negative margin centres the orb on its anchor without conflicting
              // with motion's x/y transform
              marginLeft:   -orbSize / 2,
              marginTop:    -orbSize / 2,
              borderRadius: "50%",
              background:   `radial-gradient(circle at 40% 40%, ${orbColor} 0%, ${colorMid} 22%, ${colorOuter} 50%, transparent 70%)`,
              filter:       `blur(${blurPx}px)`,
              willChange:   "transform, opacity",
            }}
          />
        );
      })}
    </div>
  );
}
