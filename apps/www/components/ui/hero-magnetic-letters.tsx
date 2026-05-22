"use client";

import type { ComponentProps, ReactNode } from "react";
import { useEffect, useMemo, useRef } from "react";
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
 * Magnetic Letters hero.
 *
 * Signature motion: every glyph in the headline tracks the cursor with its own
 * spring. When the pointer enters the headline's bounding box, each letter
 * computes its own offset toward the cursor — strongest within ~`radius`px,
 * tapering linearly to zero past it. Stiff spring (220) + high damping (22)
 * keeps motion crisp; letters never feel rubbery.
 *
 * Two co-existing animation primitives (Hallmark cap of 3 — third is the
 * conic backdrop):
 *  1. ENTRANCE — letters stagger in from below with spring physics.
 *  2. MAGNETIC FOLLOW — per-letter cursor-tracking after mount.
 *  3. AMBIENT CONIC — single conic-gradient layer rotating over 60s (linear),
 *     low alpha. Reads as soft directional light, never demands attention.
 *
 * Reduced motion: entrance collapses to opacity-only ≤150ms, magnetic follow
 * disabled entirely, conic backdrop locked to a static rotation.
 *
 * Composition: pass `children` to replace the default headline composition
 * entirely. Pass `headline` to keep the magnetic effect and surrounding
 * eyebrow/sub/CTAs but swap the headline copy.
 */

type MagneticLettersHeroProps = Omit<ComponentProps<"section">, "children"> & {
  /** Override the full hero composition. Mutually exclusive with `headline`. */
  children?: ReactNode;
  /** Override just the headline text — the magnetic effect still applies. */
  headline?: string;
  /** Radius in px within which a letter is pulled toward the cursor. */
  radius?: number;
  /** Max displacement (px) for a letter at peak proximity. */
  strength?: number;
};

const DEFAULT_HEADLINE = "Motion, where it matters.";

export function MagneticLettersHero({
  children,
  headline = DEFAULT_HEADLINE,
  radius = 160,
  strength = 14,
  className,
  ...rest
}: MagneticLettersHeroProps) {
  return (
    <section
      {...rest}
      className={cn(
        "relative isolate flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden bg-[#06080c] text-white",
        className,
      )}
    >
      <VaporBackdrop />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-6 text-center">
        {children ?? (
          <DefaultMagneticContent
            headline={headline}
            radius={radius}
            strength={strength}
          />
        )}
      </div>
    </section>
  );
}

function DefaultMagneticContent({
  headline,
  radius,
  strength,
}: {
  headline: string;
  radius: number;
  strength: number;
}) {
  return (
    <>
      <motion.span
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, type: "spring", stiffness: 120, damping: 18 }}
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/70 backdrop-blur"
      >
        <span
          aria-hidden
          className="h-1.5 w-1.5 rounded-full bg-white/85 shadow-[0_0_8px_2px_rgba(255,255,255,0.35)]"
        />
        Magnetic · 0x01
      </motion.span>

      <MagneticHeadline text={headline} radius={radius} strength={strength} />

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, type: "spring", stiffness: 110, damping: 20 }}
        className="mt-6 max-w-xl text-pretty text-base text-white/65 sm:text-lg"
      >
        Every letter is a spring. Hover the headline — each glyph leans into
        the cursor under its own physics. No external motion deps beyond what
        the rest of the library uses.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, type: "spring", stiffness: 110, damping: 20 }}
        className="mt-9 flex flex-wrap items-center justify-center gap-3"
      >
        <button
          type="button"
          className="group inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-medium text-black transition-transform duration-200 hover:-translate-y-px"
        >
          <span>Get started</span>
          <span
            aria-hidden
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          >
            →
          </span>
        </button>
        <button
          type="button"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-6 font-mono text-xs uppercase tracking-[0.18em] text-white/85 backdrop-blur transition-colors hover:bg-white/5"
        >
          View source
        </button>
      </motion.div>
    </>
  );
}

type LetterMetric = { char: string; cx: number; cy: number };

/**
 * The headline is rendered once invisibly to measure per-letter centers, then
 * again visibly with motion bindings. Measurements happen on mount and on
 * resize so the magnetic effect stays accurate after layout shifts (font
 * loading, container resizes).
 */
