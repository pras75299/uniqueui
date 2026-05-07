"use client";

import * as React from "react";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type SpringOptions,
} from "motion/react";
import { cn } from "@/lib/utils";

export interface RefractiveCursorLensProps {
  /** Diameter of the lens in CSS pixels. Default 120. */
  size?: number;
  /** SVG displacement-map scale. Higher = more pronounced refraction. Default 18. */
  displacementScale?: number;
  /** Optional element ref that bounds where the lens shows. Defaults to the wrapper itself. */
  showOnlyOver?: React.RefObject<HTMLElement | null>;
  /** motion useSpring config for the cursor follow. Accepts the full SpringOptions surface (stiffness, damping, mass, restSpeed, restDelta…). */
  springConfig?: SpringOptions;
  /** Wrapper className — does not style the lens itself. */
  className?: string;
  /** Content the lens distorts. */
  children: React.ReactNode;
}

const DEFAULT_SPRING_CONFIG: SpringOptions = { stiffness: 220, damping: 26 };

/* ─── client-only signals (no setState-in-effect) ────────────────────── */

const getFalse = () => false;

const getCoarsePointer = (): boolean =>
  typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(pointer: coarse)").matches
    : false;

const subscribeCoarsePointer = (callback: () => void): (() => void) => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const mq = window.matchMedia("(pointer: coarse)");
  mq.addEventListener?.("change", callback);
  return () => mq.removeEventListener?.("change", callback);
};

/** Live `pointer: coarse` flag — flips if the user hot-swaps to a touch device. */
function useCoarsePointer(): boolean {
  return useSyncExternalStore(subscribeCoarsePointer, getCoarsePointer, getFalse);
}

/**
 * Static SVG data URL: black at center → white at rim. Used as the in2 of an
 * feComposite arithmetic step that attenuates the displacement noise toward
 * the center, so the rim refracts strongly and the center is near-undistorted
 * — the opposite of a fisheye lens. `%25` encodes the literal `%` and `%23`
 * encodes the literal `#`, both required inside an SVG data URL.
 */
const RADIAL_FALLOFF_MASK_URL =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>" +
  "<defs><radialGradient id='g' cx='50%25' cy='50%25' r='50%25'>" +
  "<stop offset='0%25' stop-color='black'/>" +
  "<stop offset='100%25' stop-color='white'/>" +
  "</radialGradient></defs>" +
  "<rect width='100' height='100' fill='url(%23g)'/></svg>";

export const RefractiveCursorLens = React.forwardRef<
  HTMLDivElement,
  RefractiveCursorLensProps
