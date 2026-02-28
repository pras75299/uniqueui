"use client";
import React, { useRef } from "react";
import { motion, useInView } from "motion/react";
import { cn } from "@/lib/utils";

// ─── Constants ─────────────────────────────────────────────────────────────────

const DOT_SIZE = 28;          // circle diameter in px
const LINE_LEFT = DOT_SIZE / 2; // the line sits at exactly the circle centre

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  date?: string;
  icon?: React.ReactNode;
  /** Per-item accent color for the circle, glow, and connecting line segment */
  color?: string;
}

export interface AnimatedTimelineProps {
  items: TimelineItem[];
  className?: string;
  /** Fallback line color when an item has no color */
  lineColor?: string;
  orientation?: "vertical" | "horizontal";
}

// ─── Main component ──────────────────────────────────────────────────────────

export function AnimatedTimeline({
  items,
  className,
  lineColor = "rgba(255,255,255,0.08)",
  orientation = "vertical",
}: AnimatedTimelineProps) {
  if (orientation === "horizontal") {
    return (
      <HorizontalTimeline items={items} className={className} lineColor={lineColor} />
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* Background connecting line — centred under circles */}
      <div
        className="absolute top-0 bottom-0 w-px"
        style={{ left: LINE_LEFT, backgroundColor: lineColor }}
      />

      <div className="space-y-6">
        {items.map((item, index) => (
          <TimelineNode key={item.id} item={item} index={index} />
        ))}
      </div>
    </div>
  );
}

// ─── Vertical node ───────────────────────────────────────────────────────────

function TimelineNode({ item, index }: { item: TimelineItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const color = item.color || "#a855f7";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -24 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -24 }}
      transition={{ type: "spring", stiffness: 100, damping: 15, delay: index * 0.1 }}
      className="relative flex items-start"
      style={{ paddingLeft: DOT_SIZE + 16 }}
    >
      {/* Circle */}
      <motion.div
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : { scale: 0 }}
        transition={{
          type: "spring",
          stiffness: 320,
          damping: 22,
          delay: index * 0.1 + 0.08,
        }}
        className="absolute z-10 flex items-center justify-center rounded-full"
        style={{
          width: DOT_SIZE,
          height: DOT_SIZE,
          left: 0,
          top: 2,
          background: `radial-gradient(circle at 35% 35%, ${color}cc, ${color}88)`,
          boxShadow: `0 0 0 3px ${color}22, 0 0 12px ${color}55`,
          border: `2px solid ${color}99`,
        }}
      >
        {item.icon ? (
          <span className="text-[11px] leading-none">{item.icon}</span>
        ) : (
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: "#fff", opacity: 0.9 }}
          />
        )}
      </motion.div>

      {/* Ripple ring */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={isInView ? { scale: 2.2, opacity: 0 } : { scale: 0.6, opacity: 0 }}
        transition={{ delay: index * 0.1 + 0.18, duration: 0.7, ease: "easeOut" }}
        className="absolute z-0 rounded-full"
        style={{
          width: DOT_SIZE,
          height: DOT_SIZE,
          left: 0,
          top: 2,
          border: `1.5px solid ${color}`,
        }}
      />

      {/* Content */}
      <div className="flex-1 min-w-0 pb-1">
        {item.date && (
          <span className="text-[11px] text-neutral-500 mb-0.5 block">{item.date}</span>
        )}
        <h4 className="text-sm font-semibold text-white leading-snug">{item.title}</h4>
        {item.description && (
          <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{item.description}</p>
        )}
      </div>
    </motion.div>
  );
}

// ─── Horizontal timeline ──────────────────────────────────────────────────────

function HorizontalTimeline({
  items,
  className,
  lineColor,
}: {
  items: TimelineItem[];
  className?: string;
  lineColor: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <div ref={ref} className={cn("relative", className)}>
      {/* Background connecting line — centred behind circles */}
      <div
        className="absolute left-0 right-0 h-px"
        style={{ top: DOT_SIZE / 2, backgroundColor: lineColor }}
      />

      <div className="flex gap-8 overflow-x-auto pb-4">
        {items.map((item, index) => {
          const color = item.color || "#a855f7";
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 15,
                delay: index * 0.15,
              }}
              className="flex flex-col items-center min-w-[140px]"
            >
              {/* Circle */}
              <motion.div
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : { scale: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 320,
                  damping: 22,
                  delay: index * 0.15 + 0.1,
                }}
                className="relative z-10 flex items-center justify-center rounded-full mb-4"
                style={{
                  width: DOT_SIZE,
                  height: DOT_SIZE,
                  background: `radial-gradient(circle at 35% 35%, ${color}cc, ${color}88)`,
                  boxShadow: `0 0 0 3px ${color}22, 0 0 12px ${color}55`,
                  border: `2px solid ${color}99`,
                }}
              >
                {item.icon ? (
                  <span className="text-[11px] leading-none">{item.icon}</span>
                ) : (
                  <div className="h-2.5 w-2.5 rounded-full bg-white/90" />
                )}
              </motion.div>

              <div className="text-center">
                {item.date && (
                  <span className="text-[11px] text-neutral-500 mb-0.5 block">{item.date}</span>
                )}
                <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                {item.description && (
                  <p className="text-xs text-neutral-400 mt-1 max-w-[160px]">{item.description}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
