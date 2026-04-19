"use client";

import React, { useEffect, useLayoutEffect, useRef, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export interface LightSpeedProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Animation speed multiplier. Higher = faster streaks. Range: 0.1–5. */
  speed?: number;
  /** Trail length and glow intensity multiplier. Range: 0.1–3. */
  intensity?: number;
  /** Total number of particles rendered (capped by quality preset). */
  particleCount?: number;
  /**
   * CSS colour used to tint the particle palette — accepts #rrggbb, #rgb, or rgb().
   * Each palette colour's channels are multiplied by the normalised tint values.
   * Defaults to white (#ffffff), which leaves all palette colours unchanged.
   */
  tint?: string;
  /** Performance preset. "low" disables blur and will-change; "high" enables 4-layer glow. */
  quality?: "low" | "medium" | "high";
  /** Pause all particle animations without restarting them. */
  paused?: boolean;
}

interface ParticleConfig {
  id: number;
  angle: number;
  duration: number;
  delay: number;
  /** Stable spawn-jitter distance from centre (px). Fixed at creation so resizes don't re-randomise origins. */
  jitter: number;
  r: number;
  g: number;
  b: number;
  size: number;
  trailLength: number;
}

// Multi-hued palette: cool blues, warm ambers, magenta, teal, white
const PALETTE: readonly [number, number, number][] = [
  [210, 228, 255], // icy blue-white
  [145, 190, 255], // periwinkle
  [255, 255, 255], // pure white
  [255, 255, 230], // warm white
  [255, 205, 80],  // golden amber
  [255, 170, 55],  // deep amber
  [255, 92, 175],  // hot pink
  [215, 75, 255],  // violet
  [75, 230, 255],  // electric cyan
  [60, 210, 185],  // teal
  [255, 115, 75],  // warm coral
  [180, 255, 200], // soft mint
];

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function capCount(count: number, quality: "low" | "medium" | "high") {
  if (quality === "low") return Math.min(count, 100);
  if (quality === "high") return Math.min(count, 1000);
  return Math.min(count, 500);
}

function makeParticles(count: number): ParticleConfig[] {
  return Array.from({ length: count }, (_, id) => {
    const [r, g, b] = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    return {
      id,
      angle: Math.random() * Math.PI * 2,
      duration: rand(0.4, 2.8),
      delay: rand(0, 2.5),
      jitter: rand(0, 6),
      r, g, b,
      size: rand(1, 3),
      trailLength: rand(1.5, 9),
    };
  });
}

/**
 * Parses a CSS colour string (#rrggbb, #rgb, rgb()) into three 0–1 multipliers.
 * Returns [1, 1, 1] (no-op) for unrecognised formats.
 */
function parseTint(tint: string): readonly [number, number, number] {
  const s = tint.trim();
  if (/^#[0-9a-f]{6}$/i.test(s)) {
    return [
      parseInt(s.slice(1, 3), 16) / 255,
      parseInt(s.slice(3, 5), 16) / 255,
      parseInt(s.slice(5, 7), 16) / 255,
    ];
  }
  if (/^#[0-9a-f]{3}$/i.test(s)) {
    return [
      parseInt(s[1] + s[1], 16) / 255,
      parseInt(s[2] + s[2], 16) / 255,
      parseInt(s[3] + s[3], 16) / 255,
    ];
  }
  const m = s.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
  if (m) return [+m[1] / 255, +m[2] / 255, +m[3] / 255];
  return [1, 1, 1];
}

