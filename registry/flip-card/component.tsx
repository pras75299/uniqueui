"use client";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { motion } from "motion/react";

export interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  className?: string;
  frontClassName?: string;
  backClassName?: string;
  trigger?: "hover" | "click";
  direction?: "horizontal" | "vertical";
  perspective?: number;
  theme?: "light" | "dark";
}

export function FlipCard({
  front,
  back,
  className,
  frontClassName,
  backClassName,
  trigger = "hover",
  direction = "horizontal",
  perspective = 1000,
  theme = "dark",
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const rotateAxis = direction === "horizontal" ? "rotateY" : "rotateX";

  const handlers =
    trigger === "hover"
      ? {
          onMouseEnter: () => setIsFlipped(true),
          onMouseLeave: () => setIsFlipped(false),
        }
      : {
          onClick: () => setIsFlipped((prev) => !prev),
        };

  return (
    <div
      className={cn("relative cursor-pointer", className)}
      style={{ perspective: `${perspective}px` }}
      {...handlers}
    >
      {/* Front */}
      <motion.div
        className={cn(
          "w-full h-full rounded-xl border p-6 backface-hidden",
          theme === "dark" ? "border-neutral-800 bg-neutral-950" : "border-neutral-200 bg-white",
          frontClassName
        )}
        style={{ backfaceVisibility: "hidden" }}
        animate={{
          [rotateAxis]: isFlipped ? 180 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {front}
      </motion.div>

      {/* Back */}
      <motion.div
        className={cn(
          "absolute inset-0 w-full h-full rounded-xl border p-6 backface-hidden",
          theme === "dark" ? "border-neutral-700 bg-neutral-900" : "border-neutral-300 bg-neutral-100",
          backClassName
        )}
        style={{
          backfaceVisibility: "hidden",
          [rotateAxis === "rotateY" ? "rotateY" : "rotateX"]: "180deg",
        }}
        initial={{ [rotateAxis]: -180 }}
        animate={{
          [rotateAxis]: isFlipped ? 0 : -180,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {back}
      </motion.div>
    </div>
  );
}
