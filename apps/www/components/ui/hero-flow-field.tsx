"use client";

import { useEffect, useRef, type ComponentProps, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type FlowFieldTheme = "light" | "dark";

export type FlowFieldBackgroundProps = {
  className?: string;
  /** Light or dark palette for the field, scrim, and trails. */
  theme?: FlowFieldTheme;
  /** Two streamline colors, cycled across particles. Defaults to a theme palette. */
  colors?: [string, string];
  /** Particle density multiplier (0.2–3). Higher = more streamlines. */
  density?: number;
  /** Stroke width of each streamline in pixels. */
  lineWidth?: number;
  /**
   * How strongly the page scroll position bends the flow field. The waving
   * motion is driven by `window.scrollY`; raise to make scrolling reshape the
   * field faster, lower for a calmer response.
   */
  scrollStrength?: number;
  /** Idle drift speed so the field keeps flowing when the page isn't scrolling. */
  speed?: number;
  /** Trail persistence (0.8–0.98). Higher = longer comet tails. */
  trail?: number;
};

type Palette = {
  bg: string;
  /** Per-frame fade overlay — bg color at low alpha; longer trails = lower alpha. */
  fade: (alpha: number) => string;
  colors: [string, string];
};

const PALETTES: Record<FlowFieldTheme, Palette> = {
  dark: {
    bg: "#070712",
    fade: (a) => `rgba(7,7,18,${a})`,
    colors: ["rgba(56,189,248,0.9)", "rgba(139,92,246,0.85)"],
  },
  light: {
    bg: "#eef1f8",
    fade: (a) => `rgba(238,241,248,${a})`,
    colors: ["rgba(37,99,235,0.55)", "rgba(13,148,136,0.55)"],
  },
};

const clamp = (v: number, lo: number, hi: number, fallback: number) =>
  Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : fallback;

// Steps traced per static streamline (reduced-motion fallback only).
const STATIC_STEPS = 18;

type Particle = { x: number; y: number; age: number; maxAge: number };

export function FlowFieldBackground({
  className,
  theme = "dark",
  colors,
  density = 1,
  lineWidth = 1.1,
  scrollStrength = 1,
  speed = 0.05,
  trail = 0.92,
}: FlowFieldBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  const palette = PALETTES[theme] ?? PALETTES.dark;
  const strokeColors = colors ?? palette.colors;
  const safeDensity = clamp(density, 0.2, 3, 1);
  const safeTrail = clamp(trail, 0.8, 0.98, 0.92);
  const safeScroll = Number.isFinite(scrollStrength) ? scrollStrength : 1;
  const safeSpeed = Number.isFinite(speed) ? speed : 0.05;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let scroll = window.scrollY;
    let scrollTarget = scroll;

    const resize = () => {
      const { clientWidth, clientHeight } = canvas;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(clientWidth * dpr);
      canvas.height = Math.round(clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onScroll = () => {
      scrollTarget = window.scrollY;
    };

    // Flow direction at a point. Summed sines give an organic field with zero
    // external noise deps. `phase` is the only animated input — advanced by
    // scroll (primary) plus a slow idle drift.
    const angleAt = (x: number, y: number, phase: number) => {
      const a = Math.sin(x * 0.0022 + phase) + Math.cos(y * 0.0026 - phase * 0.8);
      const b = Math.sin((x + y) * 0.0015 + phase * 0.6);
      return (a + b) * Math.PI;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // ---- Reduced motion: trace a single static streamline field, no rAF. ----
    if (reduced) {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const phase = scroll * 0.0015 * safeScroll;
      const step = 56;
      const stepLen = step * 0.55;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      const cols = Math.ceil(w / step) + 1;
      const rows = Math.ceil(h / step) + 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          let x = c * step;
          let y = r * step;
          const x0 = x;
          const y0 = y;
          ctx.beginPath();
          ctx.moveTo(x, y);
          for (let s = 0; s < STATIC_STEPS; s++) {
            const ang = angleAt(x, y, phase + (r * 0.6 + c * 0.4));
            x += Math.cos(ang) * stepLen;
            y += Math.sin(ang) * stepLen;
            ctx.lineTo(x, y);
          }
          // Comet fade from tail (transparent) to head (color).
          const grad = ctx.createLinearGradient(x0, y0, x, y);
          const col = strokeColors[(r + c) % 2];
          grad.addColorStop(0, "transparent");
          grad.addColorStop(1, col);
          ctx.strokeStyle = grad;
          ctx.stroke();
        }
      }
      return () => ro.disconnect();
    }

    // ---- Animated: flow-field particle trails. ----
    // Two fixed groups (one per color) so each is stroked in a single batched
    // path — particles never switch group, so a frame is 1 fade rect + 2 strokes.
    const groups: Particle[][] = [[], []];
    const seed = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const total = Math.min(
        1400,
        Math.round((w * h) / 3200 * safeDensity),
      );
      groups[0].length = 0;
      groups[1].length = 0;
      for (let i = 0; i < total; i++) {
        groups[i % 2].push({
          x: Math.random() * w,
          y: Math.random() * h,
          age: 0,
          maxAge: 40 + Math.random() * 110,
        });
      }
    };
    seed();
    // Re-seed on size changes so density tracks the canvas.
    const roSeed = new ResizeObserver(seed);
    roSeed.observe(canvas);

    window.addEventListener("scroll", onScroll, { passive: true });
    const start = performance.now();
    const stepLen = 1.3;

    const draw = (now: number) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      // Ease smoothed scroll toward the latest value, then derive the field phase.
      scroll += (scrollTarget - scroll) * 0.08;
      const drift = ((now - start) / 1000) * safeSpeed;
      const phase = scroll * 0.0015 * safeScroll + drift;

      // Fade the previous frame toward the background → leaves comet trails.
      ctx.fillStyle = palette.fade(1 - safeTrail);
      ctx.fillRect(0, 0, w, h);

      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      for (let g = 0; g < groups.length; g++) {
        const arr = groups[g];
        ctx.strokeStyle = strokeColors[g];
        ctx.beginPath();
        for (let i = 0; i < arr.length; i++) {
          const p = arr[i];
          const ang = angleAt(p.x, p.y, phase);
          const nx = p.x + Math.cos(ang) * stepLen;
          const ny = p.y + Math.sin(ang) * stepLen;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(nx, ny);
          p.x = nx;
          p.y = ny;
          p.age++;
          if (p.age > p.maxAge || nx < 0 || nx > w || ny < 0 || ny > h) {
            p.x = Math.random() * w;
            p.y = Math.random() * h;
            p.age = 0;
            p.maxAge = 40 + Math.random() * 110;
          }
        }
        ctx.stroke();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      roSeed.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [theme, strokeColors, safeDensity, lineWidth, safeScroll, safeSpeed, safeTrail, reduced, palette]);

  // Centered scrim lifts text contrast over the field; outer vignette adds depth.
  const scrim =
    theme === "dark"
      ? "radial-gradient(ellipse 60% 50% at center, rgba(7,7,18,0.78), rgba(7,7,18,0) 70%)"
      : "radial-gradient(ellipse 60% 50% at center, rgba(238,241,248,0.85), rgba(238,241,248,0) 72%)";

  return (
    <div
      aria-hidden
      className={cn("absolute inset-0 overflow-hidden", className)}
      style={{ backgroundColor: palette.bg }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0" style={{ background: scrim }} />
    </div>
  );
}

type FlowFieldHeroProps = Omit<ComponentProps<"section">, "children"> & {
  children?: ReactNode;
  theme?: FlowFieldTheme;
  backgroundProps?: FlowFieldBackgroundProps;
};

export function FlowFieldHero({
  children,
  className,
  theme = "dark",
  backgroundProps,
  ...rest
}: FlowFieldHeroProps) {
  return (
    <section
      {...rest}
      data-theme={theme}
      className={cn(
        "relative isolate flex min-h-[100svh] w-full items-center justify-center overflow-hidden",
        theme === "dark" ? "text-white" : "text-slate-900",
        className,
      )}
    >
      <FlowFieldBackground theme={theme} {...backgroundProps} />
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        {children ?? <DefaultFlowFieldContent theme={theme} />}
      </div>
    </section>
  );
}

function DefaultFlowFieldContent({ theme = "dark" }: { theme?: FlowFieldTheme }) {
  const dark = theme === "dark";
  const badge = dark
    ? "border-white/15 bg-white/5 text-white/70"
    : "border-slate-900/10 bg-slate-900/5 text-slate-600";
  const sub = dark ? "text-white/65" : "text-slate-600";
  const primaryBtn = dark
    ? "bg-white text-black"
    : "bg-slate-900 text-white";
  const secondaryBtn = dark
    ? "border-white/15 text-white/85 hover:bg-white/5"
    : "border-slate-900/15 text-slate-700 hover:bg-slate-900/5";

  return (
    <>
      <motion.span
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, type: "spring", stiffness: 140, damping: 20 }}
        className={cn(
          "mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] backdrop-blur",
          badge,
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_10px_2px] shadow-sky-400/40" aria-hidden />
        Field · scroll to flow
      </motion.span>
      <motion.h1
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, type: "spring", stiffness: 120, damping: 18 }}
        className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl"
      >
        Momentum you can see.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24, type: "spring", stiffness: 120, damping: 18 }}
        className={cn("mt-5 max-w-xl text-pretty text-base sm:text-lg", sub)}
      >
        A canvas flow field of streamlines that bend and wave with the page
        scroll position. Scroll-driven, not cursor-driven — no external deps.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.36, type: "spring", stiffness: 120, damping: 18 }}
        className="mt-9 flex flex-wrap items-center justify-center gap-3"
      >
        <button
          type="button"
          className={cn(
            "group inline-flex h-11 cursor-pointer items-center gap-2 rounded-full px-6 text-sm font-medium transition-transform duration-200 hover:-translate-y-px",
            primaryBtn,
          )}
        >
          <span>Get started</span>
          <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
            →
          </span>
        </button>
        <button
          type="button"
          className={cn(
            "inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border px-6 font-mono text-xs uppercase tracking-[0.18em] backdrop-blur transition-colors",
            secondaryBtn,
          )}
        >
          View source
        </button>
      </motion.div>
    </>
  );
}

export default FlowFieldHero;
