"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface InfiniteMarqueeProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  direction?: "left" | "right";
  pauseOnHover?: boolean;
  gap?: number;
}

export function InfiniteMarquee({
  children,
  className,
  speed = 40,
  direction = "left",
  pauseOnHover = true,
  gap = 16,
}: InfiniteMarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      setContentWidth(scrollRef.current.scrollWidth / 2);
    }
  }, [children]);

  const duration = contentWidth / speed;

  return (
    <div
      ref={containerRef}
      className={cn("overflow-hidden", className)}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      <motion.div
        ref={scrollRef}
        className="flex w-max"
        style={{ gap: `${gap}px` }}
        animate={{
          x: direction === "left" ? [0, -contentWidth - gap] : [-contentWidth - gap, 0],
        }}
        transition={{
          x: {
            duration: duration || 20,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
          },
        }}
        {...(isPaused && {
          style: { animationPlayState: "paused", gap: `${gap}px` },
        })}
      >
        {/* Original content */}
        <div className="flex shrink-0 items-center" style={{ gap: `${gap}px` }}>
          {children}
        </div>
        {/* Duplicated content for seamless loop */}
        <div className="flex shrink-0 items-center" style={{ gap: `${gap}px` }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}

export function MarqueeItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/50 px-6 py-3",
        className
      )}
    >
      {children}
    </div>
  );
}
