"use client";
import React, { useRef } from "react";
import { motion, useInView } from "motion/react";
import { cn } from "@/lib/utils";

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  date?: string;
  icon?: React.ReactNode;
  color?: string;
}

export interface AnimatedTimelineProps {
  items: TimelineItem[];
  className?: string;
  lineColor?: string;
  orientation?: "vertical" | "horizontal";
}

export function AnimatedTimeline({
  items,
  className,
  lineColor = "rgba(255, 255, 255, 0.1)",
  orientation = "vertical",
}: AnimatedTimelineProps) {
  if (orientation === "horizontal") {
    return (
      <HorizontalTimeline
        items={items}
        className={className}
        lineColor={lineColor}
      />
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div
        className="absolute left-5 top-0 bottom-0 w-px"
        style={{ backgroundColor: lineColor }}
      />

      <div className="space-y-8">
        {items.map((item, index) => (
          <TimelineNode key={item.id} item={item} index={index} />
        ))}
      </div>
    </div>
  );
}

function TimelineNode({
  item,
  index,
}: {
  item: TimelineItem;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: index * 0.1,
      }}
      className="relative flex items-start gap-4 pl-12"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : { scale: 0 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
          delay: index * 0.1 + 0.1,
        }}
        className="absolute left-[12px] top-1 z-10 flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-neutral-700 bg-neutral-900"
        style={{
          borderColor: item.color || "rgb(115, 115, 115)",
        }}
      >
        {item.icon ? (
          <span className="text-[10px]">{item.icon}</span>
        ) : (
          <div
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor: item.color || "#a855f7",
            }}
          />
        )}
      </motion.div>

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={
          isInView
            ? { scale: [0, 2], opacity: [0.6, 0] }
            : { scale: 0, opacity: 0 }
        }
        transition={{
          delay: index * 0.1 + 0.2,
          duration: 0.6,
        }}
        className="absolute left-[14px] top-[6px] h-[18px] w-[18px] rounded-full border"
        style={{
          borderColor: item.color || "#a855f7",
        }}
      />

      <div className="flex-1 min-w-0 pb-2">
        {item.date && (
          <span className="text-xs text-neutral-500 mb-1 block">{item.date}</span>
        )}
        <h4 className="text-sm font-semibold text-white">{item.title}</h4>
        {item.description && (
          <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>
    </motion.div>
  );
}

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
      <div
        className="absolute top-5 left-0 right-0 h-px"
        style={{ backgroundColor: lineColor }}
      />

      <div className="flex gap-8 overflow-x-auto pb-4">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={
              isInView
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 20 }
            }
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
              delay: index * 0.15,
            }}
            className="flex flex-col items-center min-w-[140px]"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : { scale: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: index * 0.15 + 0.1,
              }}
              className="relative z-10 flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-neutral-700 bg-neutral-900 mb-4"
              style={{
                borderColor: item.color || "rgb(115, 115, 115)",
              }}
            >
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color || "#a855f7" }}
              />
            </motion.div>

            <div className="text-center">
              {item.date && (
                <span className="text-xs text-neutral-500 mb-1 block">
                  {item.date}
                </span>
              )}
              <h4 className="text-sm font-semibold text-white">
                {item.title}
              </h4>
              {item.description && (
                <p className="text-xs text-neutral-400 mt-1 max-w-[160px]">
                  {item.description}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
