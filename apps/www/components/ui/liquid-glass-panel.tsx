"use client";

import * as React from "react";
import { useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";

export interface LiquidGlassPanelProps
  extends Omit<HTMLMotionProps<"div">, "onDrag"> {
  displacementScale?: number;
  noiseFrequency?: number;
  /**
   * Background tint applied to the panel surface. Accepts standard CSS color
   * functions (`rgb()`, `rgba()`, `hsl()`, `hsla()`, `oklch()`, hex, named
   * colors). Anything outside the allow-list is replaced with a neutral
   * translucent white to avoid CSS injection via inline `style`.
   */
  tint?: string;
  borderHighlight?: boolean;
  intensityOnHover?: number;
  /** CSS blend mode for the conic specular sheen — flip to `darken` / `multiply` for light surfaces. */
  sheenBlendMode?: React.CSSProperties["mixBlendMode"];
  children?: React.ReactNode;
}

// Same allow-list pattern used by `shader-mesh-gradient` — accept the canonical
// color function shapes and reject anything else (defends against CSS injection
// via the `tint` prop being inlined into `style.backgroundColor`).
const SAFE_CSS_COLOR_RE =
  /^(?:#[0-9a-fA-F]{3,8}|rgba?\([\d.,\s%/]+\)|hsla?\([\d.,\s%deg/]+\)|oklch\([\d.,\s%/]+\)|[a-zA-Z]+)$/;

function safeCssColor(input: string): string {
  const trimmed = input.trim();
  return SAFE_CSS_COLOR_RE.test(trimmed) ? trimmed : "rgba(255,255,255,0.06)";
}

export const LiquidGlassPanel = React.forwardRef<
  HTMLDivElement,
  LiquidGlassPanelProps
>(function LiquidGlassPanel(
  {
    displacementScale = 60,
    noiseFrequency = 0.012,
    tint = "rgba(255,255,255,0.06)",
    borderHighlight = true,
    intensityOnHover = 1.5,
    sheenBlendMode = "screen",
    className,
    children,
    style,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    ...rest
  },
  ref,
) {
  // Strip every char that isn't valid in a CSS ident — defense in depth in case
  // useId ever expands to chars beyond `:` that would also break `url(#…)`.
  const reactId = useId();
  const filterId = `lgp-filter-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const hoveredRef = useRef(false);

  // SVG filter element refs — the RAF loop mutates attributes on these directly
  // instead of going through React state, so we don't trigger a render on every
  // animation frame. (The previous setState-per-frame implementation re-rendered
  // the entire panel ~60×/sec.)
  const turbulenceRef = useRef<SVGFETurbulenceElement | null>(null);
  const displaceRef = useRef<SVGFEDisplacementMapElement | null>(null);

  useEffect(() => {
    hoveredRef.current = hovered;
  }, [hovered]);

  useEffect(() => {
    if (reduceMotion) return;

    let raf = 0;
    let lastTs = performance.now();
    let drift = 0;
    let scale = displacementScale;
    let bfX = noiseFrequency;
    let bfY = noiseFrequency * 1.3;

    const tick = (ts: number) => {
      const dt = Math.min(64, ts - lastTs) / 1000;
      lastTs = ts;
      drift += dt;

      const isHover = hoveredRef.current;
      const targetScale = displacementScale * (isHover ? intensityOnHover : 1);
      const targetBfX = noiseFrequency * (isHover ? 1.05 : 1);
      const targetBfY = noiseFrequency * 1.3 * (isHover ? 1.05 : 1);

      const k = 1 - Math.exp(-dt * 8);
      scale += (targetScale - scale) * k;
      bfX += (targetBfX - bfX) * k;
      bfY += (targetBfY - bfY) * k;

      const seed = 1 + (Math.sin(drift * 0.15) * 0.5 + 0.5) * 99;

      // Direct SVG attribute mutation — same visual outcome as the previous
      // setState path, with zero React work per frame.
      const turb = turbulenceRef.current;
      const disp = displaceRef.current;
      if (turb) {
        turb.setAttribute("baseFrequency", `${bfX.toFixed(4)} ${bfY.toFixed(4)}`);
        turb.setAttribute("seed", seed.toFixed(2));
      }
      if (disp) {
        disp.setAttribute("scale", scale.toFixed(2));
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [
    reduceMotion,
    displacementScale,
    noiseFrequency,
    intensityOnHover,
  ]);

  const safeTint = safeCssColor(tint);

  return (
    <motion.div
      ref={ref}
      className={cn(
        "relative isolate overflow-hidden rounded-3xl",
        className,
      )}
      style={{
        backgroundColor: safeTint,
        ...style,
      }}
      animate={{
        scale: hovered && !reduceMotion ? 1.02 : 1,
      }}
      transition={{ type: "spring", stiffness: 220, damping: 26 }}
      onMouseEnter={(e) => {
        setHovered(true);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setHovered(false);
        onMouseLeave?.(e);
      }}
      onFocus={(e) => {
        // Mirror hover state on keyboard focus so focus-within users get the
        // same intensity boost — also makes the panel feel responsive when
        // focused via tab navigation.
        setHovered(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setHovered(false);
        onBlur?.(e);
      }}
      {...rest}
    >
      {/*
        SVG filter definitions. `suppressHydrationWarning` avoids a console
        error when React's tree position changes useId() between server and
        client (the dynamic id values are visual plumbing only).
      */}
      <svg
        aria-hidden
        className="pointer-events-none absolute h-0 w-0"
        focusable={false}
        suppressHydrationWarning
      >
        <defs>
          <filter
            id={filterId}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              ref={turbulenceRef}
              type="fractalNoise"
              baseFrequency={`${noiseFrequency.toFixed(4)} ${(noiseFrequency * 1.3).toFixed(4)}`}
              numOctaves={2}
              seed="1"
              result="noise"
            />
            <feDisplacementMap
              ref={displaceRef}
              in="SourceGraphic"
              in2="noise"
              scale={displacementScale.toFixed(2)}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/*
        Refraction layer.

        `backdrop-filter: blur()` samples a blurred copy of whatever's behind
        the panel; `filter: url(#…)` then displaces that rendered output via
        the SVG turbulence map. Both must sit on the SAME element — putting
        the SVG filter on a wrapper would create an isolating stacking context
        that prevents `backdrop-filter` from seeing past it (a known browser
        behavior that breaks the chained "wrapper + child" approach).

        Chromium ignores `backdrop-filter: url(#…)` — this combo is the
        cross-browser equivalent that actually distorts.
      */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          filter: `url(#${filterId})`,
          WebkitFilter: `url(#${filterId})`,
          // WebKit prefix needs a static fallback — Safari ≥18 also reads the
          // unprefixed property below, so the animated value still applies.
          WebkitBackdropFilter: "blur(6px) saturate(1.2)",
        }}
        animate={{
          backdropFilter: hovered
            ? "blur(3px) saturate(1.5) brightness(1.08)"
            : "blur(6px) saturate(1.2) brightness(1)",
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        suppressHydrationWarning
      />

      {/* Slow drifting specular sheen. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-1/2"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(255,255,255,0) 0deg, rgba(255,255,255,0.32) 60deg, rgba(255,255,255,0) 140deg, rgba(255,255,255,0.18) 240deg, rgba(255,255,255,0) 360deg)",
          mixBlendMode: sheenBlendMode,
          filter: "blur(28px)",
        }}
        animate={{
          rotate: reduceMotion ? 0 : 360,
          opacity: hovered ? 1 : 0.55,
        }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : {
                rotate: {
                  duration: hovered ? 12 : 22,
                  ease: "linear",
                  repeat: Infinity,
                },
                opacity: { duration: 0.3, ease: "easeOut" },
              }
        }
      />

      {/* Edge highlight — Fresnel-ish ring. Brightens on hover. */}
      {borderHighlight ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          animate={{
            boxShadow: hovered
              ? "inset 1px 1px 0 0 rgba(255,255,255,0.85), inset -1px -1px 0 0 rgba(255,255,255,0.10), inset 0 0 0 1px rgba(255,255,255,0.20), 0 40px 80px -20px rgba(0,0,0,0.55)"
              : "inset 1px 1px 0 0 rgba(255,255,255,0.55), inset -1px -1px 0 0 rgba(255,255,255,0.06), inset 0 0 0 1px rgba(255,255,255,0.10), 0 30px 60px -20px rgba(0,0,0,0.45)",
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      ) : null}

      {/* Crisp content layer — never filtered. */}
      {children ? <div className="relative z-10">{children}</div> : null}
    </motion.div>
  );
});

LiquidGlassPanel.displayName = "LiquidGlassPanel";
