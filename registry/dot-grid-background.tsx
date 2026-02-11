"use client";
import React, { useCallback, useRef } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface DotGridBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  dotColor?: string;
  dotSize?: number;
  gap?: number;
  hoverRadius?: number;
  hoverScale?: number;
}

export function DotGridBackground({
  children,
  className,
  dotColor = "rgba(255, 255, 255, 0.15)",
  dotSize = 2,
  gap = 24,
  hoverRadius = 120,
  hoverScale = 3,
}: DotGridBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(-1000);
    mouseY.set(-1000);
  }, [mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative overflow-hidden bg-neutral-950",
        className
      )}
    >
      {/* Static dot grid via CSS pattern */}
      <div
        className="absolute inset-0 opacity-100"
        style={{
          backgroundImage: `radial-gradient(circle, ${dotColor} ${dotSize * 0.5}px, transparent ${dotSize * 0.5}px)`,
          backgroundSize: `${gap}px ${gap}px`,
        }}
      />

      {/* Animated glow following cursor */}
      <motion.div
        className="pointer-events-none absolute"
        style={{
          x: useTransform(mouseX, (v) => v - hoverRadius),
          y: useTransform(mouseY, (v) => v - hoverRadius),
          width: hoverRadius * 2,
          height: hoverRadius * 2,
          background: `radial-gradient(circle, ${dotColor.replace(
            /[\d.]+\)$/,
            "0.6)"
          )} 0%, transparent 70%)`,
          filter: `blur(${dotSize * 2}px)`,
        }}
      />

      {/* Animated dot highlight effect - CSS mask reveals bigger dots near cursor */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, ${dotColor.replace(
            /[\d.]+\)$/,
            "0.8)"
          )} ${dotSize * hoverScale * 0.5}px, transparent ${dotSize * hoverScale * 0.5}px)`,
          backgroundSize: `${gap}px ${gap}px`,
          maskImage: `radial-gradient(circle ${hoverRadius}px at var(--mx) var(--my), black 0%, transparent 100%)`,
          WebkitMaskImage: `radial-gradient(circle ${hoverRadius}px at var(--mx) var(--my), black 0%, transparent 100%)`,
        }}
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
