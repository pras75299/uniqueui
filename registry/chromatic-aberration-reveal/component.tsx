"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
} from "motion/react";
import { cn } from "@/lib/utils";

export interface ChromaticAberrationRevealProps
  extends Omit<HTMLMotionProps<"div">, "onDrag"> {
  src: string;
  alt: string;
  splitDistance?: number;
  staggerMs?: number;
  trigger?: "in-view" | "mount" | "manual";
  isVisible?: boolean;
  className?: string;
}

export const ChromaticAberrationReveal = React.forwardRef<
  HTMLDivElement,
  ChromaticAberrationRevealProps
>(function ChromaticAberrationReveal(
  {
    src,
    alt,
    splitDistance = 16,
    staggerMs = 80,
    trigger = "in-view",
    isVisible = false,
    className,
    ...rest
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();
  const [inViewVisible, setInViewVisible] = useState(false);
  const [wavePlayed, setWavePlayed] = useState(false);

  useEffect(() => {
    if (trigger !== "in-view") return;
    const node = containerRef.current;
    if (!node) return;

    let hasTriggered = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (hasTriggered) return;
        if (entry?.isIntersecting) {
          hasTriggered = true;
          setInViewVisible(true);
          io.unobserve(node);
        }
      },
      { threshold: 0.2 },
    );

    io.observe(node);
    return () => io.disconnect();
  }, [trigger]);

  const visible = trigger === "manual" ? isVisible : trigger === "mount" ? true : inViewVisible;

  const delayStep = staggerMs / 1000;
  const shouldPlayWave = visible && !reduceMotion && !wavePlayed;

  return (
    <motion.div
      ref={(node) => {
        containerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      className={cn(
        "relative isolate overflow-hidden rounded-2xl bg-black",
        className,
      )}
      {...rest}
    >
      <img
        src={src}
        alt={alt}
        className="block h-full w-full object-cover"
        loading="lazy"
        decoding="async"
      />

      {!reduceMotion ? (
        <>
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 [mix-blend-mode:screen]"
            initial={{ x: -splitDistance, opacity: 0.6 }}
            animate={visible ? { x: 0, opacity: 1 } : { x: -splitDistance, opacity: 0.6 }}
            transition={{ type: "spring", stiffness: 220, damping: 26, delay: 0 }}
          >
            <img
              src={src}
              alt=""
              className="h-full w-full object-cover [filter:brightness(1.3)_saturate(1.35)_hue-rotate(0deg)]"
              loading="lazy"
              decoding="async"
            />
          </motion.div>

          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 [mix-blend-mode:screen]"
            initial={{ x: 0, opacity: 0.6 }}
            animate={visible ? { x: 0, opacity: 1 } : { x: 0, opacity: 0.6 }}
            transition={{
              type: "spring",
              stiffness: 205,
              damping: 28,
              delay: delayStep,
            }}
          >
            <img
              src={src}
              alt=""
              className="h-full w-full object-cover [filter:brightness(1.28)_saturate(1.28)_hue-rotate(120deg)]"
              loading="lazy"
              decoding="async"
            />
          </motion.div>

          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 [mix-blend-mode:screen]"
            initial={{ x: splitDistance, opacity: 0.6 }}
            animate={visible ? { x: 0, opacity: 1 } : { x: splitDistance, opacity: 0.6 }}
            transition={{
              type: "spring",
              stiffness: 190,
              damping: 30,
              delay: delayStep * 2,
            }}
          >
            <img
              src={src}
              alt=""
              className="h-full w-full object-cover [filter:brightness(1.26)_saturate(1.32)_hue-rotate(240deg)]"
              loading="lazy"
              decoding="async"
            />
          </motion.div>

          {shouldPlayWave ? (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -left-1/3 top-0 h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent blur-xl"
              initial={{ x: "-120%", opacity: 0 }}
              animate={{ x: "260%", opacity: [0, 0.65, 0] }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              onAnimationComplete={() => setWavePlayed(true)}
            />
          ) : null}
        </>
      ) : (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: visible ? 0 : 0.16 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      )}
    </motion.div>
  );
});

ChromaticAberrationReveal.displayName = "ChromaticAberrationReveal";

export default ChromaticAberrationReveal;
