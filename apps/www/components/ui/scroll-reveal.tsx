"use client";
import React, { useRef } from "react";
import { motion, useInView, Variant } from "motion/react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type AnimationPreset = "fade-up" | "fade-down" | "fade-left" | "fade-right" | "scale" | "blur";

const presets: Record<AnimationPreset, { hidden: Variant; visible: Variant }> = {
  "fade-up": {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  "fade-down": {
    hidden: { opacity: 0, y: -40 },
    visible: { opacity: 1, y: 0 },
  },
  "fade-left": {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
  "fade-right": {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  },
  blur: {
    hidden: { opacity: 0, filter: "blur(10px)" },
    visible: { opacity: 1, filter: "blur(0px)" },
  },
};

export interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  animation?: AnimationPreset;
  delay?: number;
  duration?: number;
  threshold?: number;
  once?: boolean;
}

export function ScrollReveal({
  children,
  className,
  animation = "fade-up",
  delay = 0,
  duration = 0.6,
  threshold = 0.2,
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once,
    amount: threshold,
  });

  const preset = presets[animation];

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: preset.hidden,
        visible: {
          ...preset.visible,
          transition: {
            type: "spring",
            stiffness: 100,
            damping: 15,
            delay,
            duration,
          },
        },
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

export interface ScrollRevealGroupProps {
  children: React.ReactNode;
  className?: string;
  animation?: AnimationPreset;
  staggerDelay?: number;
  threshold?: number;
  once?: boolean;
}

export function ScrollRevealGroup({
  children,
  className,
  animation = "fade-up",
  staggerDelay = 0.1,
  threshold = 0.1,
  once = true,
}: ScrollRevealGroupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once,
    amount: threshold,
  });

  const preset = presets[animation];

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={cn(className)}
    >
      {React.Children.map(children, (child) => (
        <motion.div
          variants={{
            hidden: preset.hidden,
            visible: {
              ...preset.visible,
              transition: {
                type: "spring",
                stiffness: 100,
                damping: 15,
              },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
