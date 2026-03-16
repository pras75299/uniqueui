"use client";

import React, { useRef } from "react";
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
  theme = "dark",
  ...props
}: HorizontalScrollGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track the scroll progress of the large container (e.g. 300vh)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    // Start tracking when the top of the container hits the top of the viewport
    // Stop tracking when the bottom of the container hits the bottom of the viewport
    offset: ["start start", "end end"],
  });

  // Apply a spring to the scroll progress for natural momentum
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 250,
    damping: 30,
    mass: 0.1,
  });

  // Calculate translation range based on direction
  // We use matching string templates so Framer Motion can interpolate the numbers
  // from 0% to -100% offset by the viewport width so it stops exactly cleanly!
  const x = useTransform(
    smoothProgress,
    [0, 1],
    direction === "left" 
      ? ["calc(0% + 0vw)", "calc(-100% + 100vw)"] 
      : ["calc(-100% + 100vw)", "calc(0% + 0vw)"]
  );

  return (
    <motion.div
      ref={containerRef}
      className={cn("relative h-[300vh] w-full", className)}
      {...props}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center">
        <motion.div
          style={{ x } as any}
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
