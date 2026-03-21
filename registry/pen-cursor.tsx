"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { useMotionValue, useSpring } from "motion/react";

const DEFAULT_COLOR = "#737373";

const DEFAULT_SPRING = {
  stiffness: 280,
  damping: 36,
  mass: 0.55,
} as const;

/** Default: ink-like tail that fades quickly (ms). */
const DEFAULT_FADE_MS = 420;

/** Denser samples = smoother line (px between points). */
const DEFAULT_MIN_DISTANCE = 1.15;

export interface PenCursorProps {
  /** Stroke color (default neutral grey). */
  color?: string;
  /** Stroke width in CSS pixels. */
  lineWidth?: number;
  /** How long each part of the stroke stays visible before fading out (ms). */
  fadeDurationMs?: number;
  /** Minimum distance between samples to reduce jitter (px); lower = smoother line. */
  minDistance?: number;
  /** Cap on stored points (safety limit). */
  maxPoints?: number;
  /** Spring physics so the stroke follows the pointer with a drawing-like lag. */
  spring?: {
    stiffness?: number;
    damping?: number;
    mass?: number;
  };
  /**
   * When true, hides the system cursor. Default false so the normal pointer stays visible
   * while the stroke draws underneath.
   */
  hideSystemCursor?: boolean;
  className?: string;
}

type StrokePoint = { x: number; y: number; t: number };

/**
 * Catmull-Rom–style smooth cubic through points (one continuous path, no segment gaps).
 */
function smoothPathD(points: { x: number; y: number }[]): string {
  const n = points.length;
  if (n === 0) return "";
  if (n === 1) {
    const p = points[0];
    return `M ${p.x} ${p.y} L ${p.x + 0.01} ${p.y}`;
  }
  if (n === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = i === 0 ? points[0] : points[i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i + 2 < n ? points[i + 2] : points[i + 1];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`;
  }
  return d;
}

/**
 * Decorative drawing stroke: one smooth path + soft tail via mask gradient (no “drops”).
 * System cursor stays visible unless `hideSystemCursor` is set.
 */
export function PenCursor({
  color = DEFAULT_COLOR,
  lineWidth = 2.5,
  fadeDurationMs = DEFAULT_FADE_MS,
  minDistance = DEFAULT_MIN_DISTANCE,
  maxPoints = 240,
  spring,
  hideSystemCursor = false,
  className,
}: PenCursorProps) {
  const springConfig = {
    stiffness: spring?.stiffness ?? DEFAULT_SPRING.stiffness,
    damping: spring?.damping ?? DEFAULT_SPRING.damping,
    mass: spring?.mass ?? DEFAULT_SPRING.mass,
  };

  const targetX = useMotionValue(-100);
  const targetY = useMotionValue(-100);

  const x = useSpring(targetX, springConfig);
  const y = useSpring(targetY, springConfig);

  const [points, setPoints] = useState<StrokePoint[]>([]);
  const startedRef = useRef(false);

  const [viewport, setViewport] = useState({ w: 1, h: 1 });

  const reactId = useId();
  const svgIds = useMemo(
    () => ({
      grad: `pen-cursor-grad-${reactId.replace(/:/g, "")}`,
      mask: `pen-cursor-mask-${reactId.replace(/:/g, "")}`,
    }),
    [reactId],
  );

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!startedRef.current) {
        startedRef.current = true;
        targetX.set(e.clientX);
        targetY.set(e.clientY);
        x.set(e.clientX);
        y.set(e.clientY);
      } else {
        targetX.set(e.clientX);
        targetY.set(e.clientY);
      }
    };

    window.addEventListener("mousemove", handleMove);

    return () => {
      window.removeEventListener("mousemove", handleMove);
    };
  }, [targetX, targetY, x, y]);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const now = Date.now();

      const px = x.get();
      const py = y.get();
      if (startedRef.current && px >= 0 && py >= 0) {
        setPoints((prev) => {
          const next = prev.filter((p) => now - p.t < fadeDurationMs);
          const last = next[next.length - 1];
          if (
            last &&
            Math.hypot(px - last.x, py - last.y) < minDistance
          ) {
            return next;
          }
          const appended: StrokePoint[] = [
            ...next,
            { x: px, y: py, t: now },
          ];
          return appended.length > maxPoints
            ? appended.slice(-maxPoints)
            : appended;
        });
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [x, y, maxPoints, minDistance, fadeDurationMs]);

  useEffect(() => {
    const sync = () => {
      setViewport({
        w: typeof window !== "undefined" ? window.innerWidth : 1,
        h: typeof window !== "undefined" ? window.innerHeight : 1,
      });
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  useEffect(() => {
    if (!hideSystemCursor || typeof document === "undefined") return;
    const prev = document.documentElement.style.cursor;
    document.documentElement.style.cursor = "none";
    return () => {
      document.documentElement.style.cursor = prev;
    };
  }, [hideSystemCursor]);

  const pathD = useMemo(() => {
    const plain = points.map((p) => ({ x: p.x, y: p.y }));
    return smoothPathD(plain);
  }, [points]);

  const gradientLine = useMemo(() => {
    if (points.length < 2) {
      return { x1: 0, y1: 0, x2: 1, y2: 0 };
    }
    const a = points[0];
    const b = points[points.length - 1];
    return { x1: a.x, y1: a.y, x2: b.x, y2: b.y };
  }, [points]);

  /** Soft tail: mask stroke uses same path + gradient white alpha (tail → tip). */
  const maskStrokeW = lineWidth + 6;

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-[9999] overflow-hidden",
        className,
      )}
      aria-hidden
    >
      <svg
        className="absolute inset-0 h-full w-full"
        width={viewport.w}
        height={viewport.h}
        viewBox={`0 0 ${viewport.w} ${viewport.h}`}
        aria-hidden
      >
        <defs>
          <linearGradient
            id={svgIds.grad}
            gradientUnits="userSpaceOnUse"
            x1={gradientLine.x1}
            y1={gradientLine.y1}
            x2={gradientLine.x2}
            y2={gradientLine.y2}
          >
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="18%" stopColor="white" stopOpacity="0.2" />
            <stop offset="55%" stopColor="white" stopOpacity="0.75" />
            <stop offset="100%" stopColor="white" stopOpacity="1" />
          </linearGradient>
          <mask id={svgIds.mask} maskUnits="userSpaceOnUse">
            {pathD ? (
              <path
                d={pathD}
                fill="none"
                stroke={`url(#${svgIds.grad})`}
                strokeWidth={maskStrokeW}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}
          </mask>
        </defs>
        {pathD ? (
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth={lineWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            mask={`url(#${svgIds.mask})`}
          />
        ) : null}
      </svg>
    </div>
  );
}
