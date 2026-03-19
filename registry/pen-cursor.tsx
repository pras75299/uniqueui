"use client";

import { cn } from "@/lib/utils";
import React, {
  useEffect,
  useRef,
  type RefObject,
} from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface TrailPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface PenCursorProps {
  /**
   * Number of chain-linked trail points.
   * More points = longer, more dramatic ribbon. Default 60.
   */
  trailLength?: number;
  /**
   * Maximum ribbon width in CSS pixels. Scales with mouse speed. Default 20.
   */
  maxWidth?: number;
  /**
   * Minimum ribbon width in CSS pixels at the tail. Default 1.
   */
  minWidth?: number;
  /**
   * Spring damping for the first (head) point (0–1). Default 0.6.
   */
  damping?: number;
  /**
   * How much inertia each point retains between frames. Default 0.8.
   */
  inertiaRetention?: number;
  /**
   * How strongly the inertia accumulates. Default 0.3.
   */
  inertiaInfluence?: number;
  /**
   * Scalar for inertia displacement per frame. Default 0.025.
   */
  inertiaStrength?: number;
  /**
   * How much mouse speed widens the ribbon (0–1). Default 0.9.
   */
  speedInfluence?: number;
  /**
   * Mouse speed (px/s) considered "maximum" for scaling purposes. Default 600.
   */
  speedMax?: number;
  /**
   * Low-pass smoothing for the measured speed (0–1, lower = smoother). Default 0.2.
   */
  speedSmoothing?: number;
  /**
   * RGB string for the ribbon head color. Default sage green "159, 175, 155".
   */
  colorHead?: string;
  /**
   * RGB string for the ribbon tail color. Default warm gold "198, 167, 106".
   */
  colorTail?: string;
  /**
   * Opacity at the ribbon head (0–1). Default 0.9.
   */
  alphaHead?: number;
  /**
   * Opacity at the ribbon tail (0–1). Default 0.
   */
  alphaTail?: number;
  /**
   * Canvas globalCompositeOperation. Default "source-over".
   */
  blendMode?: GlobalCompositeOperation;
  /**
   * When true, hides the native system cursor. Default false.
   */
  hideSystemCursor?: boolean;
  /**
   * Constrain tracking to this element (coordinates relative to the element).
   * The parent must be `position: relative`. Omit for full-viewport.
   */
  containerRef?: RefObject<HTMLElement | null>;
  className?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function makePoints(n: number): TrailPoint[] {
  return Array.from({ length: n }, () => ({ x: 0, y: 0, vx: 0, vy: 0 }));
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * PenCursor — a physics-driven ribbon trail canvas overlay inspired by
 * obsidianassembly.com. A chain of `trailLength` points follows the mouse with
 * damped spring + inertia physics. The ribbon width scales with cursor speed,
 * and colors interpolate head-to-tail via per-segment linear gradients.
 */
export function PenCursor({
  trailLength = 60,
  maxWidth = 20,
  minWidth = 1,
  damping = 0.6,
  inertiaRetention = 0.8,
  inertiaInfluence = 0.3,
  inertiaStrength = 0.025,
  speedInfluence = 0.9,
  speedMax = 600,
  speedSmoothing = 0.2,
  colorHead = "159, 175, 155",
  colorTail = "198, 167, 106",
  alphaHead = 0.9,
  alphaTail = 0,
  blendMode = "source-over",
  hideSystemCursor = false,
  containerRef,
  className,
}: PenCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // -------------------------------------------------------------------
  // Hide / restore native cursor
  // -------------------------------------------------------------------
  useEffect(() => {
    if (!hideSystemCursor || typeof document === "undefined") return;
    const prev = document.documentElement.style.cursor;
    document.documentElement.style.cursor = "none";
    return () => {
      document.documentElement.style.cursor = prev;
    };
  }, [hideSystemCursor]);

  // -------------------------------------------------------------------
  // Main render loop
  // -------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // ── State ──
    const points = makePoints(trailLength);
    const mouse = { x: -9999, y: -9999 };
    let speed = 0;
    let lastTime = performance.now();
    let started = false;
    let raf = 0;
    let cancelled = false;

    // ── Resize ──
    let roCleanup: (() => void) | undefined;

    const syncSize = (el: HTMLElement | null) => {
      if (el) {
        canvas.width = el.clientWidth || 1;
        canvas.height = el.clientHeight || 1;
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    // ── Mouse ──
    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      const dt = Math.max(1, now - lastTime) / 1000;

      const el = containerRef?.current ?? null;
      let nx: number;
      let ny: number;
      if (el) {
        const rect = el.getBoundingClientRect();
        nx = e.clientX - rect.left;
        ny = e.clientY - rect.top;
      } else {
        nx = e.clientX;
        ny = e.clientY;
      }

      // Snap all points to first mouse position on first move
      if (!started) {
        for (const p of points) {
          p.x = nx;
          p.y = ny;
        }
        started = true;
        mouse.x = nx;
        mouse.y = ny;
        lastTime = now;
        return;
      }

      const dx = nx - mouse.x;
      const dy = ny - mouse.y;
      const instantSpeed = Math.hypot(dx, dy) / dt;
      const targetRatio = Math.min(1, instantSpeed / speedMax);
      speed += (targetRatio - speed) * speedSmoothing;

      mouse.x = nx;
      mouse.y = ny;
      lastTime = now;
    };

    // ── Draw ──
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!started) {
        raf = requestAnimationFrame(draw);
        return;
      }

      const speedFactor = 1 + speedInfluence * speed;

      // Update head point toward mouse
      const p0 = points[0];
      const hdx = (mouse.x - p0.x) * (damping + 0.1);
      const hdy = (mouse.y - p0.y) * (damping + 0.1);
      p0.vx = p0.vx * inertiaRetention + hdx * inertiaInfluence * speedFactor;
      p0.vy = p0.vy * inertiaRetention + hdy * inertiaInfluence * speedFactor;
      p0.x += hdx + p0.vx * inertiaStrength * speedFactor;
      p0.y += hdy + p0.vy * inertiaStrength * speedFactor;

      // Update rest of chain
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const sdx = (prev.x - curr.x) * damping;
        const sdy = (prev.y - curr.y) * damping;
        curr.vx = curr.vx * inertiaRetention + sdx * inertiaInfluence * 2;
        curr.vy = curr.vy * inertiaRetention + sdy * inertiaInfluence * 4;
        curr.x += sdx + curr.vx * inertiaStrength;
        curr.y += sdy + curr.vy * inertiaStrength;
      }

      // ── Draw ribbon ──
      ctx.save();
      ctx.globalCompositeOperation = blendMode;
      const n = points.length;

      for (let i = 0; i < n - 1; i++) {
        const tNear = i / (n - 1);       // 0 at head, 1 at tail
        const tFar = (i + 1) / (n - 1);

        const a = points[i];
        const b = points[i + 1];

        // Width at this segment
        const wNear = lerp(maxWidth, minWidth, tNear) * speedFactor;
        const wFar = lerp(maxWidth, minWidth, tFar) * speedFactor;

        // Perpendicular normal to the segment direction
        const dxSeg = b.x - a.x;
        const dySeg = b.y - a.y;
        const len = Math.hypot(dxSeg, dySeg) || 0.0001;
        const nx2 = -dySeg / len;
        const ny2 = dxSeg / len;

        // Four corners of the ribbon quad
        const ax1 = a.x + nx2 * wNear;
        const ay1 = a.y + ny2 * wNear;
        const ax2 = a.x - nx2 * wNear;
        const ay2 = a.y - ny2 * wNear;
        const bx1 = b.x + nx2 * wFar;
        const by1 = b.y + ny2 * wFar;
        const bx2 = b.x - nx2 * wFar;
        const by2 = b.y - ny2 * wFar;

        // Per-segment alpha + color interpolated along gradient head → tail
        const alphaA = lerp(alphaHead, alphaTail, tNear);
        const alphaB = lerp(alphaHead, alphaTail, tFar);
        // Color: interpolate between colorHead and colorTail by t
        const colorA = tNear <= 0.5 ? colorHead : colorTail;
        const colorB = tFar <= 0.5 ? colorHead : colorTail;

        let grad: CanvasGradient;
        try {
          grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        } catch {
          continue;
        }
        grad.addColorStop(0, `rgba(${colorA}, ${alphaA})`);
        grad.addColorStop(1, `rgba(${colorB}, ${alphaB})`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(ax1, ay1);
        ctx.lineTo(bx1, by1);
        ctx.lineTo(bx2, by2);
        ctx.lineTo(ax2, ay2);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
      raf = requestAnimationFrame(draw);
    };

    // ── Attach with retry for containerRef ──
    // The ref may not be populated yet on first render tick.
    // We retry up to 120 rAF frames (~2s) before falling back to window.
    let rafRetries = 0;

    const attach = () => {
      const el = containerRef?.current ?? null;

      if (containerRef && !el) {
        // ref provided but not yet populated → retry
        rafRetries++;
        if (!cancelled && rafRetries < 120) {
          requestAnimationFrame(attach);
        } else if (!cancelled) {
          // Fallback to window
          window.addEventListener("mousemove", onMove);
          syncSize(null);
          window.addEventListener("resize", () => syncSize(null));
          raf = requestAnimationFrame(draw);
        }
        return;
      }

      // el is our container (or null = viewport)
      const target: EventTarget = el ?? window;
      target.addEventListener("mousemove", onMove as EventListener);

      if (el) {
        const ro = new ResizeObserver(() => syncSize(el));
        ro.observe(el);
        syncSize(el);
        roCleanup = () => ro.disconnect();
      } else {
        syncSize(null);
        const onResize = () => syncSize(null);
        window.addEventListener("resize", onResize);
        roCleanup = () => window.removeEventListener("resize", onResize);
      }

      raf = requestAnimationFrame(draw);

      // Store target for cleanup
      (canvas as any).__cleanupTarget = target;
    };

    attach();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      const target = (canvas as any).__cleanupTarget as EventTarget | undefined;
      if (target) {
        target.removeEventListener("mousemove", onMove as EventListener);
      }
      roCleanup?.();
    };
  }, [
    containerRef,
    trailLength,
    maxWidth,
    minWidth,
    damping,
    inertiaRetention,
    inertiaInfluence,
    inertiaStrength,
    speedInfluence,
    speedMax,
    speedSmoothing,
    colorHead,
    colorTail,
    alphaHead,
    alphaTail,
    blendMode,
  ]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn(
        "pointer-events-none z-[9999]",
        containerRef
          ? "absolute inset-0 h-full w-full"
          : "fixed inset-0 h-screen w-screen",
        className,
      )}
    />
  );
}
