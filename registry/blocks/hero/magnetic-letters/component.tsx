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
 * VaporBackdrop — silver-vapor editorial backdrop, all motion driven by
 * `motion/react` (no CSS keyframes, no rAF loops).
 *
 * Five composited layers:
 *   1. THREE gradient orbs — cool teal, warm amber, magenta accent. Each
 *      drifts independently with `animate` keyframe arrays (x, y, scale),
 *      `mix-blend-mode: screen`. Where they overlap they create rich tertiary
 *      colors (the lavender bloom emerges between teal+magenta; gold between
 *      amber+magenta). 14s / 18s / 22s loops keep motion intentional but
 *      never synchronized.
 *   2. AURORA SWEEP — a soft conic-gradient band that translates diagonally
 *      across the hero every 12s. Subtle, but adds directional energy.
 *   3. FILAMENT — a 1px diagonal hairline whose opacity breathes between
 *      0.25 and 0.85 over 6s.
 *   4. FILM GRAIN — inline SVG turbulence, static, `overlay` blend.
 *      Disguises gradient smoothness — the single biggest detail that
 *      removes the "AI-generic" feel from gradient backdrops.
 *   5. VIGNETTE — radial fade at the edges so the headline area stays clean.
 *
 * Composition: a radial mask on the orbs layer pushes color activity OUT
 * of the central ~25% — the headline never has to fight the background.
 *
 * Performance: every animation uses motion's compositor-friendly transform
 * + opacity. `prefers-reduced-motion` collapses each layer to a static
 * frame via `useReducedMotion()`.
 */
function VaporBackdrop() {
  const reduced = useReducedMotion();
  // Loop config for each orb. Keyframe arrays so motion interpolates a path
  // rather than just oscillating between two points — gives organic motion.
  const orbTransition = (duration: number) => ({
    duration,
    ease: "easeInOut" as const,
    repeat: Infinity,
    repeatType: "mirror" as const,
  });

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Layer 1 — three drifting gradient orbs. The wrapping div carries the
          radial mask that keeps color out of the central headline region. */}
      <div
        className="absolute inset-0"
        style={{
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 70% at center, transparent 18%, black 60%)",
          maskImage:
            "radial-gradient(ellipse 70% 70% at center, transparent 18%, black 60%)",
        }}
      >
        {/* Teal orb — top-left quadrant */}
        <motion.div
          className="absolute left-[-25%] top-[-25%] h-[90vmax] w-[90vmax] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(56, 224, 224, 0.55) 0%, rgba(56, 224, 224, 0.18) 35%, transparent 65%)",
            mixBlendMode: "screen",
            filter: "blur(80px)",
            willChange: "transform",
          }}
          initial={{ x: 0, y: 0, scale: 1 }}
          animate={
            reduced
              ? undefined
              : {
                  x: ["0%", "12%", "4%", "0%"],
                  y: ["0%", "8%", "-4%", "0%"],
                  scale: [1, 1.12, 1.04, 1],
                }
          }
          transition={reduced ? undefined : orbTransition(14)}
        />

        {/* Amber orb — bottom-right quadrant */}
        <motion.div
          className="absolute right-[-25%] bottom-[-30%] h-[95vmax] w-[95vmax] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(247, 175, 90, 0.50) 0%, rgba(247, 175, 90, 0.16) 35%, transparent 65%)",
            mixBlendMode: "screen",
            filter: "blur(90px)",
            willChange: "transform",
          }}
          initial={{ x: 0, y: 0, scale: 1.05 }}
          animate={
            reduced
              ? undefined
              : {
                  x: ["0%", "-10%", "-3%", "0%"],
                  y: ["0%", "-6%", "5%", "0%"],
                  scale: [1.05, 1, 1.1, 1.05],
                }
          }
          transition={reduced ? undefined : orbTransition(18)}
        />

        {/* Magenta accent orb — drifts across center-right area. This is
            the orb that creates the lavender bloom when it overlaps teal,
            and the gold when it brushes amber. */}
        <motion.div
          className="absolute left-[35%] top-[20%] h-[55vmax] w-[55vmax] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(232, 121, 198, 0.42) 0%, rgba(232, 121, 198, 0.14) 35%, transparent 65%)",
            mixBlendMode: "screen",
            filter: "blur(70px)",
            willChange: "transform",
          }}
          initial={{ x: 0, y: 0, scale: 1 }}
          animate={
            reduced
              ? undefined
              : {
                  x: ["0%", "-18%", "10%", "0%"],
                  y: ["0%", "14%", "-8%", "0%"],
                  scale: [1, 1.15, 0.95, 1],
                }
          }
          transition={reduced ? undefined : orbTransition(22)}
        />
      </div>

      {/* Layer 2 — aurora sweep band. A wide conic-gradient stripe that
          translates diagonally across the viewport every 12s. */}
      <motion.div
        className="absolute left-[-50%] top-[-30%] h-[160%] w-[200%]"
        style={{
          background:
            "linear-gradient(115deg, transparent 35%, rgba(244, 243, 238, 0.07) 48%, rgba(56, 224, 224, 0.12) 50%, rgba(244, 243, 238, 0.07) 52%, transparent 65%)",
          mixBlendMode: "screen",
          willChange: "transform",
        }}
        initial={{ x: "-30%", y: "-10%" }}
        animate={reduced ? undefined : { x: ["-30%", "20%"], y: ["-10%", "10%"] }}
        transition={
          reduced
            ? undefined
            : {
                duration: 12,
                ease: "linear",
                repeat: Infinity,
                repeatType: "reverse",
              }
        }
      />

      {/* Layer 3 — diagonal filament hairline, opacity breathing */}
      <motion.div
        className="absolute left-[-10%] top-[58%] h-px w-[120%]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(247, 175, 90, 0.55) 28%, rgba(244, 243, 238, 0.7) 50%, rgba(56, 224, 224, 0.55) 72%, transparent 100%)",
          transform: "rotate(-8deg)",
          transformOrigin: "center",
          willChange: "opacity",
        }}
        initial={{ opacity: 0.3 }}
        animate={reduced ? { opacity: 0.5 } : { opacity: [0.25, 0.85, 0.25] }}
        transition={
          reduced
            ? undefined
            : { duration: 6, ease: "easeInOut", repeat: Infinity }
        }
      />

      {/* Layer 4 — film grain (static). Inline SVG turbulence as data-URI. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/></svg>\")",
          backgroundSize: "240px 240px",
          opacity: 0.13,
          mixBlendMode: "overlay",
        }}
      />

      {/* Layer 5 — outer vignette. Keeps the edges grounded against the
          cool base while leaving the center clear for the headline. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 38%, rgba(6, 8, 12, 0.55) 75%, rgba(6, 8, 12, 0.85) 100%)",
        }}
      />
    </div>
  );
}
