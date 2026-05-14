"use client";

import { useEffect, useRef, type ComponentProps, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type NoiseDotFieldBackgroundProps = {
  className?: string;
  /** Approximate grid spacing in pixels (lower = denser dots). */
  spacing?: number;
  /** Dot color (any CSS color). */
  color?: string;
  /** Mouse-pocket radius in pixels. */
  pocketRadius?: number;
};

export function NoiseDotFieldBackground({
  className,
  spacing = 28,
  color = "rgba(255,255,255,0.85)",
  pocketRadius = 180,
}: NoiseDotFieldBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const mouse = { x: -9999, y: -9999, active: false };
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const { clientWidth, clientHeight } = canvas;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(clientWidth * dpr);
      canvas.height = Math.round(clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // Listen on window so pointer events over foreground content (z-10 headline,
    // buttons) still drive the dot pocket — the canvas sibling can't capture them.
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (!inside) {
        mouse.active = false;
        return;
      }
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener("pointermove", onMove);

    const start = performance.now();
    const draw = (now: number) => {
      const t = (now - start) / 1000;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;

      const step = spacing;
      const cols = Math.ceil(w / step) + 1;
      const rows = Math.ceil(h / step) + 1;
      const cx = mouse.active ? mouse.x : w * 0.5;
      const cy = mouse.active ? mouse.y : h * 0.5;
      const pocket2 = pocketRadius * pocketRadius;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x0 = c * step;
          const y0 = r * step;
          // Cheap "noise" via summed sines — keeps deps to zero, still feels organic.
          const nx = Math.sin((x0 + t * 22) * 0.014) + Math.cos((y0 - t * 16) * 0.011);
          const ny = Math.cos((x0 - t * 18) * 0.012) + Math.sin((y0 + t * 24) * 0.013);
          const dx = nx * 6;
          const dy = ny * 6;

          let x = x0 + dx;
          let y = y0 + dy;
          let size = 1;
          let alpha = 0.55;

          if (mouse.active) {
            const ddx = x - cx;
            const ddy = y - cy;
            const d2 = ddx * ddx + ddy * ddy;
            if (d2 < pocket2) {
              const falloff = 1 - d2 / pocket2;
              const push = falloff * 18;
              const len = Math.sqrt(d2) || 1;
              x += (ddx / len) * push;
              y += (ddy / len) * push;
              size = 1 + falloff * 2.4;
              alpha = 0.6 + falloff * 0.4;
            }
          }

          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [spacing, color, pocketRadius, reduced]);

  return (
    <div aria-hidden className={cn("absolute inset-0 overflow-hidden bg-[#0a0a0c]", className)}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_45%,_#0a0a0c_90%)]" />
    </div>
  );
}

type NoiseDotFieldHeroProps = Omit<ComponentProps<"section">, "children"> & {
  children?: ReactNode;
  backgroundProps?: NoiseDotFieldBackgroundProps;
};

export function NoiseDotFieldHero({
  children,
  className,
  backgroundProps,
  ...rest
}: NoiseDotFieldHeroProps) {
  return (
    <section
      {...rest}
      className={cn(
        "relative isolate flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-[#0a0a0c] text-white",
        className,
      )}
    >
      <NoiseDotFieldBackground {...backgroundProps} />
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        {children ?? <DefaultDotFieldContent />}
      </div>
    </section>
  );
}

function DefaultDotFieldContent() {
  return (
    <>
      <motion.span
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, type: "spring", stiffness: 140, damping: 20 }}
        className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/70 backdrop-blur"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-300/90 shadow-[0_0_10px_2px] shadow-cyan-300/40" aria-hidden />
        Field · 0x004
      </motion.span>
      <motion.h1
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, type: "spring", stiffness: 120, damping: 18 }}
        className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl"
      >
        Engineered, down to the pixel.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24, type: "spring", stiffness: 120, damping: 18 }}
        className="mt-5 max-w-xl text-pretty text-base text-white/65 sm:text-lg"
      >
        A canvas-rendered dot grid that displaces with a sine-wave noise field
        and parts around your cursor. No external animation deps.
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
          <span>Read the spec</span>
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