>(function RefractiveCursorLens(
  {
    size = 120,
    displacementScale = 18,
    showOnlyOver,
    springConfig = DEFAULT_SPRING_CONFIG,
    className,
    children,
  },
  ref,
) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // useId() emits colons in stable React versions. Strip anything that isn't
  // a-z/A-Z/0-9/_/- so the result is always a valid CSS `url(#…)` token even
  // if React expands the alphabet in the future (defense in depth).
  const reactId = useId();
  const filterId = `rcl-filter-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const reduceMotion = useReducedMotion();
  const coarsePointer = useCoarsePointer();
  const [visible, setVisible] = useState(false);

  // Cursor position (wrapper-local) → spring-smoothed lens position.
  // Starting far off-screen avoids a flash at (0,0) on first render.
  const x = useMotionValue(-9999);
  const y = useMotionValue(-9999);
  const sx = useSpring(x, springConfig);
  const sy = useSpring(y, springConfig);

  const disabled = Boolean(reduceMotion) || coarsePointer;

  useEffect(() => {
    if (disabled) return;
    const wrapperEl = wrapperRef.current;
    const boundsEl = showOnlyOver?.current ?? wrapperEl;
    if (!wrapperEl || !boundsEl) return;

    // Convert clientX/Y → coordinates relative to the wrapper, so the lens
    // stays clipped inside the wrapper's overflow-hidden box.
    const toLocal = (clientX: number, clientY: number) => {
      const rect = wrapperEl.getBoundingClientRect();
      return { lx: clientX - rect.left, ly: clientY - rect.top };
    };

    const onMove = (e: PointerEvent) => {
      const { lx, ly } = toLocal(e.clientX, e.clientY);
      x.set(lx);
      y.set(ly);
    };
    const onEnter = (e: PointerEvent) => {
      // Snap the spring on entry so the lens doesn't fly in from its previous
      // resting position when the pointer re-enters bounds.
      const { lx, ly } = toLocal(e.clientX, e.clientY);
      x.set(lx);
      y.set(ly);
      sx.jump(lx);
      sy.jump(ly);
      setVisible(true);
    };
    const onLeave = () => setVisible(false);

    boundsEl.addEventListener("pointermove", onMove);
    boundsEl.addEventListener("pointerenter", onEnter);
    boundsEl.addEventListener("pointerleave", onLeave);
    return () => {
      boundsEl.removeEventListener("pointermove", onMove);
      boundsEl.removeEventListener("pointerenter", onEnter);
      boundsEl.removeEventListener("pointerleave", onLeave);
    };
  }, [disabled, showOnlyOver, x, y, sx, sy]);

  return (
    <div
      ref={(node) => {
        wrapperRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref)
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      // overflow-hidden ensures the lens is clipped to the wrapper. Users who
      // need overflow visible can override via cn (tailwind-merge handles it).
      className={cn("relative overflow-hidden", className)}
    >
      {children}

      {!disabled ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-20 rounded-full"
          style={{
            x: sx,
            y: sy,
            width: size,
            height: size,
            // Center the disc on the pointer.
            translateX: "-50%",
            translateY: "-50%",
            // Drop shadow + a dark hairline ring. Dark ring works on both
            // light and dark backgrounds; on dark surfaces it reads as a
            // thin contour, on light surfaces it's the only thing that
            // makes the disc edge visible.
            boxShadow:
              "0 18px 48px -12px rgba(0,0,0,0.42), 0 4px 10px -4px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.10)",
          }}
          initial={{ opacity: 0, scale: 0.82 }}
          animate={{
            opacity: visible ? 1 : 0,
            scale: visible ? 1 : 0.82,
          }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {/*
            SVG filter chain:
              1. feTurbulence — organic refraction noise.
              2. feImage — radial mask (black center → white rim).
              3. feComposite arithmetic — `noise·mask − 0.5·mask + 0.5` so the
                 noise is attenuated toward 0.5 (no displacement) at the
                 center and unchanged at the rim. Evaluates to 0.5 at center
                 (mask=0) and `noise` at rim (mask=1) — clean radial falloff
                 opposite of a fisheye.
              4. feDisplacementMap — applies the falloff'd noise to the
                 source graphic.
            Filter and backdrop-filter MUST sit on the same element (next div);
            Chromium ignores `backdrop-filter: url(#…)` so we pair `filter` +
            `backdrop-filter: blur()` for cross-browser refraction.
          */}
          <svg aria-hidden className="absolute h-0 w-0" focusable={false}>
            <defs>
              <filter id={filterId} colorInterpolationFilters="sRGB">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.014 0.012"
                  numOctaves={2}
                  seed={9}
                  result="noise"
                />
                <feImage
                  href={RADIAL_FALLOFF_MASK_URL}
                  preserveAspectRatio="none"
                  x="0%"
                  y="0%"
                  width="100%"
                  height="100%"
                  result="rmask"
                />
                <feComposite
                  in="noise"
                  in2="rmask"
                  operator="arithmetic"
                  k1="1"
                  k2="0"
                  k3="-0.5"
                  k4="0.5"
                  result="masked"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="masked"
                  scale={displacementScale}
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>
            </defs>
          </svg>

          {/* Refraction layer — backdrop-filter and filter live together. */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              backdropFilter: "blur(0.5px) saturate(1.18) brightness(1.04)",
              WebkitBackdropFilter: "blur(0.5px) saturate(1.18) brightness(1.04)",
              filter: `url(#${filterId})`,
              WebkitFilter: `url(#${filterId})`,
            }}
          />

          {/* Glossy specular highlight — sits above the refracted layer so it
              stays crisp even as the backdrop ripples. No mix-blend-mode:
              `screen` would render white-on-white invisible on light
              backgrounds. Plain alpha works on both light and dark. */}
          <div
            aria-hidden
            className="pointer-events-none absolute"
            style={{
              top: "8%",
              left: "10%",
              width: "48%",
              height: "32%",
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse at top left, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 70%)",
              filter: "blur(2.5px)",
            }}
          />

          {/* Inner contour — combines a top white highlight (reads as glass
              on dark) with a bottom dark inset (reads as glass on light) so
              the disc has a fresnel-like edge in either color scheme. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              boxShadow:
                "inset 0 1px 0.5px rgba(255,255,255,0.45), inset 0 0 0 1px rgba(255,255,255,0.10), inset 0 -2px 4px rgba(0,0,0,0.16), inset 0 -1px 0.5px rgba(0,0,0,0.10)",
            }}
          />
        </motion.div>
      ) : null}
    </div>
  );
});

RefractiveCursorLens.displayName = "RefractiveCursorLens";

export default RefractiveCursorLens;
