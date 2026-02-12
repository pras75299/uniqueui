"use client";
import React, { useEffect, useRef, useState } from "react";
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);

  useEffect(() => {
    if (scrollRef.current) {
      setContentWidth(scrollRef.current.scrollWidth / 2);
    }
  }, [children]);

  const duration = contentWidth / speed;

  return (
    <div
      className={cn("overflow-hidden", pauseOnHover && "group", className)}
    >
      <div
        ref={scrollRef}
        className={cn(
          "flex w-max",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
        style={{
          gap: `${gap}px`,
          animation: contentWidth
            ? `marquee-scroll ${duration || 20}s linear infinite`
            : undefined,
          ["--marquee-distance" as string]: `${direction === "left" ? -(contentWidth + gap) : contentWidth + gap}px`,
        }}
      >
        {/* Original content */}
        <div className="flex shrink-0 items-center" style={{ gap: `${gap}px` }}>
          {children}
        </div>
        {/* Duplicated content for seamless loop */}
        <div className="flex shrink-0 items-center" style={{ gap: `${gap}px` }}>
          {children}
        </div>
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

