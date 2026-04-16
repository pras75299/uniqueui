"use client";
import { cn } from "@/lib/utils";
import { motion, useInView } from "motion/react";
import { useRef } from "react";

export interface BlurRevealProps {
  text: string;
  className?: string;
  /** Extra delay before the animation starts (seconds) */
  delay?: number;
  /** Spring duration for each item */
  duration?: number;
  /** Split and animate by individual characters or whole words */
  animateBy?: "characters" | "words";
  /** Only trigger once on first enter */
  once?: boolean;
  theme?: "light" | "dark";
}

export function BlurReveal({
  text,
  className,
  delay = 0,
  duration = 0.6,
  animateBy = "characters",
  once = true,
  _theme = "dark",
}: BlurRevealProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once, amount: 0.3 });

  const items =
    animateBy === "characters" ? text.split("") : text.split(" ");

  const stagger = animateBy === "characters" ? 0.03 : 0.07;

  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex flex-wrap",
        animateBy === "words" ? "gap-[0.3em]" : "gap-[0.01em]",
        className
      )}
    >
      {items.map((item, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, filter: "blur(14px)", y: 12 }}
          animate={
            isInView
              ? { opacity: 1, filter: "blur(0px)", y: 0 }
              : { opacity: 0, filter: "blur(14px)", y: 12 }
          }
          transition={{
            delay: delay + i * stagger,
            duration,
            type: "spring",
            stiffness: 80,
            damping: 14,
          }}
          className="inline-block"
        >
          {item === " " ? "\u00A0" : item}
        </motion.span>
      ))}
    </span>
  );
}
