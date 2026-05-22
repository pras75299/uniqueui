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
 * VaporBackdrop — silver-vapor editorial backdrop.
 *
 * Four composited layers, all transform/opacity + CSS keyframes (no rAF, no
 * background-position paint), all freeze under prefers-reduced-motion:
 *
 *   1. Two large blurred radial blobs in cool teal + warm amber, drifting on
 *      independent slow paths (28s / 36s) with `mix-blend-mode: screen`. Where
 *      they overlap, a lavender bloom emerges — never set directly. A radial
 *      mask pushes both blobs out of the central region so the headline
 *      always has clean negative space behind it.
 *   2. A subtle dot-grid foundation (radial-dot pattern, 36px), masked to a
 *      center ellipse, drifting one cell over 24s. Anchors the gradients
 *      against a geometric structure — reads as "designed", not just blobs.
 *   3. Film grain via inline SVG turbulence (data-URI, static). Single most
 *      important detail: gradients look digital; grain makes them photographic.
 *   4. A 1px diagonal filament hairline crossing the hero at -8°, amber→teal,
 *      opacity breathing slowly (12s). The "designed object" detail.
 *
 * Performance: all animated elements have `will-change: transform` only on
 * what's actually transforming; no layout/paint-heavy properties animate.
 * Keyframes are defined once via a single inline <style> element scoped by
 * `data-ml-vapor` attribute so multiple instances on a page don't fight.
 */
function VaporBackdrop() {
  return (
    <div
      aria-hidden
      data-ml-vapor
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Layer 1 — masked vapor blobs */}
      <div className="ml-vapor-mask absolute inset-0">
        <div className="ml-vapor ml-vapor-teal" />
        <div className="ml-vapor ml-vapor-amber" />
      </div>

      {/* Layer 2 — drifting dot grid */}
      <div className="ml-vapor-grid absolute -inset-[10vh]" />

      {/* Layer 4 — diagonal filament hairline */}
      <div className="ml-vapor-filament absolute left-[-10%] top-[58%] h-px w-[120%]" />

      {/* Layer 3 — film grain (rendered last so it sits over the gradients) */}
      <div className="ml-vapor-grain absolute inset-0" />

      {/* Soft outer vignette, tuned to the new cool base. Sits on top of
          gradients to keep edges from getting too bright, but the headline
          area at ~35% is fully clear. */}
      <div className="ml-vapor-vignette absolute inset-0" />

      <style>{`
        [data-ml-vapor] .ml-vapor-mask {
          /* Push gradient activity to the corners — central 25% stays clean. */
          -webkit-mask-image: radial-gradient(ellipse 70% 70% at center, transparent 22%, black 65%);
          mask-image: radial-gradient(ellipse 70% 70% at center, transparent 22%, black 65%);
        }
        [data-ml-vapor] .ml-vapor {
          position: absolute;
          width: 120vmax;
          height: 120vmax;
          border-radius: 50%;
          filter: blur(110px);
          mix-blend-mode: screen;
          will-change: transform;
        }
        [data-ml-vapor] .ml-vapor-teal {
          top: -40vmax;
          left: -35vmax;
          background: radial-gradient(circle at center, rgba(62, 212, 212, 0.32) 0%, rgba(62, 212, 212, 0.10) 35%, transparent 60%);
          animation: ml-vapor-a 28s cubic-bezier(0.42, 0, 0.58, 1) infinite;
        }
        [data-ml-vapor] .ml-vapor-amber {
          bottom: -45vmax;
          right: -35vmax;
          background: radial-gradient(circle at center, rgba(240, 168, 87, 0.28) 0%, rgba(240, 168, 87, 0.09) 35%, transparent 60%);
          animation: ml-vapor-b 36s cubic-bezier(0.42, 0, 0.58, 1) infinite;
        }
        [data-ml-vapor] .ml-vapor-grid {
          background-image: radial-gradient(circle, rgba(244, 243, 238, 0.08) 1px, transparent 1.5px);
          background-size: 36px 36px;
          -webkit-mask-image: radial-gradient(ellipse 60% 50% at center, black 0%, transparent 75%);
          mask-image: radial-gradient(ellipse 60% 50% at center, black 0%, transparent 75%);
          opacity: 0.55;
          animation: ml-vapor-grid 24s linear infinite;
          will-change: transform;
        }
        [data-ml-vapor] .ml-vapor-filament {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(240, 168, 87, 0.45) 28%,
            rgba(244, 243, 238, 0.55) 50%,
            rgba(62, 212, 212, 0.45) 72%,
            transparent 100%
          );
          transform: rotate(-8deg);
          transform-origin: center;
          animation: ml-vapor-filament 12s ease-in-out infinite;
          will-change: opacity;
        }
        [data-ml-vapor] .ml-vapor-grain {
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/></svg>");
          background-size: 240px 240px;
          opacity: 0.14;
          mix-blend-mode: overlay;
        }
        [data-ml-vapor] .ml-vapor-vignette {
          background: radial-gradient(
            ellipse at center,
            transparent 38%,
            rgba(6, 8, 12, 0.55) 75%,
            rgba(6, 8, 12, 0.85) 100%
          );
        }

        /* Drift paths — asymmetric, organic, never "rotate around a center". */
        @keyframes ml-vapor-a {
          0%   { transform: translate3d(0%, 0%, 0) scale(1); }
          50%  { transform: translate3d(18%, 12%, 0) scale(1.08); }
          100% { transform: translate3d(0%, 0%, 0) scale(1); }
        }
        @keyframes ml-vapor-b {
          0%   { transform: translate3d(0%, 0%, 0) scale(1.05); }
          50%  { transform: translate3d(-14%, -10%, 0) scale(1); }
          100% { transform: translate3d(0%, 0%, 0) scale(1.05); }
        }
        @keyframes ml-vapor-grid {
          0%   { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(36px, 36px, 0); }
        }
        @keyframes ml-vapor-filament {
          0%, 100% { opacity: 0.28; }
          50%      { opacity: 0.72; }
        }

        @media (prefers-reduced-motion: reduce) {
          [data-ml-vapor] .ml-vapor-teal,
          [data-ml-vapor] .ml-vapor-amber,
          [data-ml-vapor] .ml-vapor-grid,
          [data-ml-vapor] .ml-vapor-filament {
            animation: none;
          }
          [data-ml-vapor] .ml-vapor-filament {
            opacity: 0.45;
          }
        }
      `}</style>
    </div>
  );
}
