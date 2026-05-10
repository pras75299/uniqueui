"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useReducedMotion, useMotionValue, useTransform, animate } from "motion/react";
import { cn } from "@/lib/utils";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

type CountUpProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  delay?: number;
  className?: string;
  /** Render the value with a fixed-width tabular-nums container. */
  tabular?: boolean;
};

/**
 * Editorial count-up: animates from 0 → value once on scroll into view.
 * Ease-out, ~900ms by default. Respects reduced motion.
 */
export function CountUp({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 0.9,
  delay = 0.15,
  className,
  tabular = true,
}: CountUpProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const mv = useMotionValue(reduceMotion ? value : 0);
  const display = useTransform(mv, (v) => {
    const formatted = v.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return `${prefix}${formatted}${suffix}`;
  });

  useEffect(() => {
    if (!inView || reduceMotion) return;
    const controls = animate(mv, value, { duration, ease: EASE_OUT, delay });
    return controls.stop;
  }, [inView, mv, value, duration, delay, reduceMotion]);

  return (
    <motion.span ref={ref} className={cn(tabular && "tabular-nums", className)}>
      {display}
    </motion.span>
  );
}
