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
  src?: string;
  alt?: string;
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
    alt = "",
    splitDistance = 32,
    staggerMs = 220,
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
  const hasImage = Boolean(src);

  return (
    <motion.div
      ref={(node) => {
        containerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      className={cn(
        "relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950",
        className,
      )}
      {...rest}
    >
      {hasImage ? (
        <img
          src={src}
          alt={alt}
          className="block h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(110%_90%_at_20%_10%,rgba(255,255,255,0.25),transparent_58%),radial-gradient(120%_90%_at_80%_85%,rgba(59,130,246,0.24),transparent_60%),linear-gradient(135deg,#0f172a,#1e293b,#0f172a)]"
        />
      )}

      {!reduceMotion ? (
        <>
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 [mix-blend-mode:screen]"
            initial={{ x: -splitDistance, opacity: 0.3 }}
            animate={visible ? { x: 0, opacity: 1 } : { x: -splitDistance, opacity: 0.3 }}
            transition={{ type: "spring", stiffness: 95, damping: 20, delay: 0 }}
          >
            <div
              className={cn(
                "h-full w-full",
                hasImage
                  ? "bg-cover bg-center [filter:grayscale(1)_contrast(1.4)_brightness(1.2)_sepia(1)_saturate(4)_hue-rotate(0deg)]"
                  : "bg-[linear-gradient(135deg,#0f172a,#1e293b,#0f172a)] [filter:contrast(1.25)_brightness(1.08)]",
              )}
              style={hasImage ? { backgroundImage: `url("${src}")` } : undefined}
            />
          </motion.div>

          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 [mix-blend-mode:screen]"
            initial={{ x: 0, opacity: 0.3 }}
            animate={visible ? { x: 0, opacity: 1 } : { x: 0, opacity: 0.3 }}
            transition={{
              type: "spring",
              stiffness: 86,
              damping: 22,
              delay: delayStep,
            }}
          >
            <div
              className={cn(
                "h-full w-full",
                hasImage
                  ? "bg-cover bg-center [filter:grayscale(1)_contrast(1.35)_brightness(1.15)_sepia(1)_saturate(4)_hue-rotate(120deg)]"
                  : "bg-[linear-gradient(135deg,#0f172a,#1e293b,#0f172a)] [filter:contrast(1.22)_brightness(1.06)_hue-rotate(120deg)]",
              )}
              style={hasImage ? { backgroundImage: `url("${src}")` } : undefined}
            />
          </motion.div>

          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 [mix-blend-mode:screen]"
            initial={{ x: splitDistance, opacity: 0.3 }}
            animate={visible ? { x: 0, opacity: 1 } : { x: splitDistance, opacity: 0.3 }}
            transition={{
              type: "spring",
              stiffness: 78,
              damping: 24,
              delay: delayStep * 2,
            }}
          >
            <div
              className={cn(
                "h-full w-full",
                hasImage
                  ? "bg-cover bg-center [filter:grayscale(1)_contrast(1.35)_brightness(1.15)_sepia(1)_saturate(4)_hue-rotate(240deg)]"
                  : "bg-[linear-gradient(135deg,#0f172a,#1e293b,#0f172a)] [filter:contrast(1.22)_brightness(1.06)_hue-rotate(240deg)]",
              )}
              style={hasImage ? { backgroundImage: `url("${src}")` } : undefined}
            />
          </motion.div>

          {shouldPlayWave ? (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -left-1/3 top-0 h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent blur-xl"
              initial={{ x: "-120%", opacity: 0 }}
              animate={{ x: "260%", opacity: [0, 0.65, 0] }}
              transition={{ duration: 1.2, ease: "easeOut" }}
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
