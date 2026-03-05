"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export interface CursorTrailProps {
  /** The color of the trail particles */
  color?: string;
  /** How many particles should exist at once (controls length of the trail) */
  trailLength?: number;
  /** Scaling factor for the trail size */
  size?: number;
  /** How long it takes for a particle to decay */
  decayDuration?: number;
  className?: string;
}

export function CursorTrail({
  color = "#a855f7",
  trailLength = 20,
  size = 12,
  decayDuration = 0.5,
  className,
}: CursorTrailProps) {
  const [positions, setPositions] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    let animationFrameId: number = 0;
    let particleId = 0;

    const handleMouseMove = (e: MouseEvent) => {
      setPositions((prev) => {
        // Add new position to array
        const newPositions = [
          ...prev,
          { id: particleId++, x: e.clientX, y: e.clientY },
        ];
        // Keep array capped to max length roughly based on trailLength
        if (newPositions.length > trailLength) {
          return newPositions.slice(-trailLength);
        }
        return newPositions;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [trailLength]);

  return (
    <div
      className={cn("pointer-events-none fixed inset-0 z-[9999] overflow-hidden", className)}
    >
      <AnimatePresence>
        {positions.map((pos) => (
          <motion.div
            key={pos.id}
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 0 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: decayDuration, ease: "easeOut" }}
            style={{
              left: pos.x - size / 2,
              top: pos.y - size / 2,
              width: size,
              height: size,
              background: color,
              boxShadow: `0 0 ${size * 1.5}px ${color}`,
            }}
            className="absolute rounded-full"
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
