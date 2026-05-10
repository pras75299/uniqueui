"use client";

import { motion, useScroll, useSpring, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import type { FintechThemeTokens } from "./theme";

/**
 * Editorial scroll progress: a 1px hairline that fills left-to-right
 * as the page scrolls. Pinned to the top, sits above the sticky nav.
 *
 * The hairline uses a soft spring to smooth the otherwise-jittery
 * scroll-tied scaleX. Per Emil: decorative spring usage is fine
 * because it's tied to a continuous gesture (scroll), not an
 * entrance — and it never starts from `scale(0)` because the
 * scroll origin sits at the left edge.
 */
export function ScrollProgress({ tokens }: { tokens: FintechThemeTokens }) {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 32,
    mass: 0.4,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      className={cn(
        "fixed inset-x-0 top-0 z-[60] h-px origin-left",
        tokens.text,
        "bg-current",
      )}
      style={{ scaleX: reduceMotion ? 1 : scaleX, opacity: 0.55 }}
    />
  );
}
