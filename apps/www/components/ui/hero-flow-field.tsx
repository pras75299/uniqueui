"use client";

import { useEffect, useRef, type ComponentProps, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type FlowFieldBackgroundProps = {
  className?: string;
  /** Seed-grid spacing in pixels (lower = more streamlines, denser field). */
  spacing?: number;
  /** Stroke color for the streamlines (any CSS color). */
  color?: string;
  /** Color of the glowing particle at each streamline head. Defaults to `color`. */
  headColor?: string;
  /** Stroke width of each streamline in pixels. */
  lineWidth?: number;
  /**
   * How strongly the page scroll position bends the flow field. The waving
   * motion is driven by `window.scrollY`; raise to make scrolling reshape the
   * field faster, lower for a calmer response.
   */
  scrollStrength?: number;
  /** Idle drift speed so the field stays alive when the page isn't scrolling. */
  speed?: number;
};

// Number of segments traced per streamline. Kept low so a full redraw stays
// cheap (seeds × STEPS line segments per frame).
const STEPS = 16;

export function FlowFieldBackground({
  className,
  spacing = 56,
  color = "rgba(125,211,252,0.45)",
  headColor,
  lineWidth = 1.1,
  scrollStrength = 1,
  speed = 0.05,
}: FlowFieldBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    // Smoothed scroll value so abrupt jumps ease into the field.
    let scroll = window.scrollY;
    let scrollTarget = scroll;

    const resize = () => {
      const { clientWidth, clientHeight } = canvas;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
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

    const head = headColor ?? color;

    const render = (phase: number) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const step = spacing;
      const stepLen = step * 0.55;
      const cols = Math.ceil(w / step) + 1;
      const rows = Math.ceil(h / step) + 1;

      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // Stagger the seed phase per cell so neighbouring streamlines aren't
          // perfectly parallel — reads as a turbulent field, not a comb.
          const seedPhase = phase + (r * 0.6 + c * 0.4);
          let x = c * step;
          let y = r * step;

          ctx.strokeStyle = color;
          ctx.globalAlpha = 0.7;
          ctx.beginPath();
          ctx.moveTo(x, y);
          for (let s = 0; s < STEPS; s++) {
            const ang = angleAt(x, y, seedPhase);
            x += Math.cos(ang) * stepLen;
            y += Math.sin(ang) * stepLen;
            ctx.lineTo(x, y);
          }
          ctx.stroke();

          // Particle at the streamline head — the "particle field" half of the
          // effect. Brighter than the trail so the flow direction reads clearly.
          ctx.globalAlpha = 0.9;
          ctx.fillStyle = head;
          ctx.beginPath();
          ctx.arc(x, y, lineWidth * 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    if (reduced) {
      // Static field, anchored to the current scroll position. No rAF, no
      // scroll-driven motion — honors prefers-reduced-motion.
      render(scroll * 0.0015 * scrollStrength);
      return () => ro.disconnect();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    const start = performance.now();
    const draw = (now: number) => {
      // Ease smoothed scroll toward the latest value.
      scroll += (scrollTarget - scroll) * 0.08;
      const drift = ((now - start) / 1000) * speed;
      const phase = scroll * 0.0015 * scrollStrength + drift;
      render(phase);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [spacing, color, headColor, lineWidth, scrollStrength, speed, reduced]);

  return (
    <div aria-hidden className={cn("absolute inset-0 overflow-hidden bg-[#06070a]", className)}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_#06070a_92%)]" />
    </div>
  );
}

type FlowFieldHeroProps = Omit<ComponentProps<"section">, "children"> & {
  children?: ReactNode;
  backgroundProps?: FlowFieldBackgroundProps;
};

export function FlowFieldHero({
  children,
  className,
  backgroundProps,
  ...rest
}: FlowFieldHeroProps) {
  return (
    <section
      {...rest}
      className={cn(
        "relative isolate flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-[#06070a] text-white",
        className,
      )}
    >
      <FlowFieldBackground {...backgroundProps} />
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        {children ?? <DefaultFlowFieldContent />}
      </div>
    </section>
  );
}

function DefaultFlowFieldContent() {
  return (
    <>
      <motion.span
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, type: "spring", stiffness: 140, damping: 20 }}
        className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/70 backdrop-blur"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-sky-300/90 shadow-[0_0_10px_2px] shadow-sky-300/40" aria-hidden />
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
        className="mt-5 max-w-xl text-pretty text-base text-white/65 sm:text-lg"
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
          className="group inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-medium text-black transition-transform duration-200 hover:-translate-y-px"
        >
          <span>Get started</span>
          <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
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

export default FlowFieldHero;
