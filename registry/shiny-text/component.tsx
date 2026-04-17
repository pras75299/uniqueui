"use client";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export interface ShinyTextProps {
  text: string;
  className?: string;
  /** Duration of one full shimmer pass in seconds */
  speed?: number;
  /** Width of the bright band as a percentage of the text */
  shimmerWidth?: number;
  theme?: "light" | "dark";
}

export function ShinyText({
  text,
  className,
  speed = 3,
  shimmerWidth = 40,
  theme = "dark",
}: ShinyTextProps) {
  const half = shimmerWidth / 2;
  const dim =
    theme === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.22)";
  const bright =
    theme === "dark" ? "rgba(255,255,255,1)" : "rgba(0,0,0,1)";

  return (
    <motion.span
      className={cn("inline-block", className)}
      animate={{ backgroundPosition: ["200% center", "-200% center"] }}
      transition={{
        duration: speed,
        repeat: Infinity,
        ease: "linear",
        repeatType: "loop",
      }}
      style={{
        background: `linear-gradient(120deg, ${dim} 0%, ${dim} ${50 - half}%, ${bright} 50%, ${dim} ${50 + half}%, ${dim} 100%)`,
        backgroundSize: "250% auto",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      {text}
    </motion.span>
  );
}
