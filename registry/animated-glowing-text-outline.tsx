"use client";
import React, { useId, useMemo } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface GlowingTextOutlineProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The text to display */
  text?: string;
  /** Font size in pixels or string (e.g., "4rem") */
  fontSize?: number | string;
  /** Font weight */
  fontWeight?: string | number;
  /** The default color of the unlit base outline */
  outlineColor?: string;
  /** Array of colors forming the animated gradient sweep */
  colors?: string[];
  /** Width of the text outline */
  outlineWidth?: number | string;
  /** Duration of the stroke-drawing animation for a SINGLE character (in seconds) */
  animationDuration?: number;
  /** Delay between each character starting to draw (in seconds) */
  staggerDelay?: number;
  /** Dash array length for the SVG stroke. Tune higher for longer paths. */
  dashArray?: number;
}

const GlowingTextOutline = ({
  text = "Hello World",
  fontSize = 80,
  fontWeight = 900,
  outlineColor = "#333333",
  colors = ["#ffaa40", "#9c40ff", "#ffaa40"],
  outlineWidth = 2,
  animationDuration = 2.5,
  staggerDelay = 0.2,
  dashArray = 1000,
  className,
  ...props
}: GlowingTextOutlineProps) => {
  const uniqueId = useId().replace(/:/g, "");
  const gradientId = `glow-gradient-${uniqueId}`;

  const maskId = `glow-mask-${uniqueId}`;

  const characters = text.split("");
  const totalCycleTime =
    animationDuration + characters.length * staggerDelay + 1.2; // 1.2s blank hold period at the end before looping

  // We double the stroke width because the mask will erase the inner half of the stroke
  const doubleOutlineWidth = useMemo(() => {
    if (typeof outlineWidth === "number") {
      return outlineWidth * 2;
    }
    return `calc(${outlineWidth} * 2)`;
  }, [outlineWidth]);

  const getAnimationProps = (index: number) => {
    const pStart = (index * staggerDelay) / totalCycleTime;
    const pEnd = pStart + animationDuration / totalCycleTime;

    if (pStart === 0) {
      return {
        strokeDashoffset: [dashArray, 0, 0],
        times: [0, pEnd, 1],
      };
    }

    return {
      strokeDashoffset: [dashArray, dashArray, 0, 0],
      times: [0, pStart, pEnd, 1],
    };
  };

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center select-none",
        className
      )}
      style={{
        fontSize,
        fontWeight,
      }}
      {...props}
    >
      {/* Invisible HTML text blocks out the exact width and height needed by the container */}
      <span className="opacity-0 pointer-events-none">{text}</span>

      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ overflow: "visible" }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            {colors.map((color, index) => {
              const offset =
                colors.length <= 1
                  ? "0%"
                  : `${(index / (colors.length - 1)) * 100}%`;
              return <stop key={index} offset={offset} stopColor={color} />;
            })}
          </linearGradient>

          {/* 
            This mask erases the inner body of the text, leaving ONLY the outer extended stroke.
            This prevents rendering ugly internal stroke geometry from self-intersecting font paths!
          */}
          <mask id={maskId}>
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="central"
              fill="black"
            >
              {text}
            </text>
          </mask>
        </defs>

        {/* 1. Base Outline Background 
            Gives the un-glowing parts of the outline a consistent base.
        */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fill="transparent"
          stroke={outlineColor}
          strokeWidth={doubleOutlineWidth}
          mask={`url(#${maskId})`}
        >
          {text}
        </text>

        {/* 2. The Animated "Writing" Gradient Outline (Highlighted Stroke Layer) */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fill="transparent"
          stroke={`url(#${gradientId})`}
          strokeWidth={doubleOutlineWidth}
          mask={`url(#${maskId})`}
        >
          {characters.map((char, index) => {
            const { strokeDashoffset, times } = getAnimationProps(index);
            return (
              <motion.tspan
                key={index}
                strokeDasharray={dashArray}
                initial={{ strokeDashoffset: dashArray }}
                animate={{ strokeDashoffset }}
                transition={{
                  duration: totalCycleTime,
                  repeat: Infinity,
                  ease: "easeOut",
                  times,
                }}
              >
                {char}
              </motion.tspan>
            );
          })}
        </text>

      </svg>
    </div>
  );
};

export default GlowingTextOutline;