export function LightSpeed({
  className,
  children,
  style,
  speed = 1,
  intensity = 1,
  particleCount = 300,
  tint = "#ffffff",
  quality = "medium",
  paused = false,
  ...rest
}: LightSpeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const particleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const animationsRef = useRef<Animation[]>([]);
  const pausedRef = useRef(paused);
  useLayoutEffect(() => { pausedRef.current = paused; }, [paused]);

  const capped = capCount(particleCount, quality);
  // Particles are generated client-side only: makeParticles() uses Math.random(),
  // which produces different values on server vs client and causes hydration errors.
  const [particles, setParticles] = useState<ParticleConfig[]>([]);
  useEffect(() => { setParticles(makeParticles(capped)); }, [capped]);
  const [tintR, tintG, tintB] = useMemo(() => parseTint(tint), [tint]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let animations: Animation[] = [];
    let lastW = 0;
    let lastH = 0;

    function launchAll(width: number, height: number) {
      // Skip re-launch when dimensions are unchanged — prevents the double-fire
      // from getBoundingClientRect() + ResizeObserver firing on the same frame.
      if (Math.abs(width - lastW) < 1 && Math.abs(height - lastH) < 1) return;
      lastW = width;
      lastH = height;

      animations.forEach(a => { try { a.cancel(); } catch {} });
      animations = [];

      const cx = width / 2;
      const cy = height / 2;
      const maxRadius = Math.hypot(cx, cy) * 1.18;

      particles.forEach((p, i) => {
        const el = particleRefs.current[i];
        if (!el) return;

        const cos = Math.cos(p.angle);
        const sin = Math.sin(p.angle);
        const half = p.size / 2;

        // Use the particle's stable jitter instead of re-randomising on each resize.
        const sx = cx + cos * p.jitter - half;
        const sy = cy + sin * p.jitter - half;
        const mx = cx + cos * (maxRadius * 0.5) - half;
        const my = cy + sin * (maxRadius * 0.5) - half;
        const ex = cx + cos * maxRadius - half;
        const ey = cy + sin * maxRadius - half;

        const pr = Math.min(255, Math.round(p.r * tintR));
        const pg = Math.min(255, Math.round(p.g * tintG));
        const pb = Math.min(255, Math.round(p.b * tintB));
        const colorCss = `rgb(${pr},${pg},${pb})`;

        const effectiveDuration = (p.duration / Math.max(speed, 0.01)) * 1000;
        const effectiveTrail = p.trailLength * Math.max(intensity, 0.1);

        el.style.backgroundColor = colorCss;

        if (quality === "low") {
          el.style.boxShadow = "none";
          el.style.filter = "none";
        } else if (quality === "high") {
          el.style.boxShadow = [
            `0 0 ${Math.round(2 * intensity)}px ${colorCss}`,
            `0 0 ${Math.round(6 * intensity)}px ${colorCss}`,
            `0 0 ${Math.round(14 * intensity)}px ${colorCss}`,
            `0 0 ${Math.round(28 * intensity)}px ${colorCss}`,
          ].join(", ");
          el.style.filter = "blur(0.5px)";
        } else {
          el.style.boxShadow = [
            `0 0 ${Math.round(2 * intensity)}px ${colorCss}`,
            `0 0 ${Math.round(7 * intensity)}px ${colorCss}`,
            `0 0 ${Math.round(16 * intensity)}px ${colorCss}`,
          ].join(", ");
          el.style.filter = "blur(0.5px)";
        }

        const angleDeg = p.angle * (180 / Math.PI);
        const midTrail = effectiveTrail * 0.6;

        const anim = el.animate(
          [
            {
              transform: `translate(${sx}px, ${sy}px) rotate(${angleDeg}deg) scaleX(0.4) scaleY(1)`,
              opacity: "0",
            },
            {
              transform: `translate(${mx}px, ${my}px) rotate(${angleDeg}deg) scaleX(${midTrail}) scaleY(0.45)`,
              opacity: "0.94",
              offset: 0.5,
            },
            {
              transform: `translate(${ex}px, ${ey}px) rotate(${angleDeg}deg) scaleX(${effectiveTrail}) scaleY(0.28)`,
              opacity: "0",
            },
          ],
          {
            duration: effectiveDuration,
            delay: p.delay * 1000,
            iterations: Infinity,
            easing: "ease-in",
          }
        );

        animations.push(anim);
        if (pausedRef.current) anim.pause();
      });

      animationsRef.current = animations;
    }

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) launchAll(width, height);
    });
    ro.observe(container);

    const rect = container.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      launchAll(rect.width, rect.height);
    }

    return () => {
      ro.disconnect();
      animations.forEach(a => { try { a.cancel(); } catch {} });
      animationsRef.current = [];
    };
  }, [particles, tintR, tintG, tintB, speed, intensity, quality]);

  useEffect(() => {
    animationsRef.current.forEach(a => {
      try { if (paused) { a.pause(); } else { a.play(); } } catch {}
    });
  }, [paused]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full overflow-hidden select-none",
        className
      )}
      style={{ background: "#000008", ...style }}
      {...rest}
    >
      {/* Layered ambient radial glow: warm core, cool mid-field, deep vignette */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: [
            "radial-gradient(ellipse 28% 28% at 50% 50%, rgba(255,140,20,0.09) 0%, transparent 100%)",
            "radial-gradient(ellipse 55% 55% at 50% 50%, rgba(20,90,200,0.05) 0%, transparent 100%)",
            "radial-gradient(ellipse 90% 90% at 50% 50%, rgba(0,0,8,0.4) 40%, rgba(0,0,8,0.85) 100%)",
          ].join(", "),
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Particle pool — will-change omitted for quality="low" to save compositor layers */}
      {particles.map((p, i) => (
        <div
          key={p.id}
          ref={el => { particleRefs.current[i] = el; }}
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            ...(quality !== "low" && { willChange: "transform, opacity" }),
            transformOrigin: "center center",
            pointerEvents: "none",
            opacity: 0,
          }}
        />
      ))}

      {children && (
        <div
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export default LightSpeed;
