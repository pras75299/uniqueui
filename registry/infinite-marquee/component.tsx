"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";

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

    return () => {
      observer.disconnect();
    };
  }, [children, gap]);

  const duration = segmentWidth > 0 ? segmentWidth / speed : 20;
  const marqueeDistance = `${segmentWidth > 0 ? -segmentWidth : -1}px`;
  const repeatCount =
    segmentWidth > 0 ? Math.max(2, Math.ceil(containerWidth / segmentWidth) + 1) : 2;

  return (
    <div
      ref={containerRef}
      className={cn("overflow-hidden", className)}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      <div
        className="flex w-max"
        style={{
          animationName: "marquee-scroll",
          animationDuration: `${duration}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          animationDirection: direction === "left" ? "normal" : "reverse",
          animationPlayState: isPaused ? "paused" : "running",
          willChange: "transform",
          ["--marquee-distance" as string]: marqueeDistance,
        }}
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
      </div>
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
