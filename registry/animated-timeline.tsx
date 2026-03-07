"use client";
import React, { useRef } from "react";
import { motion, useInView } from "motion/react";
import { cn } from "@/lib/utils";

// ─── Constants ─────────────────────────────────────────────────────────────────

const DOT_SIZE = 28;
const LINE_LEFT = DOT_SIZE / 2;

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  date?: string;
  icon?: React.ReactNode;
  /** Per-item accent color for the circle, glow, and connecting line */
  color?: string;
}

export interface AnimatedTimelineProps {
  items: TimelineItem[];
  className?: string;
  /** Fallback line color when an item has no color */
  lineColor?: string;
  /**
   * Layout / animation variant:
   * - "vertical"    — staggered slide-from-left with colored circles and ripple (default)
   * - "horizontal"  — left-to-right with growing connecting line
   * - "cards"       — alternating left/right slide-in cards
   * - "steps"       — numbered progress steps with radial fill on entry
   */
  variant?: "vertical" | "horizontal" | "cards" | "steps";
  /** @deprecated Use variant="horizontal" instead */
  orientation?: "vertical" | "horizontal";
}

// ─── Main component ──────────────────────────────────────────────────────────

export function AnimatedTimeline({
  items,
  className,
  lineColor = "rgba(255,255,255,0.08)",
  variant,
  orientation = "vertical",
}: AnimatedTimelineProps) {
  // Support legacy orientation prop. variant takes precedence.
  const resolvedVariant = variant ?? (orientation === "horizontal" ? "horizontal" : "vertical");

  if (resolvedVariant === "horizontal") {
    return <HorizontalTimeline items={items} className={className} lineColor={lineColor} />;
  }
  if (resolvedVariant === "cards") {
    return <CardsTimeline items={items} className={className} lineColor={lineColor} />;
  }
  if (resolvedVariant === "steps") {
    return <StepsTimeline items={items} className={className} />;
  }

  // ── Vertical (default) ───────────────────────────────────────────────────
  return (
    <div className={cn("relative", className)}>
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
      {/* Colored circle */}
      <motion.div
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : { scale: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 22, delay: index * 0.1 + 0.08 }}
        className="absolute z-10 flex items-center justify-center rounded-full"
        style={{
          width: DOT_SIZE, height: DOT_SIZE, left: 0, top: 2,
          background: `radial-gradient(circle at 35% 35%, ${color}cc, ${color}88)`,
          boxShadow: `0 0 0 3px ${color}22, 0 0 12px ${color}55`,
          border: `2px solid ${color}99`,
        }}
      >
        {item.icon
          ? <span className="text-[11px] leading-none">{item.icon}</span>
          : <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#fff", opacity: 0.9 }} />
        }
      </motion.div>

      {/* Ripple ring */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={isInView ? { scale: 2.2, opacity: 0 } : { scale: 0.6, opacity: 0 }}
        transition={{ delay: index * 0.1 + 0.18, duration: 0.7, ease: "easeOut" }}
        className="absolute z-0 rounded-full"
        style={{ width: DOT_SIZE, height: DOT_SIZE, left: 0, top: 2, border: `1.5px solid ${color}` }}
      />

      {/* Text */}
      <div className="flex-1 min-w-0 pb-1">
        {item.date && <span className="text-[11px] text-neutral-500 mb-0.5 block">{item.date}</span>}
        <h4 className="text-sm font-semibold text-white leading-snug">{item.title}</h4>
        {item.description && (
          <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{item.description}</p>
        )}
      </div>
    </motion.div>
  );
}

// ─── Horizontal timeline ──────────────────────────────────────────────────────
// Animation: connecting line grows left-to-right, dots pop in with spring

