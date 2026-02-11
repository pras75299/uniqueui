"use client";
import React from "react";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

export interface GradientTextRevealProps {
  text: string;
  className?: string;
  gradientFrom?: string;
  gradientTo?: string;
  staggerDelay?: number;
  duration?: number;
  once?: boolean;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
}

export function GradientTextReveal({
  text,
  className,
  gradientFrom = "#a855f7",
  gradientTo = "#ec4899",
  staggerDelay = 0.05,
  duration = 0.5,
  once = true,
  as: Tag = "p",
}: GradientTextRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: 0.3 });
  const words = text.split(" ");

  return (
    <Tag
      ref={ref as any}
      className={cn("flex flex-wrap gap-x-2 gap-y-1", className)}
    >
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={
            isInView
              ? { opacity: 1, y: 0, filter: "blur(0px)" }
              : { opacity: 0, y: 20, filter: "blur(8px)" }
          }
          transition={{
            duration,
            delay: i * staggerDelay,
            type: "spring",
            stiffness: 100,
            damping: 12,
          }}
          style={{
            background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {word}
        </motion.span>
      ))}
    </Tag>
  );
}
