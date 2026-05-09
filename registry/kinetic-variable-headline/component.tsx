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
  /**
   * Granularity of the weight animation. `"char"` animates each glyph independently
   * (and can break mid-word at narrow viewports). `"word"` animates whole words and
   * keeps each word as an inline-block so it never wraps internally. Default `"char"`.
   */
  splitBy?: "char" | "word";
  /**
   * Radius (in CSS px) within which the pointer pulls glyph weight up. `"auto"`
   * sizes it to ~30% of the headline's measured width, so the effect feels
   * proportional whether the headline is 24px or 200px. Default `"auto"`.
   */
  pointerRadius?: number | "auto";
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
      {char}
    </motion.span>
  );
}

type Unit = { kind: "glyph"; text: string } | { kind: "space"; text: string };

function splitUnits(text: string, splitBy: "char" | "word"): Unit[] {
  if (splitBy === "word") {
    // Tokenize keeping whitespace runs as their own units so we can render them
    // outside of inline-block wrappers — that way native word breaking still works.
    const out: Unit[] = [];
    const re = /(\s+)/;
    text.split(re).forEach((tok) => {
      if (tok.length === 0) return;
      out.push({ kind: re.test(tok) ? "space" : "glyph", text: tok });
    });
    return out;
  }
  // "char": each char is its own unit; spaces are marked so we can render them as
  // real spaces (allows native breaking and clean copy-paste).
  return Array.from(text).map<Unit>((c) =>
    c === " " ? { kind: "space", text: c } : { kind: "glyph", text: c },
  );
}

interface ResolveContext {
  reduceMotion: boolean;
  inView: boolean;
  pointerActive: boolean;
  mode: NonNullable<KineticVariableHeadlineProps["mode"]>;
  minWeight: number;
  maxWeight: number;
  pointerWeights: number[];
  staggerMs: number;
}

function resolveTarget(index: number, ctx: ResolveContext) {
  const { reduceMotion, inView, pointerActive, mode, minWeight, maxWeight } = ctx;
  if (reduceMotion) return maxWeight;
  if (mode === "entrance") return inView ? maxWeight : minWeight;
  if (mode === "pointer") return ctx.pointerWeights[index] ?? minWeight;
  // mode === "both"
  if (pointerActive) return ctx.pointerWeights[index] ?? maxWeight;
  return inView ? maxWeight : minWeight;
}