function HorizontalTimeline({ items, className, lineColor }: {
  items: TimelineItem[]; className?: string; lineColor: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <div ref={ref} className={cn("overflow-x-auto", className)}>
      <div className="flex min-w-max pb-4">
        {items.map((item, index) => {
          const color = item.color || "#a855f7";
          const isFirst = index === 0;
          const isLast = index === items.length - 1;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ type: "spring", stiffness: 100, damping: 16, delay: index * 0.15 }}
              className="flex flex-col items-center w-[200px]"
            >
              {/* ── Top row: left-half | dot | right-half ─────────────────── */}
              <div className="flex w-full items-center">

                {/* Left connector half — empty on first item */}
                <div className="flex-1 overflow-hidden" style={{ height: 1 }}>
                  {!isFirst && (
                    <motion.div
                      className="h-full w-full origin-right"
                      style={{ backgroundColor: lineColor }}
                      initial={{ scaleX: 0 }}
                      animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1], delay: index * 0.15 + 0.05 }}
                    />
                  )}
                </div>

                {/* Dot */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : { scale: 0 }}
                  transition={{ type: "spring", stiffness: 320, damping: 22, delay: index * 0.15 + 0.1 }}
                  className="relative z-10 flex items-center justify-center rounded-full flex-shrink-0"
                  style={{
                    width: DOT_SIZE, height: DOT_SIZE,
                    background: `radial-gradient(circle at 35% 35%, ${color}cc, ${color}88)`,
                    boxShadow: `0 0 0 3px ${color}22, 0 0 12px ${color}55`,
                    border: `2px solid ${color}99`,
                  }}
                >
                  {item.icon
                    ? <span className="text-[11px] leading-none">{item.icon}</span>
                    : <div className="h-2.5 w-2.5 rounded-full bg-white/90" />
                  }
                </motion.div>

                {/* Right connector half — empty on last item */}
                <div className="flex-1 overflow-hidden" style={{ height: 1 }}>
                  {!isLast && (
                    <motion.div
                      className="h-full w-full origin-left"
                      style={{ backgroundColor: lineColor }}
                      initial={{ scaleX: 0 }}
                      animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1], delay: index * 0.15 + 0.15 }}
                    />
                  )}
                </div>
              </div>

              {/* ── Text below dot ────────────────────────────────────────── */}
              <div className="text-center mt-4 px-1">
                {item.date && <span className="text-[11px] text-neutral-500 mb-0.5 block">{item.date}</span>}
                <h4 className="text-sm font-semibold text-white leading-snug">{item.title}</h4>
                {item.description && (
                  <p className="text-xs text-neutral-400 mt-1 max-w-[170px]">{item.description}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Cards timeline ───────────────────────────────────────────────────────────
// Animation: center vertical line, items alternate left/right and slide in

function CardsTimeline({ items, className, lineColor }: {
  items: TimelineItem[]; className?: string; lineColor: string;
}) {
  return (
    <div className={cn("relative", className)}>
      {/* Center vertical line */}
      <div className="absolute top-0 bottom-0 w-px left-1/2 -translate-x-1/2" style={{ backgroundColor: lineColor }} />

      <div className="space-y-8">
        {items.map((item, index) => {
          const isLeft = index % 2 === 0;
          const color = item.color || "#a855f7";
          return (
            <CardsTimelineRow key={item.id} item={item} index={index} isLeft={isLeft} color={color} />
          );
        })}
      </div>
    </div>
  );
}

function CardsTimelineRow({ item, index, isLeft, color }: {
  item: TimelineItem; index: number; isLeft: boolean; color: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      className="relative grid grid-cols-2 gap-4 items-center"
    >
      {/* Left side: either card or spacer */}
      <div className={cn("flex", isLeft ? "justify-end pr-4" : "justify-start pl-4")}>
        {isLeft ? (
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -32 }}
            transition={{ type: "spring", stiffness: 90, damping: 16, delay: index * 0.08 }}
            className="max-w-[220px] rounded-xl border border-neutral-800 bg-neutral-950 p-4"
            style={{ borderColor: `${color}22` }}
          >
            <CardContent item={item} color={color} isInView={isInView} index={index} />
          </motion.div>
        ) : null}
      </div>

      {/* Center dot */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: index * 0.08 + 0.06 }}
        className="absolute left-1/2 -translate-x-1/2 z-10 flex items-center justify-center rounded-full"
        style={{
          width: DOT_SIZE, height: DOT_SIZE,
          background: `radial-gradient(circle at 35% 35%, ${color}cc, ${color}88)`,
          boxShadow: `0 0 0 3px ${color}22, 0 0 14px ${color}55`,
          border: `2px solid ${color}99`,
        }}
      >
        {item.icon
          ? <span className="text-[11px] leading-none">{item.icon}</span>
          : <div className="h-2.5 w-2.5 rounded-full bg-white/90" />
        }
      </motion.div>

      {/* Right side: either spacer or card */}
      <div className={cn("flex", isLeft ? "justify-start pl-4" : "justify-end pr-4")}>
        {!isLeft ? (
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 32 }}
            transition={{ type: "spring", stiffness: 90, damping: 16, delay: index * 0.08 }}
            className="max-w-[220px] rounded-xl border border-neutral-800 bg-neutral-950 p-4"
            style={{ borderColor: `${color}22` }}
          >
            <CardContent item={item} color={color} isInView={isInView} index={index} />
          </motion.div>
        ) : null}
      </div>
    </motion.div>
  );
}

