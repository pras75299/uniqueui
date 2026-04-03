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
  /** Override all orb colours with a single hex/rgba value */
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
              background:   `radial-gradient(circle at 40% 40%, ${orbColor} 0%, ${orbColor}bb 22%, ${orbColor}44 50%, transparent 70%)`,
              filter:       `blur(${blurPx}px)`,
              willChange:   "transform, opacity",
            }}
          />
        );
      })}
    </div>
  );
}
