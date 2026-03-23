"use client";
import React, { useId } from "react";
import { motion } from "motion/react";

export interface GlowingTextOutlineProps {
  /** The text to display */
  text?: string;
  /** Font size in pixels or string (e.g., "4rem") */
  fontSize?: number | string;
  /** Font weight */
  fontWeight?: string | number;
  /** Fill color of the text face */
  textColor?: string;
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
  textColor = "#080808",
  outlineColor = "#333333",
  colors = ["#ffaa40", "#9c40ff", "#ffaa40"],
  outlineWidth = 2,
  animationDuration = 2.5,
  staggerDelay = 0.2,
  dashArray = 1000,
}: GlowingTextOutlineProps) => {
  const uniqueId = useId().replace(/:/g, "");
  const gradientId = `glow-gradient-${uniqueId}`;

  const characters = text.split("");
  const totalCycleTime =
    animationDuration + characters.length * staggerDelay + 1.2; // 1.2s blank hold period at the end before looping

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
      className="relative inline-flex items-center justify-center select-none"
      style={{
        fontSize,
        fontWeight,
      }}
    >
      {/* Invisible HTML text blocks out the exact width and height needed by the container */}
      <span className="opacity-0 pointer-events-none">{text}</span>

      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ overflow: "visible" }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            {colors.map((color, index) => {
              const offset = `${(index / (colors.length - 1)) * 100}%`;
              return <stop key={index} offset={offset} stopColor={color} />;
            })}
          </linearGradient>
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
          strokeWidth={outlineWidth}
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
          strokeWidth={outlineWidth}
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

        {/* 3. Foreground Solid Text (Top Layer)
            Sits on top and covers the inner portions of the strokes!
        */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fill={textColor}
        >
          {text}
        </text>
      </svg>
    </div>
  );
};

export default GlowingTextOutline;
