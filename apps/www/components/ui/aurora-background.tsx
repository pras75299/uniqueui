"use client";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

export interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children?: ReactNode;
  showRadialGradient?: boolean;
  theme?: "light" | "dark";
  /**
   * Preserve original preset names for backward compatibility if needed,
   * though the implementation is now fully customizable via `colors` prop.
   */
  preset?: "cinematic" | "stitch" | "custom";
  /** Optional array of exactly *five* color stops (e.g. hex, rgba) */
  colors?: string[];
  /** Animation duration in seconds. Default: 60 */
  speed?: number;
  /** Blur filter strength in pixels. Default: 10 */
  blur?: number;
}

const PRESET_COLORS: Record<string, string[]> = {
  cinematic: [
    "rgba(45,95,108,0.8)", // teal
    "rgba(78,56,98,0.8)", // plum
    "rgba(112,76,52,0.8)", // copper
    "rgba(48,72,82,0.8)", // muted teal
    "rgba(72,52,88,0.8)", // dark plum
  ],
  stitch: [
    "rgba(194,132,255,0.8)", // purple
    "rgba(47,46,190,0.8)", // blue
    "rgba(250,83,164,0.8)", // pink
    "rgba(194,132,255,0.8)", // purple
    "rgba(47,46,190,0.8)", // blue
  ],
  default: [
    "#3b82f6", // blue-500
    "#a5b4fc", // indigo-300
    "#93c5fd", // blue-300
    "#ddd6fe", // violet-200
    "#60a5fa", // blue-400
  ],
};

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  theme = "dark",
  preset,
  colors,
  speed = 60,
  blur = 10,
  ...props
}: AuroraBackgroundProps) => {
  const isDark = theme === "dark";

  // Resolve colors: user colors > preset colors > default colors
  const activeColors = colors || PRESET_COLORS[preset || "default"] || PRESET_COLORS.default;

  // Create repeating gradient stops
  const colorStr = activeColors.map((c, i) => `${c} ${10 + i * 5}%`).join(", ");
  const auroraGradient = `repeating-linear-gradient(100deg, ${colorStr})`;
  
  const whiteGradient = `repeating-linear-gradient(100deg, #fff 0%, #fff 7%, transparent 10%, transparent 12%, #fff 16%)`;
  const darkGradient = `repeating-linear-gradient(100deg, #000 0%, #000 7%, transparent 10%, transparent 12%, #000 16%)`;

  const backgroundImage = isDark 
    ? `${darkGradient}, ${auroraGradient}`
    : `${whiteGradient}, ${auroraGradient}`;

  return (
    <div
      className={cn(
        "relative flex flex-col h-[100vh] items-center justify-center bg-zinc-50 dark:bg-zinc-900 text-slate-950 transition-bg",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 overflow-hidden">
        {/* Main masked wrapper */}
        <div
          className={cn(
            "pointer-events-none absolute -inset-[10px] opacity-50 will-change-transform",
            showRadialGradient &&
              `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)]` // The Aceternity style radial gradient
          )}
          style={{
            backgroundImage,
            backgroundSize: "300%, 200%",
            backgroundPosition: "50% 50%, 50% 50%",
            filter: `blur(${blur}px) ${isDark ? "" : "invert(1)"}`,
          }}
        >
          {/* Animated overlapping element recreating internal 'after' pseudo class */}
          <div 
             className="absolute inset-0 animate-aurora"
             style={{
               backgroundImage,
               backgroundSize: "200%, 100%",
               backgroundAttachment: "fixed",
               mixBlendMode: "difference",
               animationDuration: `${speed}s`,
             }}
          />
        </div>
      </div>
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">{children}</div>
    </div>
  );
};

export default AuroraBackground;
