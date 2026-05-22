"use client";

import { useEffect, useMemo, useRef } from "react";
import type { ComponentProps, ElementType, ReactElement } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Magnetic Text — per-letter cursor-tracking text effect.
 *
 * Wraps a string of text in individual `<span>`s, each driven by its own
 * spring toward the cursor. Pure visual layer: the wrapper element keeps
 * the original text as its accessible name (via `aria-label`) and every
 * animated glyph is `aria-hidden`, so screen readers never spell out the
 * word character by character.
 *
 * Use cases beyond headlines: pull-quotes, brand wordmarks, marketing
 * accent phrases, hover-aware list labels.
 *
 * Falloff is linear inside `radius`, zero outside — letters past the
 * radius rest at their natural position rather than continuing to drift.
 * `strength` caps the maximum displacement (px) at peak proximity.
 *
 * Respects `prefers-reduced-motion`: magnetic follow disabled, optional
 * entrance animation collapses to opacity-only.
 */

type MagneticTextProps = Omit<ComponentProps<"span">, "children"> & {
  /** The text to animate. Each glyph becomes its own motion target. */
  text: string;
  /** Element tag to render. Defaults to `<span>`. Use `"h1"`/`"h2"` for headlines. */
  as?: ElementType;
  /** Pixel radius around each letter within which the cursor exerts pull. */
  radius?: number;
  /** Maximum displacement (px) any single letter can reach at peak proximity. */
  strength?: number;
  /** When true, letters stagger in with a spring on mount. */
  animateEntry?: boolean;
  /** When true, the soft white glow that fades in around letters near the cursor is disabled. */
  disableGlow?: boolean;
};

export function MagneticText({
  text,
  as,
  radius = 140,
  strength = 12,
  animateEntry = false,
  disableGlow = false,
  className,
  ...rest
}: MagneticTextProps): ReactElement {
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLElement | null>(null);
  const lettersRef = useRef<Array<HTMLSpanElement | null>>([]);
  const metricsRef = useRef<Array<{ cx: number; cy: number }>>([]);

  // Pointer position in the wrapper's local space. -10_000 means "not tracking".
  const px = useMotionValue(-10_000);
  const py = useMotionValue(-10_000);

  const chars = useMemo(() => Array.from(text), [text]);

  useEffect(() => {
    if (reduced) return;
    const wrap = wrapRef.current;
    if (!wrap) return;

    const measure = () => {
      const wrapRect = wrap.getBoundingClientRect();
      metricsRef.current = lettersRef.current.map((node) => {
        if (!node) return { cx: 0, cy: 0 };
        const r = node.getBoundingClientRect();
        return {
          cx: r.left + r.width / 2 - wrapRect.left,
          cy: r.top + r.height / 2 - wrapRect.top,
        };
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    // Re-measure once fonts settle — glyph widths shift when the display
    // font swaps in from the fallback.
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }

    const onMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      px.set(e.clientX - rect.left);
      py.set(e.clientY - rect.top);
    };
    const onLeave = () => {
      px.set(-10_000);
      py.set(-10_000);
    };

    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    return () => {
      ro.disconnect();
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, [chars, reduced, px, py]);

  const Tag = (as ?? "span") as ElementType;

  return (
    <Tag
      ref={wrapRef as React.RefObject<HTMLElement>}
      // Empty-string `aria-label` is a WCAG 4.1.2 violation (accessible name
      // must be non-empty). Drop the attribute entirely when text is empty so
      // the element falls back to its default accessible-name calculation.
      aria-label={text || undefined}
      className={cn("relative inline-block select-none", className)}
      {...rest}
    >
      {chars.map((char, i) => (
        <Glyph
          key={`${char}-${i}`}
          ref={(node) => {
            lettersRef.current[i] = node;
          }}
          char={char}
          index={i}
          metricsRef={metricsRef}
          px={px}
          py={py}
          radius={radius}
          strength={strength}
          animateEntry={animateEntry}
          disableGlow={disableGlow}
          reduced={!!reduced}
        />
      ))}
    </Tag>
  );
}

function Glyph({
  ref,
  char,
  index,
  metricsRef,
  px,
  py,
  radius,
  strength,
  animateEntry,
  disableGlow,
  reduced,
}: {
  ref: (node: HTMLSpanElement | null) => void;
  char: string;
  index: number;
  metricsRef: React.MutableRefObject<Array<{ cx: number; cy: number }>>;
  px: MotionValue<number>;
  py: MotionValue<number>;
  radius: number;
  strength: number;
  animateEntry: boolean;
  disableGlow: boolean;
  reduced: boolean;
}) {
  // Per-letter target offsets — linear falloff inside `radius`, zero outside.
  const targetX = useTransform([px, py], ([cx, cy]) => {
    const m = metricsRef.current[index];
    if (!m) return 0;
    const dx = (cx as number) - m.cx;
    const dy = (cy as number) - m.cy;
    const dist = Math.hypot(dx, dy);
    if (dist >= radius || dist === 0) return 0;
    const t = 1 - dist / radius;
    return (dx / dist) * strength * t;
  });
  const targetY = useTransform([px, py], ([cx, cy]) => {
    const m = metricsRef.current[index];
    if (!m) return 0;
    const dx = (cx as number) - m.cx;
    const dy = (cy as number) - m.cy;
    const dist = Math.hypot(dx, dy);
    if (dist >= radius || dist === 0) return 0;
    const t = 1 - dist / radius;
    return (dy / dist) * strength * t;
  });
  const glow = useTransform([px, py], ([cx, cy]) => {
    const m = metricsRef.current[index];
    if (!m) return 0;
    const dist = Math.hypot((cx as number) - m.cx, (cy as number) - m.cy);
    if (dist >= radius) return 0;
    return 1 - dist / radius;
  });

  const sx = useSpring(targetX, { stiffness: 220, damping: 22, mass: 0.6 });
  const sy = useSpring(targetY, { stiffness: 220, damping: 22, mass: 0.6 });
  const sGlow = useSpring(glow, { stiffness: 220, damping: 24 });
  const textShadow = useTransform(
    sGlow,
    (g) => `0 0 ${10 * g}px rgba(255,255,255,${0.55 * g})`,
  );

  // Whitespace renders as a non-magnetic span with a real space inside so the
  // font's natural space width is used (display fonts and custom letter-spacing
  // shift this — a fixed em width breaks copy in those cases). `whiteSpace:pre`
  // preserves the literal space character so soft-wrap boundaries still work.
  if (char === " ") {
    return (
      <span
        ref={ref}
        aria-hidden="true"
        style={{ display: "inline-block", whiteSpace: "pre" }}
      >
        {" "}
      </span>
    );
  }

  const initial =
    animateEntry && !reduced ? { opacity: 0, y: 18 } : { opacity: 1, y: 0 };
  const animate = { opacity: 1, y: 0 };
  const transition =
    animateEntry && !reduced
      ? { type: "spring" as const, stiffness: 140, damping: 18, delay: 0.04 * index }
      : { duration: 0 };

  return (
    <motion.span
      ref={ref}
      aria-hidden="true"
      initial={initial}
      animate={animate}
      transition={transition}
      style={
        reduced
          ? { display: "inline-block" }
          : {
              display: "inline-block",
              x: sx,
              y: sy,
              textShadow: disableGlow ? undefined : textShadow,
            }
      }
    >
      {char}
    </motion.span>
  );
}
