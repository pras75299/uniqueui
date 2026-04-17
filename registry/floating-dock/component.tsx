"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";

export interface FloatingDockProps {
  items: {
    id: string;
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
    href?: string;
  }[];
  className?: string;
  iconSize?: number;
  maxScale?: number;
  magneticRange?: number;
  theme?: "light" | "dark";
}

export function FloatingDock({
  items,
  className,
  iconSize = 40,
  maxScale = 1.8,
  magneticRange = 120,
  theme = "dark",
}: FloatingDockProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "inline-flex items-end gap-2 rounded-2xl border backdrop-blur-md px-4 py-3",
        theme === "dark" ? "border-neutral-800 bg-neutral-900/80" : "border-neutral-200 bg-white/90",
        className
      )}
    >
      {items.map((item) => (
        <DockItem
          key={item.id}
          mouseX={mouseX}
          iconSize={iconSize}
          maxScale={maxScale}
          magneticRange={magneticRange}
          theme={theme}
          {...item}
        />
      ))}
    </motion.div>
  );
}

function DockItem({
  icon,
  label,
  onClick,
  href,
  mouseX,
  iconSize,
  maxScale,
  magneticRange,
  theme = "dark",
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  href?: string;
  mouseX: MotionValue<number>;
  iconSize: number;
  maxScale: number;
  magneticRange: number;
  theme?: "light" | "dark";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const centerXRef = useRef<number | null>(null);

  useEffect(() => {
    const updateBounds = () => {
      if (!ref.current) return;
      const bounds = ref.current.getBoundingClientRect();
      centerXRef.current = bounds.x + bounds.width / 2;
    };

    updateBounds();
    window.addEventListener("resize", updateBounds);

    return () => {
      window.removeEventListener("resize", updateBounds);
    };
  }, []);

  const distance = useTransform(mouseX, (val: number) => {
    const centerX = centerXRef.current;
    if (centerX == null) {
      return Infinity;
    }
    return val - centerX;
  });

  const springConfig = { stiffness: 200, damping: 15, mass: 0.5 };

  const sizeTransform = useTransform(
    distance,
    [-magneticRange, 0, magneticRange],
    [iconSize, iconSize * maxScale, iconSize]
  );
  const size = useSpring(sizeTransform, springConfig);

  const yTransform = useTransform(
    distance,
    [-magneticRange, 0, magneticRange],
    [0, -10, 0]
  );
  const y = useSpring(yTransform, springConfig);

  const Wrapper = href ? "a" : "button";
  const wrapperProps = href
    ? { href, target: "_blank", rel: "noopener noreferrer" }
    : { onClick };

  return (
    <Wrapper {...(wrapperProps as Record<string, unknown>)} aria-label={label} className="group relative">
      <motion.div
        ref={ref}
        style={{ width: size, height: size, y }}
        className={cn(
          "flex items-center justify-center rounded-xl border transition-colors",
          theme === "dark" ? "bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white" : "bg-neutral-100 border-neutral-300 text-neutral-700 hover:text-neutral-900"
        )}
      >
        {icon}
      </motion.div>
      <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className={cn("whitespace-nowrap rounded-md border px-2 py-1 text-xs shadow-lg", theme === "dark" ? "bg-neutral-800 border-neutral-700 text-neutral-200" : "bg-neutral-800 border-neutral-600 text-neutral-200")}>
          {label}
        </div>
      </div>
    </Wrapper>
  );
}
