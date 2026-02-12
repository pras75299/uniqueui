"use client";
import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface SkeletonShimmerProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: "sm" | "md" | "lg" | "xl" | "full";
  count?: number;
  gap?: number;
}

export function SkeletonShimmer({
  className,
  width = "100%",
  height = "20px",
  rounded = "md",
  count = 1,
  gap = 12,
}: SkeletonShimmerProps) {
  const roundedMap = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full",
  };

  return (
    <div className="flex flex-col" style={{ gap: `${gap}px` }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "relative overflow-hidden bg-neutral-800/50",
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
        </div>
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-4",
        className
      )}
    >
      {/* Avatar + name row */}
      <div className="flex items-center gap-3">
        <SkeletonShimmer width={40} height={40} rounded="full" />
        <div className="flex-1 space-y-2">
          <SkeletonShimmer width="60%" height={14} />
          <SkeletonShimmer width="40%" height={10} />
        </div>
      </div>
      {/* Body lines */}
      <SkeletonShimmer count={3} height={12} />
      {/* Image placeholder */}
      <SkeletonShimmer height={160} rounded="lg" />
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