function resolveDelay(index: number, ctx: ResolveContext) {
  const { reduceMotion, inView, pointerActive, mode, staggerMs } = ctx;
  if (reduceMotion) return 0;
  if (pointerActive) return 0;
  if (mode !== "entrance" && mode !== "both") return 0;
  return inView ? index * (staggerMs / 1000) : 0;
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
    splitBy = "char",
    pointerRadius = "auto",
  },
  ref,
) {
  const HeadingTag = as;
  const containerRef = useRef<HTMLHeadingElement | null>(null);
  // Glyph DOM refs are kept aligned with `glyphIndices` (only for kind:"glyph" units).
  const glyphRefs = useRef<(HTMLSpanElement | null)[]>([]);
  // Cached glyph centers (in viewport coords). Re-measured on resize / unit changes.
  const glyphCentersRef = useRef<{ cx: number; cy: number }[]>([]);
  // Cached headline bbox width — used for the "auto" pointer radius.
  const containerWidthRef = useRef(0);
  const reduceMotion = useReducedMotion();
  const [inView, setInView] = useState(false);
  const [pointerActive, setPointerActive] = useState(false);
  const [pointerWeights, setPointerWeights] = useState<number[]>([]);

  const [minWeight, maxWeight] = weightRange;

  const units = useMemo(() => splitUnits(text, splitBy), [text, splitBy]);
  const glyphIndices = useMemo(
    () =>
      units
        .map((u, i) => (u.kind === "glyph" ? i : -1))
        .filter((i) => i >= 0),
    [units],
  );
  const glyphCount = glyphIndices.length;

  // Keep glyphRefs aligned with the current glyph count without thrashing the array.
  useEffect(() => {
    glyphRefs.current = Array.from(
      { length: glyphCount },
      (_, i) => glyphRefs.current[i] ?? null,
    );
    glyphCentersRef.current = Array.from(
      { length: glyphCount },
      (_, i) => glyphCentersRef.current[i] ?? { cx: 0, cy: 0 },
    );
  }, [glyphCount]);

  // IntersectionObserver for the entrance trigger.
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

  // Cache glyph rects + container width on mount, on resize, and when fonts load
  // (the bbox shifts once the variable font swaps in).
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const measure = () => {
      const containerRect = node.getBoundingClientRect();
      containerWidthRef.current = containerRect.width;
      glyphCentersRef.current = glyphRefs.current.map((g) => {
        if (!g) return { cx: 0, cy: 0 };
        const r = g.getBoundingClientRect();
        return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
      });
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(node);

    // Re-measure on scroll so cached viewport coords stay accurate. passive listener
    // — we don't preventDefault, so this stays cheap on long pages.
    window.addEventListener("scroll", measure, { passive: true });

    // Variable fonts often arrive after the first paint — re-measure once they do.
    const docFonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (docFonts && typeof docFonts.ready?.then === "function") {
      docFonts.ready.then(measure).catch(() => {});
    }

    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", measure);
    };
  }, [glyphCount]);

  const handlePointerMove = (event: React.PointerEvent<HTMLHeadingElement>) => {
    if (!inView || reduceMotion || mode === "entrance" || glyphCount === 0) return;
    setPointerActive(true);

    const px = event.clientX;
    const py = event.clientY;
    const radius =
      pointerRadius === "auto"
        ? Math.max(120, containerWidthRef.current * 0.3)
        : pointerRadius;
    const radius2 = radius * radius;

    const centers = glyphCentersRef.current;
    setPointerWeights(
      Array.from({ length: glyphCount }, (_, gi) => {
        const c = centers[gi];
        if (!c) return minWeight;
        const dx = px - c.cx;
        const dy = py - c.cy;
        const d2 = dx * dx + dy * dy;
        if (d2 >= radius2) return minWeight;
        const t = 1 - Math.sqrt(d2) / radius;
        return Math.round(minWeight + (maxWeight - minWeight) * (t * t));
      }),
    );
  };

  const handlePointerLeave = () => {
    if (reduceMotion || mode === "entrance") return;
    setPointerActive(false);
    setPointerWeights(Array.from({ length: glyphCount }, () => minWeight));
  };

  const ctx: ResolveContext = {
    reduceMotion: Boolean(reduceMotion),
    inView,
    pointerActive,
    mode,
    minWeight,
    maxWeight,
    pointerWeights,
    staggerMs,
  };

  const spring =
    mode === "pointer"
      ? { stiffness: 200, damping: 24 }
      : { stiffness: 120, damping: 14 };

  let glyphCursor = 0;

  return (
    <HeadingTag
      ref={(node) => {
        containerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref)
          (ref as React.MutableRefObject<HTMLHeadingElement | null>).current = node;
      }}
      aria-label={text}
      className={cn(
        "font-[InterVariable,Inter,sans-serif] leading-[0.95] tracking-tight",
        className,
      )}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {units.map((unit, idx) => {
        if (unit.kind === "space") {
          // Render real whitespace so native word breaking and copy/paste work.
          return (
            <span key={`s-${idx}`} aria-hidden>
              {unit.text}
            </span>
          );
        }
        const gi = glyphCursor++;
        const targetWeight = resolveTarget(gi, ctx);
        const delay = resolveDelay(gi, ctx);
        // For splitBy="word" each unit is multi-char and we want it to never wrap
        // mid-word — `inline-block` plus `whitespace-pre` keeps internal kerning intact.
        return (
          <Glyph
            key={`g-${idx}`}
            char={unit.text}
            initialWeight={reduceMotion ? maxWeight : minWeight}
            targetWeight={targetWeight}
            minWeight={minWeight}
            maxWeight={maxWeight}
            spring={spring}
            delay={delay}
            setRef={(node) => {
              glyphRefs.current[gi] = node;
            }}
          />
        );
      })}
    </HeadingTag>
  );
});

KineticVariableHeadline.displayName = "KineticVariableHeadline";

export default KineticVariableHeadline;
