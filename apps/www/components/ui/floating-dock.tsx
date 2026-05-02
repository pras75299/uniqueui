"use client";
import { cn } from "@/lib/utils";
import React, { useLayoutEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
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
  magneticRange = 140,
  theme = "dark",
}: FloatingDockProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "inline-flex items-end gap-2 rounded-2xl border backdrop-blur-md px-4 py-3 shadow-sm",
        "transition-shadow duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "[@media(hover:hover)_and_(pointer:fine)]:hover:shadow-md",
        theme === "dark"
          ? "border-neutral-800 bg-neutral-900/80 [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-black/25"
          : "border-neutral-200 bg-white/90 [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-neutral-400/30",
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

function smoothstep(t: number) {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
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
  const prefersReducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const updateBounds = () => {
      const bounds = el.getBoundingClientRect();
      centerXRef.current = bounds.left + bounds.width / 2;
    };

    updateBounds();
    const RO = typeof ResizeObserver !== "undefined" ? ResizeObserver : null;
    const ro = RO ? new RO(updateBounds) : null;
    if (ro) ro.observe(el);
    window.addEventListener("resize", updateBounds);
    window.addEventListener("scroll", updateBounds, true);

    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", updateBounds);
      window.removeEventListener("scroll", updateBounds, true);
    };
  }, []);

  const distance = useTransform(mouseX, (val: number) => {
    const centerX = centerXRef.current;
    if (centerX == null) {
      return Number.POSITIVE_INFINITY;
    }
    return val - centerX;
  });

  const springConfig = prefersReducedMotion
    ? { stiffness: 900, damping: 52, mass: 0.18 }
    : { stiffness: 48, damping: 26, mass: 0.45 };

  const maxLift = prefersReducedMotion ? 0 : 11;

  const sizeTransform = useTransform(distance, (d) => {
    if (!Number.isFinite(d)) return iconSize;
    const ad = Math.abs(d);
    if (ad >= magneticRange) return iconSize;
    const t = 1 - ad / magneticRange;
    const s = smoothstep(t);
    return iconSize + (iconSize * maxScale - iconSize) * s;
  });
  const size = useSpring(sizeTransform, springConfig);

  const yTransform = useTransform(distance, (d) => {
    if (!Number.isFinite(d) || maxLift === 0) return 0;
    const ad = Math.abs(d);
    if (ad >= magneticRange) return 0;
    const t = 1 - ad / magneticRange;
    const s = smoothstep(t);
    return -maxLift * s;
  });
  const y = useSpring(yTransform, springConfig);

  const Wrapper = href ? "a" : "button";
  const wrapperProps = href
    ? { href, target: "_blank", rel: "noopener noreferrer" }
    : { type: "button" as const, onClick };

  return (
    <Wrapper
      {...(wrapperProps as Record<string, unknown>)}
      aria-label={label}
      className={cn(
        "group relative cursor-pointer rounded-xl outline-none",
        "focus-visible:ring-2 focus-visible:ring-offset-2",
        theme === "dark"
          ? "focus-visible:ring-neutral-400 focus-visible:ring-offset-neutral-950"
          : "focus-visible:ring-neutral-400 focus-visible:ring-offset-white"
      )}
    >
      <motion.div
        ref={ref}
        style={{ width: size, height: size, y }}
        whileTap={
          prefersReducedMotion
            ? undefined
            : { scale: 0.96, transition: { type: "spring", stiffness: 520, damping: 38 } }
        }
        className={cn(
          "flex items-center justify-center rounded-xl border will-change-transform",
          "transition-[color,background-color,border-color,box-shadow] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
          "motion-reduce:transition-[color,background-color,border-color] motion-reduce:duration-100 motion-reduce:ease-out",
          theme === "dark"
            ? "bg-neutral-800 border-neutral-700 text-neutral-300 shadow-none [@media(hover:hover)_and_(pointer:fine)]:group-hover:text-white [@media(hover:hover)_and_(pointer:fine)]:group-hover:border-neutral-600 [@media(hover:hover)_and_(pointer:fine)]:group-hover:shadow-md [@media(hover:hover)_and_(pointer:fine)]:group-hover:shadow-black/25"
            : "bg-neutral-100 border-neutral-300 text-neutral-700 shadow-none [@media(hover:hover)_and_(pointer:fine)]:group-hover:text-neutral-900 [@media(hover:hover)_and_(pointer:fine)]:group-hover:border-neutral-400 [@media(hover:hover)_and_(pointer:fine)]:group-hover:shadow-sm"
        )}
      >
        {icon}
      </motion.div>
      <div
        className={cn(
          "pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 translate-y-1",
          "[@media(hover:hover)_and_(pointer:fine)]:transition-[opacity,transform] [@media(hover:hover)_and_(pointer:fine)]:duration-150 [@media(hover:hover)_and_(pointer:fine)]:ease-[cubic-bezier(0.22,1,0.36,1)]",
          "[@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100 [@media(hover:hover)_and_(pointer:fine)]:group-hover:translate-y-0",
          "motion-reduce:translate-y-0 motion-reduce:[@media(hover:hover)_and_(pointer:fine)]:transition-none",
          "motion-reduce:[@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100"
        )}
      >
        <div
          className={cn(
            "whitespace-nowrap rounded-md border px-2 py-1 text-xs shadow-lg backdrop-blur-sm",
            theme === "dark"
              ? "bg-neutral-800/95 border-neutral-700 text-neutral-200"
              : "bg-neutral-800/95 border-neutral-600 text-neutral-200"
          )}
        >
          {label}
        </div>
      </div>
    </Wrapper>
  );
}
