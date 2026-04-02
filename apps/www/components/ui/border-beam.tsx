"use client";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

export interface BorderBeamProps {
  children?: React.ReactNode;
  className?: string;
  /** Time in seconds for one full orbit */
  duration?: number;
  /** Comet colour at the head */
  colorFrom?: string;
  /** Comet colour at the tail */
  colorTo?: string;
  /** Diameter of the glowing orb in px */
  size?: number;
  /** Width of the border ring in px */
  borderWidth?: number;
  theme?: "light" | "dark";
}

export function BorderBeam({
  children,
  className,
  duration = 5,
  colorFrom = "#a855f7",
  colorTo = "#ec4899",
  size = 160,
  borderWidth = 1.5,
  theme = "dark",
}: BorderBeamProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    const beam = beamRef.current;
    if (!container || !beam) return;

    const animate = (timestamp: number) => {
      const { width: w, height: h } = container.getBoundingClientRect();
      const perimeter = 2 * (w + h);
      const speed = perimeter / (duration * 1000); // px per ms

      progressRef.current =
        (progressRef.current + speed * (1000 / 60)) % perimeter;

      const d = progressRef.current;
      let x: number;
      let y: number;

      if (d < w) {
        x = d;
        y = 0;
      } else if (d < w + h) {
        x = w;
        y = d - w;
      } else if (d < 2 * w + h) {
        x = w - (d - w - h);
        y = h;
      } else {
        x = 0;
        y = h - (d - 2 * w - h);
      }

      beam.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [duration]);

  const borderColor =
    theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden rounded-xl", className)}
      style={{ border: `${borderWidth}px solid ${borderColor}` }}
    >
      {/* Glowing comet */}
      <span
        ref={beamRef}
        aria-hidden="true"
        className="pointer-events-none absolute z-10 rounded-full"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle at 30% 30%, ${colorFrom}cc, ${colorTo}77, transparent 70%)`,
          filter: `blur(${size * 0.12}px)`,
          top: 0,
          left: 0,
          willChange: "transform",
        }}
      />
      {children}
    </div>
  );
}
