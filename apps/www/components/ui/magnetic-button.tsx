"use client";
import React, { useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

export interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  magneticStrength?: number;
  magneticRadius?: number;
  onClick?: () => void;
  disabled?: boolean;
}

export function MagneticButton({
  children,
  className,
  magneticStrength = 0.3,
  magneticRadius = 150,
  onClick,
  disabled = false,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  const springConfig = { stiffness: 200, damping: 15, mass: 0.5 };
  const x = useSpring(useMotionValue(0), springConfig);
  const y = useSpring(useMotionValue(0), springConfig);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current || disabled) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const distance = Math.sqrt(distX * distX + distY * distY);

      if (distance < magneticRadius) {
        x.set(distX * magneticStrength);
        y.set(distY * magneticStrength);
      }
    },
    [disabled, magneticRadius, magneticStrength, x, y]
  );

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      disabled={disabled}
      style={{ x, y }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-neutral-800 to-neutral-900 px-8 py-3 text-sm font-medium text-white shadow-lg transition-shadow duration-300",
        isHovering && "shadow-xl shadow-purple-500/20",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <motion.span
        animate={isHovering ? { scale: 1.05 } : { scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="relative z-10"
      >
        {children}
      </motion.span>

      {/* Glow effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20"
        animate={{ opacity: isHovering ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
}
