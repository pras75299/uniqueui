"use client";
import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface AuroraBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  showRadialGradient?: boolean;
}

export function AuroraBackground({
  children,
  className,
  showRadialGradient = true,
}: AuroraBackgroundProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-neutral-950 text-white transition-all",
        className
      )}
    >
      <div className="absolute inset-0 overflow-hidden">
        {/* Aurora blob 1 */}
        <motion.div
          className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full opacity-30 blur-[100px]"
          style={{
            background:
              "linear-gradient(135deg, #6366f1, #a855f7, #ec4899)",
          }}
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -80, 60, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />

        {/* Aurora blob 2 */}
        <motion.div
          className="absolute -bottom-20 -right-20 h-[500px] w-[500px] rounded-full opacity-25 blur-[100px]"
          style={{
            background:
              "linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6)",
          }}
          animate={{
            x: [0, -120, 80, 0],
            y: [0, 60, -100, 0],
            scale: [1, 0.8, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />

        {/* Aurora blob 3 */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[700px] rounded-full opacity-20 blur-[120px]"
          style={{
            background:
              "linear-gradient(45deg, #10b981, #06b6d4, #6366f1)",
          }}
          animate={{
            x: [0, 80, -60, 40, 0],
            y: [0, -60, 80, -40, 0],
            rotate: [0, 90, 180, 270, 360],
            scale: [1, 1.1, 0.9, 1.05, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
        />

        {showRadialGradient && (
          <div className="absolute inset-0 bg-neutral-950 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_70%)]" />
        )}
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}
