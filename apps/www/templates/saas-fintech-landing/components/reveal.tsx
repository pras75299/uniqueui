"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Stagger delay in seconds. */
  delay?: number;
  /** Vertical translation magnitude. */
  y?: number;
  className?: string;
};

/**
 * Editorial reveal: short ease-out translate + opacity. No scale-from-zero,
 * no spring overshoot — entrance should feel like type setting onto paper,
 * not like a UI bouncing in.
 *
 * Curve: cubic-bezier(0.23, 1, 0.32, 1) — strong ease-out, ~280ms.
 * Per Emil: ease-out for entrances, durations under 300ms.
 */
export function Reveal({ children, delay = 0, y = 16, className }: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        duration: reduceMotion ? 0 : 0.28,
        ease: [0.23, 1, 0.32, 1],
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
