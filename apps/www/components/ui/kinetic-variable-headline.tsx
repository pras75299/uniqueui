"use client";

import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { cn } from "@/lib/utils";

export interface KineticVariableHeadlineProps {
  text: string;
  mode?: "entrance" | "pointer" | "both";
  weightRange?: [number, number];
  staggerMs?: number;
  className?: string;
  as?: "h1" | "h2" | "h3";
}

interface GlyphProps {
  char: string;
  initialWeight: number;
  targetWeight: number;
  minWeight: number;
  maxWeight: number;
  spring: { stiffness: number; damping: number };
  delay: number;
  setRef: (node: HTMLSpanElement | null) => void;
}

function Glyph({
  char,
  initialWeight,
  targetWeight,
  minWeight,
  maxWeight,
  spring,
  delay,
  setRef,
}: GlyphProps) {
  const wght = useSpring(initialWeight, spring);
  const fontVariationSettings = useMotionTemplate`"wght" ${wght}`;
  const scale = useTransform(wght, [minWeight, maxWeight], [0.94, 1.03]);

  useEffect(() => {
    wght.set(targetWeight);
  }, [targetWeight, wght]);

  return (
    <motion.span
      ref={setRef}
      aria-hidden
      className="inline-block whitespace-pre"
      style={{ fontVariationSettings, scale, transformOrigin: "50% 72%" }}
      initial={{ opacity: 0.98 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.01 }}
    >
      {char === " " ? "\u00A0" : char}
    </motion.span>
  );
}

export const KineticVariableHeadline = React.forwardRef<
  HTMLHeadingElement,
  KineticVariableHeadlineProps
>(function KineticVariableHeadline(
  {
    text,
    mode = "both",
    weightRange = [200, 700],
    staggerMs = 25,
    className,
    as = "h1",
  },
  ref,
) {
  const HeadingTag = as;
  const containerRef = useRef<HTMLHeadingElement | null>(null);
  const glyphRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const reduceMotion = useReducedMotion();
  const [inView, setInView] = useState(false);
  const [pointerActive, setPointerActive] = useState(false);
  const [pointerWeights, setPointerWeights] = useState<number[]>([]);

  const [minWeight, maxWeight] = weightRange;
  const glyphs = useMemo(() => Array.from(text), [text]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(Boolean(entry?.isIntersecting));
      },
      { threshold: 0.15 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    glyphRefs.current = glyphs.map((_, i) => glyphRefs.current[i] ?? null);
  }, [glyphs]);

  const handlePointerMove = (event: React.PointerEvent<HTMLHeadingElement>) => {
    if (!inView || reduceMotion || mode === "entrance") return;
    setPointerActive(true);

    const px = event.clientX;
    const py = event.clientY;
    const radius = 180;

    setPointerWeights(
      glyphs.map((_, index) => {
        const node = glyphRefs.current[index];
        if (!node) return minWeight;
        const rect = node.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const d = Math.hypot(px - cx, py - cy);
        const t = Math.max(0, 1 - d / radius);
        return Math.round(minWeight + (maxWeight - minWeight) * (t * t));
      }),
    );
  };

  const handlePointerLeave = () => {
    if (reduceMotion || mode === "entrance") return;
    setPointerActive(false);
    setPointerWeights(glyphs.map(() => minWeight));
  };

  return (
    <HeadingTag
      ref={(node) => {
        containerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLHeadingElement | null>).current = node;
      }}
      aria-label={text}
      className={cn(
        "font-[InterVariable,Inter,sans-serif] leading-[0.95] tracking-tight",
        className,
      )}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {glyphs.map((char, index) => (
        (() => {
          const spring =
            mode === "pointer"
              ? { stiffness: 200, damping: 24 }
              : { stiffness: 120, damping: 14 };
          const entranceWeight = inView ? maxWeight : minWeight;
          const targetWeight = reduceMotion
            ? maxWeight
            : mode === "entrance"
              ? entranceWeight
              : mode === "pointer"
                ? (pointerWeights[index] ?? minWeight)
                : pointerActive
                  ? (pointerWeights[index] ?? maxWeight)
                  : entranceWeight;
          const delay =
            !reduceMotion &&
            (mode === "entrance" || mode === "both") &&
            !pointerActive
              ? (inView ? index * (staggerMs / 1000) : 0)
              : 0;

          return (
        <Glyph
          key={`${char}-${index}`}
          char={char}
          initialWeight={reduceMotion ? maxWeight : minWeight}
          targetWeight={targetWeight}
          minWeight={minWeight}
          maxWeight={maxWeight}
          spring={spring}
          delay={delay}
          setRef={(node) => {
            glyphRefs.current[index] = node;
          }}
        />
          );
        })()
      ))}
    </HeadingTag>
  );
});

KineticVariableHeadline.displayName = "KineticVariableHeadline";

export default KineticVariableHeadline;