function CardContent({ item, color, isInView, index }: {
  item: TimelineItem; color: string; isInView: boolean; index: number;
}) {
  return (
    <>
      {item.date && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: index * 0.08 + 0.15, duration: 0.3 }}
          className="text-[10px] uppercase tracking-wider mb-1 block"
          style={{ color }}
        >
          {item.date}
        </motion.span>
      )}
      <motion.h4
        initial={{ opacity: 0, y: 6 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
        transition={{ type: "spring", stiffness: 120, damping: 16, delay: index * 0.08 + 0.18 }}
        className="text-sm font-semibold text-white"
      >
        {item.title}
      </motion.h4>
      {item.description && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 0.6 } : { opacity: 0 }}
          transition={{ delay: index * 0.08 + 0.25, duration: 0.4 }}
          className="text-xs text-neutral-400 mt-1 leading-relaxed"
        >
          {item.description}
        </motion.p>
      )}
    </>
  );
}

// ─── Steps timeline ───────────────────────────────────────────────────────────
// Animation: numbered circle fills radially, connector bar scales width, text blurs in

function StepsTimeline({ items, className }: { items: TimelineItem[]; className?: string }) {
  return (
    <div className={cn("space-y-0", className)}>
      {items.map((item, index) => (
        <StepNode key={item.id} item={item} index={index} total={items.length} />
      ))}
    </div>
  );
}

function StepNode({ item, index, total }: { item: TimelineItem; index: number; total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });
  const color = item.color || "#a855f7";
  const isLast = index === total - 1;

  return (
    <div ref={ref} className="flex gap-4">
      {/* Left: number + connector */}
      <div className="flex flex-col items-center">
        {/* Numbered circle — fills radially on entry */}
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.4, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 20, delay: index * 0.12 }}
          className="relative z-10 flex items-center justify-center rounded-full flex-shrink-0"
          style={{
            width: 32, height: 32,
            background: `radial-gradient(circle at 40% 40%, ${color}, ${color}99)`,
            boxShadow: `0 0 0 4px ${color}18, 0 0 16px ${color}44`,
          }}
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
            transition={{ delay: index * 0.12 + 0.1, duration: 0.25 }}
            className="text-xs font-bold text-white tabular-nums"
          >
            {index + 1}
          </motion.span>
        </motion.div>

        {/* Connector bar — scales from top down */}
        {!isLast && (
          <motion.div
            className="w-px flex-1 mt-1 mb-1 origin-top"
            style={{ backgroundColor: `${color}30` }}
            initial={{ scaleY: 0 }}
            animate={isInView ? { scaleY: 1 } : { scaleY: 0 }}
            transition={{ delay: index * 0.12 + 0.2, duration: 0.4, ease: "easeOut" }}
          />
        )}
      </div>

      {/* Right: text */}
      <motion.div
        initial={{ opacity: 0, x: 16, filter: "blur(4px)" }}
        animate={isInView ? { opacity: 1, x: 0, filter: "blur(0px)" } : { opacity: 0, x: 16, filter: "blur(4px)" }}
        transition={{ delay: index * 0.12 + 0.08, duration: 0.38, ease: [0.23, 1, 0.32, 1] }}
        className={cn("flex-1 min-w-0", isLast ? "pb-0" : "pb-6")}
      >
        {item.date && (
          <span className="text-[10px] uppercase tracking-wider block mb-0.5" style={{ color: `${color}bb` }}>
            {item.date}
          </span>
        )}
        <h4 className="text-sm font-semibold text-white">{item.title}</h4>
        {item.description && (
          <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{item.description}</p>
        )}
      </motion.div>
    </div>
  );
}
