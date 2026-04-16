"use client";

import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform, useSpring, HTMLMotionProps } from "motion/react";

export interface HorizontalScrollGalleryProps
  extends Omit<HTMLMotionProps<"div">, "onAnimationStart" | "onDragStart" | "onDragEnd" | "onDrag"> {
  items: React.ReactNode[];
  direction?: "left" | "right";
  itemClassName?: string;
  theme?: "light" | "dark";
}

export function HorizontalScrollGallery({
  className,
  items,
  direction = "left",
  itemClassName,
  _theme = "dark",
  ...props
}: HorizontalScrollGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  // Store the computed max scroll offset in a ref to avoid re-renders
  const maxOffset = useRef(0);

  // Track the scroll progress of the large container (300vh)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Apply a spring to the scroll progress for natural momentum
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 250,
    damping: 30,
    mass: 0.1,
  });

  // Measure the track width after mount and on resize so we translate by exact pixels.
  // This avoids the calc(−100% + 100vw) approach which breaks when items don't fill
  // the viewport and also avoids the MotionValue<string> type incompatibility.
  useEffect(() => {
    const measure = () => {
      if (!trackRef.current) return;
      const trackWidth = trackRef.current.scrollWidth;
      const viewportWidth = window.innerWidth;
      maxOffset.current = Math.max(0, trackWidth - viewportWidth);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Derive a pixel-based x translation from the spring progress
  const x = useTransform(smoothProgress, (value) => {
    const offset = maxOffset.current;
    return direction === "left" ? -value * offset : -(1 - value) * offset;
  });

  return (
    <motion.div
      {...props}
      ref={containerRef}
      className={cn("relative h-[300vh] w-full", className)}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center">
        <motion.div
          ref={trackRef}
          style={{ x }}
          className="flex h-full w-max items-center px-4"
        >
          {items.map((item, index) => (
            <div
              key={index}
              className={cn(
                "relative flex-shrink-0 mx-4 h-[60vh] w-[80vw] sm:w-[50vw] md:w-[40vw] lg:w-[30vw] xl:w-[25vw] rounded-2xl overflow-hidden",
                itemClassName
              )}
            >
              {item}
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
