"use client";
import React, { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
}

export function FloatingDock({
  items,
  className,
  iconSize = 40,
  maxScale = 1.8,
  magneticRange = 120,
}: FloatingDockProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "inline-flex items-end gap-2 rounded-2xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-md px-4 py-3",
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
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  href?: string;
  mouseX: MotionValue<number>;
  iconSize: number;
  maxScale: number;
  magneticRange: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
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
    <Wrapper {...(wrapperProps as any)} className="group relative">
      <motion.div
        ref={ref}
        style={{ width: size, height: size, y }}
        className="flex items-center justify-center rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white transition-colors"
      >
        {icon}
      </motion.div>
      <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="whitespace-nowrap rounded-md bg-neutral-800 border border-neutral-700 px-2 py-1 text-xs text-neutral-200 shadow-lg">
          {label}
        </div>
      </div>
    </Wrapper>
  );
}
