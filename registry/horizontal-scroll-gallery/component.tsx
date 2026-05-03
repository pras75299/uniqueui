"use client";

import React, { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  HTMLMotionProps,
} from "motion/react";

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
  theme: _theme = "dark",
  ...props
}: HorizontalScrollGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [maxOffset, setMaxOffset] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 24,
    mass: 0.35,
  });

  useEffect(() => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) return;
    const measure = () => {
      const trackWidth = track.scrollWidth;
      const viewportWidth = viewport.clientWidth;
      setMaxOffset((prev) => {
        const next = Math.max(0, trackWidth - viewportWidth);
        return next === prev ? prev : next;
      });
    };
    measure();
    const RO = typeof ResizeObserver !== "undefined" ? ResizeObserver : null;
    const ro = RO ? new RO(measure) : null;
    if (ro) {
      ro.observe(track);
      ro.observe(viewport);
    }
    window.addEventListener("resize", measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const x = useTransform(smoothProgress, (value) =>
    direction === "left" ? -value * maxOffset : -(1 - value) * maxOffset,
  );

  return (
    <motion.div
      {...props}
      ref={containerRef}
      className={cn("relative h-[300vh] w-full", className)}
    >
      <div
        ref={viewportRef}
        className="sticky top-0 h-screen w-full overflow-hidden flex items-center"
      >
        <motion.div
          ref={trackRef}
          style={{ x }}
          className="flex h-full w-max items-center px-4"
        >
          {items.map((item, index) => (
            <div
              key={index}
              className={cn(
                "relative shrink-0 mx-4 h-[60vh] w-[80vw] sm:w-[50vw] md:w-[40vw] lg:w-[30vw] xl:w-[25vw] rounded-2xl overflow-hidden",
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
