"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/**
 * Editorial stagger group. Children fade + translate up with a small
 * staggered offset, fired once when the group enters the viewport.
 *
 * Use <StaggerItem> for direct children. Stagger amount kept small (60ms)
 * so the page never feels like a wave is washing over it — closer to
 * how a paragraph sets one word at a time.
 */
export function StaggerGroup({
  children,
  className,
  stagger = 0.06,
  delay = 0,
  amount = 0.25,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  amount?: number;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? "show" : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: reduceMotion ? 0 : stagger,
            delayChildren: reduceMotion ? 0 : delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  y = 12,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  as?: "div" | "li" | "span" | "p";
}) {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.32, ease: EASE_OUT },
        },
      }}
    >
      {children}
    </Comp>
  );
}
