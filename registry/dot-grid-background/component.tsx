"use client";
import { cn } from "@/lib/utils";
import React, { useRef, useEffect, useCallback } from "react";

type Ripple = { x: number; y: number; birth: number };

type Dot = {
  x: number;
  y: number;
  phase: number;
  speed: number;
  glow: number; // 0–1, retained after the ripple ring passes; decays each frame
};

// Animation constants — tuned for 60 fps
const RIPPLE_SPEED = 360;  // px/s
const RING_WIDTH   = 58;   // px — thickness of the energised ring
const RIPPLE_LIFE  = 2400; // ms
const GLOW_DECAY   = 0.965;
const COLOR_STEPS  = 20;   // pre-built colour interpolation table size

export interface DotGridBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  dotColor?: string;
  dotSize?: number;
  gap?: number;
  hoverRadius?: number;
  hoverScale?: number;
  theme?: "light" | "dark";
}

export function DotGridBackground({
  children,
  className,
  dotColor,
  dotSize = 1.5,
  gap = 28,
  hoverRadius = 150,
  hoverScale = 3.5,
  theme = "dark",
}: DotGridBackgroundProps) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const mouseRef      = useRef({ x: -9999, y: -9999 });
  const lastSpawnRef  = useRef({ x: -9999, y: -9999 });
  const ripplesRef    = useRef<Ripple[]>([]);
  const dotsRef       = useRef<Dot[]>([]);
  const rafRef        = useRef(0);
  const lastNowRef    = useRef<number | null>(null);

  const buildDots = useCallback((w: number, h: number) => {
    // Guard against non-finite or non-positive gap to prevent infinite loop
    const step = Number.isFinite(gap) && gap > 0 ? gap : 28;
    const dots: Dot[] = [];
    for (let x = step; x < w; x += step) {
      for (let y = step; y < h; y += step) {
        dots.push({
          x,
          y,
          phase: Math.random() * Math.PI * 2,
          speed: 0.006 + Math.random() * 0.01,
          glow:  0,
        });
      }
    }
    dotsRef.current = dots;
  }, [gap]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas    = canvasRef.current;
    if (!container || !canvas) return;

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width        = width  * dpr;
      canvas.height       = height * dpr;
      canvas.style.width  = `${width}px`;
      canvas.style.height = `${height}px`;
      buildDots(width, height);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => ro.disconnect();
  }, [buildDots]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isDark = theme === "dark";
    const dpr    = window.devicePixelRatio || 1;

    let baseR = isDark ? 255 : 15;
    let baseG = isDark ? 255 : 15;
    let baseB = isDark ? 255 : 20;

    if (dotColor) {
      // Robust color probe: use the browser's CSS engine to resolve any valid color string
      let resolved = false;
      if (typeof window !== "undefined") {
        try {
          const probe = document.createElement("div");
          probe.style.color = dotColor;
          // color must be set for getComputedStyle to return a value
          document.body.appendChild(probe);
          const computed = getComputedStyle(probe).color; // returns "rgb(r, g, b)" or ""
          document.body.removeChild(probe);
          const m = computed.match(/[\d.]+/g);
          if (m && m.length >= 3) {
            baseR = parseInt(m[0]);
            baseG = parseInt(m[1]);
            baseB = parseInt(m[2]);
            resolved = true;
          }
        } catch {
          // fall through to legacy path
        }
      }
      // Legacy numeric-extraction fallback (e.g., SSR or probe failure)
      if (!resolved) {
        const m = dotColor.match(/[\d.]+/g);
        if (m && m.length >= 3) {
          baseR = parseInt(m[0]);
          baseG = parseInt(m[1]);
          baseB = parseInt(m[2]);
        }
      }
    }

    const [accR, accG, accB] = isDark ? [80, 200, 255] : [99, 91, 255];

    // Pre-build colour strings once so the hot loop does table lookups, not allocations
    const colorTable = Array.from({ length: COLOR_STEPS }, (_, i) => {
      const t = i / (COLOR_STEPS - 1);
      return `rgb(${Math.round(baseR + (accR - baseR) * t)},${Math.round(baseG + (accG - baseG) * t)},${Math.round(baseB + (accB - baseB) * t)})`;
    });

    const BASE_ALPHA    = isDark ? 0.12 : 0.16;
    const PULSE_AMP     = isDark ? 0.05 : 0.06;
    const hoverRadiusSq = hoverRadius * hoverRadius; // avoid sqrt for out-of-range dots

    const frame = (now: number) => {
      // Derive logical dimensions from the canvas physical size — avoids a
      // getBoundingClientRect reflow on every animation frame.
      const width  = canvas.width  / dpr;
      const height = canvas.height / dpr;

      if (width === 0 || height === 0) {
        lastNowRef.current = now;
        rafRef.current = requestAnimationFrame(frame);
        return;
      }

      // Time-based delta so animations run at the same real-world speed
      // regardless of the device's frame rate.
      const lastNow = lastNowRef.current ?? now;
      const dtMs = now - lastNow;
      const normalizedDelta = dtMs / (1000 / 60); // 1.0 at 60 fps

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      // Only allocate a new array when at least one ripple has expired
      if (ripplesRef.current.some((r) => now - r.birth >= RIPPLE_LIFE)) {
        ripplesRef.current = ripplesRef.current.filter((r) => now - r.birth < RIPPLE_LIFE);
      }

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      if (mx > 0 && mx < width && my > 0 && my < height) {
        const grad = ctx.createRadialGradient(mx, my, 0, mx, my, hoverRadius * 1.3);
        grad.addColorStop(0, `rgba(${accR},${accG},${accB},${isDark ? 0.05 : 0.035})`);
        grad.addColorStop(1, `rgba(${accR},${accG},${accB},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(mx, my, hoverRadius * 1.3, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const dot of dotsRef.current) {
        // Time-based updates: scale by normalizedDelta so speed is frame-rate independent
        dot.phase += dot.speed * normalizedDelta;
        dot.glow  *= Math.pow(GLOW_DECAY, normalizedDelta);

        const dx     = dot.x - mx;
        const dy     = dot.y - my;
        const distSq = dx * dx + dy * dy;

        const idle = BASE_ALPHA + Math.sin(dot.phase) * PULSE_AMP;

        // Squared-distance guard skips sqrt for the majority of dots outside hover radius
        let cursorT = 0;
        if (distSq < hoverRadiusSq) {
          const t = 1 - Math.sqrt(distSq) / hoverRadius;
          cursorT  = t * t * t * 0.85;
        }

        let ringT = 0;
        for (const r of ripplesRef.current) {
          const rdx   = dot.x - r.x;
          const rdy   = dot.y - r.y;
          const d     = Math.sqrt(rdx * rdx + rdy * rdy);
          const age   = now - r.birth; // real-time age — unchanged
          const front = (age / 1000) * RIPPLE_SPEED;
          const diff  = Math.abs(d - front);

          if (diff < RING_WIDTH) {
            const ring  = 1 - diff / RING_WIDTH;
            const decay = 1 - age / RIPPLE_LIFE;
            const s     = ring * ring * decay;
            if (s > ringT) ringT = s;
          }
        }

        if (ringT > dot.glow) dot.glow = ringT;
        const wakeBoost  = dot.glow * 0.32;
        const totalAlpha = Math.min(1, idle + cursorT * 0.72 + ringT * 0.88 + wakeBoost);
        const activation = Math.max(cursorT, ringT + wakeBoost * 0.4);
        const radius     = (dotSize / 2) * (1 + activation * (hoverScale - 1));

        const colorIdx   = Math.min(COLOR_STEPS - 1, Math.floor(Math.min(1, activation * 1.5) * (COLOR_STEPS - 1)));
        ctx.fillStyle    = colorTable[colorIdx];
        ctx.globalAlpha  = totalAlpha;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore(); // also resets globalAlpha to 1
      lastNowRef.current = now;
      rafRef.current = requestAnimationFrame(frame);
    };

    lastNowRef.current = null;
    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [theme, dotSize, hoverRadius, hoverScale, dotColor]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseRef.current = { x, y };

    const { x: lx, y: ly } = lastSpawnRef.current;
    if ((x - lx) ** 2 + (y - ly) ** 2 > 400) { // 20 px threshold
      ripplesRef.current.push({ x, y, birth: performance.now() });
      if (ripplesRef.current.length > 7) ripplesRef.current.shift();
      lastSpawnRef.current = { x, y };
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -9999, y: -9999 };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative overflow-hidden",
        theme === "dark" ? "bg-neutral-950" : "bg-white",
        className
      )}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
