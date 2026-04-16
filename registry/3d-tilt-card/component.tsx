"use client";
import React, { useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  tiltMaxDeg?: number;
  perspective?: number;
  scale?: number;
  glare?: boolean;
  glareMaxOpacity?: number;
}

export function TiltCard({
  children,
  className,
  containerClassName,
  tiltMaxDeg = 15,
  perspective = 1000,
  scale = 1.05,
  glare = true,
  glareMaxOpacity = 0.35,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { stiffness: 300, damping: 20 };
  const rotateX = useSpring(
    useTransform(mouseY, [0, 1], [tiltMaxDeg, -tiltMaxDeg]),
    springConfig
  );
  const rotateY = useSpring(
    useTransform(mouseX, [0, 1], [-tiltMaxDeg, tiltMaxDeg]),
    springConfig
  );

  const glareOpacity = useSpring(0, springConfig);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width);
      mouseY.set((e.clientY - rect.top) / rect.height);
    },
    [mouseX, mouseY]
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
    glareOpacity.set(glareMaxOpacity);
  }, [glareOpacity, glareMaxOpacity]);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
    glareOpacity.set(0);
  }, [mouseX, mouseY, glareOpacity]);

  return (
    <div
      className={cn("relative", containerClassName)}
      style={{ perspective: `${perspective}px` }}
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        animate={{ scale: isHovering ? scale : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={cn(
          "relative rounded-xl overflow-hidden",
          className
        )}
      >
        <div style={{ transform: "translateZ(0)" }}>{children}</div>
        {glare && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-xl"
            style={{
              opacity: glareOpacity,
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 60%)",
            }}
          />
        )}
      </motion.div>
    </div>
  );
}
