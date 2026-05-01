"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls } from "motion/react";

export interface InfiniteMarqueeProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  direction?: "left" | "right";
  pauseOnHover?: boolean;
  gap?: number;
  theme?: "light" | "dark";
}

export function InfiniteMarquee({
  children,
  className,
  speed = 40,
  direction = "left",
  pauseOnHover = true,
  gap = 16,
  theme: _theme = "dark",
}: InfiniteMarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const segmentRef = useRef<HTMLDivElement>(null);
  const [segmentWidth, setSegmentWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const controls = useAnimationControls();

  useEffect(() => {
    const segment = segmentRef.current;
    const container = containerRef.current;
    if (!segment || !container) return;

    const measure = () => {
      const nextSegmentWidth = segment.getBoundingClientRect().width;
      const nextContainerWidth = container.getBoundingClientRect().width;
      setSegmentWidth(nextSegmentWidth > 0 ? nextSegmentWidth : 0);
      setContainerWidth(nextContainerWidth > 0 ? nextContainerWidth : 0);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(segment);
    observer.observe(container);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [children, gap]);

  const duration = segmentWidth / speed;
  const startX = direction === "left" ? 0 : -segmentWidth;
  const endX = direction === "left" ? -segmentWidth : 0;
  const repeatCount =
    segmentWidth > 0 ? Math.max(2, Math.ceil(containerWidth / segmentWidth) + 1) : 2;

  useEffect(() => {
    if (!segmentWidth) return;
    controls.set({ x: startX });
  }, [controls, startX, segmentWidth]);

  useEffect(() => {
    if (!segmentWidth) return;

    if (isPaused) {
      controls.stop();
      return;
    }

    controls.start({
      x: endX,
      transition: {
        duration: duration || 20,
        repeat: Infinity,
        repeatType: "loop",
        ease: "linear",
      },
    });
  }, [controls, direction, duration, endX, isPaused, segmentWidth]);

  return (
    <div
      ref={containerRef}
      className={cn("overflow-hidden", className)}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      <motion.div
        className="flex w-max"
        style={{ x: startX }}
        animate={controls}
      >
        {/* Measured original segment */}
        <div
          ref={segmentRef}
          className="flex shrink-0 items-center"
          style={{ gap: `${gap}px`, paddingRight: `${gap}px` }}
        >
          {children}
        </div>
        {/* Additional repeated segments to guarantee viewport coverage */}
        {Array.from({ length: repeatCount - 1 }).map((_, idx) => (
          <div
            key={idx}
            className="flex shrink-0 items-center"
            style={{ gap: `${gap}px`, paddingRight: `${gap}px` }}
          >
            {children}
          </div>
        ))}
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