export function MagneticHeadline({
  text,
  radius,
  strength,
  className,
}: {
  text: string;
  radius: number;
  strength: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLHeadingElement>(null);
  const lettersRef = useRef<Array<HTMLSpanElement | null>>([]);
  const metricsRef = useRef<LetterMetric[]>([]);

  // Pointer position in the wrap's local coordinate space. -10_000 means
  // "outside / not tracking" so every letter snaps back to neutral.
  const px = useMotionValue(-10_000);
  const py = useMotionValue(-10_000);

  const chars = useMemo(() => Array.from(text), [text]);

  useEffect(() => {
    if (reduced) return;
    const wrap = wrapRef.current;
    if (!wrap) return;

    const measure = () => {
      const wrapRect = wrap.getBoundingClientRect();
      metricsRef.current = lettersRef.current.map((node, i) => {
        if (!node) return { char: chars[i], cx: 0, cy: 0 };
        const r = node.getBoundingClientRect();
        return {
          char: chars[i],
          cx: r.left + r.width / 2 - wrapRect.left,
          cy: r.top + r.height / 2 - wrapRect.top,
        };
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    // Re-measure once fonts settle — character widths shift when the display
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

  return (
    <motion.h1
      ref={wrapRef}
      className={cn(
        "relative select-none text-balance text-4xl font-semibold tracking-tight sm:text-6xl",
        className,
      )}
      aria-label={text}
    >
      {chars.map((char, i) => (
        <Letter
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
          reduced={!!reduced}
        />
      ))}
    </motion.h1>
  );
}

function Letter({
  ref,
  char,
  index,
  metricsRef,
  px,
  py,
  radius,
  strength,
  reduced,
}: {
  ref: (node: HTMLSpanElement | null) => void;
  char: string;
  index: number;
  metricsRef: React.MutableRefObject<LetterMetric[]>;
  px: MotionValue<number>;
  py: MotionValue<number>;
  radius: number;
  strength: number;
  reduced: boolean;
}) {
  // Compute target offset toward the pointer for this letter. Linear
  // falloff inside `radius`, zero outside. Capped to `strength`.
  const targetX = useTransform([px, py], ([cx, cy]) => {
    const m = metricsRef.current[index];
    if (!m) return 0;
    const dx = (cx as number) - m.cx;
    const dy = (cy as number) - m.cy;
    const dist = Math.hypot(dx, dy);
    if (dist >= radius || dist === 0) return 0;
    const t = 1 - dist / radius; // 0..1
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
    return 1 - dist / radius; // 0..1
  });

  // Springs smooth the target. Whitespace renders as a non-magnetic span so
  // the soft-hyphen behavior of CSS letter wrapping is preserved.
  const sx = useSpring(targetX, { stiffness: 220, damping: 22, mass: 0.6 });
  const sy = useSpring(targetY, { stiffness: 220, damping: 22, mass: 0.6 });
  const sGlow = useSpring(glow, { stiffness: 220, damping: 24 });
  const textShadow = useTransform(
    sGlow,
    (g) => `0 0 ${10 * g}px rgba(255,255,255,${0.55 * g})`,
  );

  if (char === " ") {
    // Inline-block, non-magnetic — preserves wrapping at word boundaries.
    return (
      <span ref={ref} aria-hidden="true" style={{ display: "inline-block", width: "0.32em" }} />
    );
  }

  return (
    <motion.span
      ref={ref}
      aria-hidden="true"
      // Entrance — stagger keyed to char index. Spring matches the rest of the
      // library; no easing curve magic numbers.
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduced
          ? { duration: 0.15 }
          : {
              type: "spring",
              stiffness: 140,
              damping: 18,
              delay: 0.12 + index * 0.025,
            }
      }
      style={
        reduced
          ? { display: "inline-block" }
          : { display: "inline-block", x: sx, y: sy, textShadow }
      }
    >
      {char}
    </motion.span>
  );
}

/**
 * VaporBackdrop — slow diagonal gradient drift.
 *
 * Three large blurred gradient orbs (teal, amber, magenta) drift continuously
 * along the SAME diagonal axis (top-left → bottom-right), each at a different
 * pace and phase. With `mix-blend-mode: screen`, the overlaps produce rich
 * tertiary blooms — lavender where teal meets magenta, gold where amber meets
 * magenta — without any color being set directly.
 *
 * No center mask, no vignette darkening, no filament hairline, no diagonal
 * sweep band. The whole composition is a single continuous diagonal wash that
 * the eye reads as one smooth motion.
 *
 * Film grain (static SVG turbulence) sits on top to keep the gradients from
 * looking digital.
 *
 * Performance: every animated layer uses `motion/react` keyframe arrays on
 * compositor-friendly `x` / `y` / `scale`. `useReducedMotion()` collapses
 * each layer to its starting frame.
 */
function VaporBackdrop() {
  const reduced = useReducedMotion();

  // Same diagonal direction (top-left ↘ bottom-right) for all three orbs, but
  // each gets its own phase + duration so they pass through each other instead
  // of moving in lock-step. `repeatType: "reverse"` returns the orb along the
  // same path — the eye reads a smooth, continuous diagonal drift.
  const drift = (
    duration: number,
    phase: number,
  ): { duration: number; ease: "easeInOut"; repeat: number; repeatType: "reverse"; delay: number } => ({
    duration,
    ease: "easeInOut",
    repeat: Infinity,
    repeatType: "reverse",
    delay: phase,
  });

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Teal orb — starts upper-left, drifts down-right. */}
      <motion.div
        className="absolute h-[110vmax] w-[110vmax] rounded-full"
        style={{
          top: "-40vmax",
          left: "-40vmax",
          background:
            "radial-gradient(circle, rgba(56, 224, 224, 0.42) 0%, rgba(56, 224, 224, 0.14) 35%, transparent 65%)",
          mixBlendMode: "screen",
          filter: "blur(110px)",
          willChange: "transform",
        }}
        initial={{ x: "0%", y: "0%", scale: 1 }}
        animate={
          reduced
            ? undefined
            : { x: ["0%", "60%"], y: ["0%", "55%"], scale: [1, 1.08] }
        }
        transition={reduced ? undefined : drift(38, 0)}
      />

      {/* Magenta orb — starts upper-right, drifts down-left along the same
          diagonal axis (visually opposite endpoints, same direction). */}
      <motion.div
        className="absolute h-[95vmax] w-[95vmax] rounded-full"
        style={{
          top: "-30vmax",
          right: "-40vmax",
          background:
            "radial-gradient(circle, rgba(232, 121, 198, 0.40) 0%, rgba(232, 121, 198, 0.13) 35%, transparent 65%)",
          mixBlendMode: "screen",
          filter: "blur(120px)",
          willChange: "transform",
        }}
        initial={{ x: "0%", y: "0%", scale: 1.05 }}
        animate={
          reduced
            ? undefined
            : { x: ["0%", "-55%"], y: ["0%", "60%"], scale: [1.05, 1] }
        }
        transition={reduced ? undefined : drift(46, 2)}
      />

      {/* Amber orb — starts lower-right, drifts up-left. Closes the diagonal
          loop: every part of the canvas sees warm light at some point in the
          cycle. */}
      <motion.div
        className="absolute h-[100vmax] w-[100vmax] rounded-full"
        style={{
          bottom: "-40vmax",
          right: "-30vmax",
          background:
            "radial-gradient(circle, rgba(247, 175, 90, 0.40) 0%, rgba(247, 175, 90, 0.13) 35%, transparent 65%)",
          mixBlendMode: "screen",
          filter: "blur(115px)",
          willChange: "transform",
        }}
        initial={{ x: "0%", y: "0%", scale: 1 }}
        animate={
          reduced
            ? undefined
            : { x: ["0%", "-50%"], y: ["0%", "-55%"], scale: [1, 1.1] }
        }
        transition={reduced ? undefined : drift(42, 5)}
      />

      {/* Film grain (static) — inline SVG turbulence as data-URI. Keeps the
          gradient orbs from reading as smooth-digital. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/></svg>\")",
          backgroundSize: "240px 240px",
          opacity: 0.1,
          mixBlendMode: "overlay",
        }}
      />
    </div>
  );
}
