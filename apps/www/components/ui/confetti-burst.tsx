"use client";
import React, { useCallback, useRef } from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ConfettiBurstProps {
  children: React.ReactNode;
  className?: string;
  particleCount?: number;
  colors?: string[];
  spread?: number;
  duration?: number;
}

export function ConfettiBurst({
  children,
  className,
  particleCount = 30,
  colors = ["#a855f7", "#ec4899", "#6366f1", "#f59e0b", "#10b981", "#3b82f6"],
  spread = 200,
  duration = 1000,
}: ConfettiBurstProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const burst = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const originX = e.clientX - rect.left;
      const originY = e.clientY - rect.top;

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 8 + 4;
        const isCircle = Math.random() > 0.5;
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * spread + spread * 0.3;
        const targetX = Math.cos(angle) * velocity;
        const targetY = Math.sin(angle) * velocity - 100; // bias upward
        const rotation = Math.random() * 720 - 360;

        Object.assign(particle.style, {
          position: "absolute",
          left: `${originX}px`,
          top: `${originY}px`,
          width: `${size}px`,
          height: `${isCircle ? size : size * 0.6}px`,
          backgroundColor: color,
          borderRadius: isCircle ? "50%" : "2px",
          pointerEvents: "none",
          zIndex: "50",
          transform: "translate(-50%, -50%)",
          transition: `all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
          opacity: "1",
        });

        containerRef.current.appendChild(particle);

        // Trigger animation in next frame
        requestAnimationFrame(() => {
          Object.assign(particle.style, {
            transform: `translate(calc(-50% + ${targetX}px), calc(-50% + ${targetY}px)) rotate(${rotation}deg)`,
            opacity: "0",
          });
        });

        // Cleanup
        setTimeout(() => {
          particle.remove();
        }, duration + 100);
      }
    },
    [particleCount, colors, spread, duration]
  );

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      onClick={burst}
    >
      {children}
    </div>
  );
}
