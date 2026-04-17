"use client";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import type { TargetAndTransition } from "motion/react";
import { useState, useEffect } from "react";

export type WordRotateAnimation = "slide-up" | "slide-down" | "flip" | "fade";

export interface WordRotateProps {
  words: string[];
  className?: string;
  /** Duration each word is shown in ms */
  interval?: number;
  /** Transition animation style */
  animation?: WordRotateAnimation;
  theme?: "light" | "dark";
}

const variants: Record<
  WordRotateAnimation,
  { initial: TargetAndTransition; animate: TargetAndTransition; exit: TargetAndTransition }
> = {
  "slide-up": {
    initial: { y: "100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "-100%", opacity: 0 },
  },
  "slide-down": {
    initial: { y: "-100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 0 },
  },
  flip: {
    initial: { rotateX: -90, opacity: 0, transformOrigin: "top" },
    animate: { rotateX: 0, opacity: 1, transformOrigin: "top" },
    exit: { rotateX: 90, opacity: 0, transformOrigin: "bottom" },
  },
  fade: {
    initial: { opacity: 0, scale: 0.92 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.92 },
  },
};

export function WordRotate({
  words,
  className,
  interval = 2500,
  animation = "slide-up",
  theme: _theme = "dark",
}: WordRotateProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, interval);
    return () => clearInterval(id);
  }, [words.length, interval]);

  const v = variants[animation];

  return (
    <span
      className={cn(
        "inline-flex overflow-hidden",
        animation === "flip" && "[perspective:600px]",
        className
      )}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={v.initial}
          animate={v.animate}
          exit={v.exit}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
          className="inline-block"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
