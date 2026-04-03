"use client";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export interface RippleProps {
  className?: string;
  /** Diameter of the innermost circle in px */
  mainCircleSize?: number;
  /** Opacity of the innermost circle */
  mainCircleOpacity?: number;
  /** Total number of rings radiating outward */
  numCircles?: number;
  /** Color of the rings */
  color?: string;
  /** Duration of one ripple cycle in seconds */
  duration?: number;
  theme?: "light" | "dark";
}

export function Ripple({
  className,
  mainCircleSize = 120,
  mainCircleOpacity = 0.24,
  numCircles = 7,
  color,
  duration = 3.5,
  theme = "dark",
}: RippleProps) {
  const defaultColor =
    theme === "dark" ? "rgba(168,85,247," : "rgba(124,58,237,";

  const rings = Array.from({ length: numCircles }, (_, i) => i);

  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none",
        className
      )}
      aria-hidden="true"
    >
      {rings.map((i) => {
        const scale = 1 + i * 0.6;
        const opacity = mainCircleOpacity * Math.pow(0.75, i);
        const delay = i * (duration / numCircles);
        const size = mainCircleSize * scale;
        const ringColor = color ?? `${defaultColor}${opacity})`;

        return (
          <motion.span
            key={i}
            className="absolute rounded-full border"
            style={{
              width: size,
              height: size,
              borderColor: ringColor,
              backgroundColor:
                i === 0 ? (color ?? `${defaultColor}${opacity * 0.3})`) : "transparent",
            }}
            animate={{
              scale: [1, 1.08, 1],
              opacity: [opacity, opacity * 0.6, opacity],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}
