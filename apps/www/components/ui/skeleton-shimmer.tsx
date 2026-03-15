"use client";
import { cn } from "@/lib/utils";
import React from "react";
import { motion } from "motion/react";

export interface SkeletonShimmerProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: "sm" | "md" | "lg" | "xl" | "full";
  count?: number;
  gap?: number;
  theme?: "light" | "dark";
}

export function SkeletonShimmer({
  className,
  width = "100%",
  height = "20px",
  rounded = "md",
  count = 1,
  gap = 12,
  theme = "dark",
}: SkeletonShimmerProps) {
  const roundedMap = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full",
  };
  const isDark = theme === "dark";

  return (
    <div className="flex flex-col" style={{ gap: `${gap}px` }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "relative overflow-hidden",
            isDark ? "bg-neutral-800/50" : "bg-neutral-200/80",
            roundedMap[rounded],
            className
          )}
          style={{ width, height }}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)",
            }}
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
              delay: i * 0.15,
            }}
          />
          {/* Subtle pulse on top of shimmer */}
          <motion.div
            className={cn("absolute inset-0", isDark ? "bg-neutral-700/20" : "bg-neutral-300/20")}
            animate={{
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
              delay: i * 0.1,
            }}
          />
        </div>
      ))}
    </div>
  );
}

export function SkeletonCard({ className, theme = "dark" }: { className?: string; theme?: "light" | "dark" }) {
  return (
    <div
      className={cn(
        "rounded-xl border p-6 space-y-4",
        theme === "dark" ? "border-neutral-800 bg-neutral-900/50" : "border-neutral-200 bg-neutral-100",
        className
      )}
    >
      {/* Avatar + name row */}
      <div className="flex items-center gap-3">
        <SkeletonShimmer theme={theme} width={40} height={40} rounded="full" />
        <div className="flex-1 space-y-2">
          <SkeletonShimmer theme={theme} width="60%" height={14} />
          <SkeletonShimmer theme={theme} width="40%" height={10} />
        </div>
      </div>
      {/* Body lines */}
      <SkeletonShimmer theme={theme} count={3} height={12} />
      {/* Image placeholder */}
      <SkeletonShimmer theme={theme} height={160} rounded="lg" />
    </div>
  );
}

export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonShimmer
          key={i}
          width={i === lines - 1 ? "70%" : "100%"}
          height={14}
        />
      ))}
    </div>
  );
}
