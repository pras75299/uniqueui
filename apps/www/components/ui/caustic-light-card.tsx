"use client";

import * as React from "react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  motion,
  useReducedMotion,
  useSpring,
  type HTMLMotionProps,
} from "motion/react";
import { cn } from "@/lib/utils";

export type CausticDirection = "bottom" | "top" | "left" | "right" | "all";

export interface CausticLightCardProps
  extends Omit<HTMLMotionProps<"div">, "onDrag"> {
  /**
   * Tint color for the caustic highlights. Accepts any CSS color string the
   * browser can parse: hex, `rgb(...)`, `hsl(...)`, `oklch(...)`, named colors.
   * Default `"#fff7e0"`.
   */
  causticColor?: string;
  /** Base intensity for the light shimmer (0–2). Default 0.6. */
  intensity?: number;
  /** Base animation speed (0 pauses, 1 = natural). Default 0.5. */
  speed?: number;
  /** Fraction of the card affected by caustics, along `direction` (0–1). Default 0.5. */
  coverage?: number;
  /** Edge from which the caustics flow toward the opposite edge. Default `"bottom"`. */
  direction?: CausticDirection;
  /** CSS blend mode used by the caustic canvas. Default `"soft-light"`. */
  blendMode?: React.CSSProperties["mixBlendMode"];
  children: React.ReactNode;
}

const MAX_ACTIVE_CARDS = 4;
const activeCards = new Set<number>();
let nextCardId = 1;

const VERT = `#version 300 es
out vec2 vUv;
void main() {
  vec2 p = vec2((gl_VertexID == 1) ? 3.0 : -1.0, (gl_VertexID == 2) ? 3.0 : -1.0);
  vUv = (p + 1.0) * 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 outColor;

uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uTint;
uniform float uIntensity;
uniform float uCoverage;
uniform int uDirection; // 0 bottom · 1 top · 2 left · 3 right · 4 all

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float causticLayer(vec2 uv, float t, float scale) {
  vec2 q = uv * scale;
  float n = noise(q + vec2(t * 0.42, -t * 0.31));
  float wave = sin((q.x + n * 2.8) * 4.7 + t * 1.9) * 0.5 + 0.5;
  float detail = sin((q.y - n * 1.7) * 5.1 - t * 1.3) * 0.5 + 0.5;
  float cell = abs(sin((wave + detail) * 3.14159));
  return pow(1.0 - cell, 8.0);
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2((uv.x - 0.5) * aspect + 0.5, uv.y);
  float t = uTime;

  float c1 = causticLayer(p + vec2(0.0, t * 0.04), t, 6.0);
  float c2 = causticLayer(p + vec2(0.17, -0.11), t * 1.18 + 2.7, 8.5);
  float shimmer = c1 * 0.7 + c2 * 0.5;

  float coverageStart = clamp(1.0 - uCoverage, 0.0, 1.0);
  // Distance-from-the-named-edge coordinate, in [0..1]. 0 = at the named edge.
  float dirCoord;
  if (uDirection == 0) dirCoord = uv.y;            // bottom
  else if (uDirection == 1) dirCoord = 1.0 - uv.y; // top
  else if (uDirection == 2) dirCoord = 1.0 - uv.x; // left
  else if (uDirection == 3) dirCoord = uv.x;       // right
  else                       dirCoord = 0.0;       // all
  float mask  = (uDirection == 4) ? 1.0 : (1.0 - smoothstep(coverageStart, 1.0, dirCoord));
  float boost = (uDirection == 4) ? 1.0 : mix(1.35, 0.55, dirCoord);
  float alpha = shimmer * mask * boost * uIntensity;

  vec3 color = uTint * alpha;
  outColor = vec4(color, clamp(alpha, 0.0, 1.0));
}`;

// Universal CSS color → linear-RGB triplet via a one-off canvas. Accepts hex,
// `rgb()`, `rgba()`, `hsl()`, `oklch()`, named colors — anything the browser
// can parse through `ctx.fillStyle`. Falls back to a warm cream tint if parsing
// fails or if there's no document (SSR).
function colorStringToRgb(input: string): [number, number, number] {
  const fallback: [number, number, number] = [1, 0.968, 0.878];
  const trimmed = input.trim();

  // Fast hex path — avoids a canvas roundtrip for the common case.
  const hexMatch = trimmed.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (hexMatch) {
    const hex = hexMatch[1];
    const full = hex.length === 3 ? hex.split("").map((ch) => ch + ch).join("") : hex;
    const n = parseInt(full, 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }

  if (typeof document === "undefined") return fallback;
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return fallback;
  // Setting fillStyle to a value the browser can't parse is a no-op — by seeding
  // with `#000` first, we can detect parse failure (fillStyle stays "#000000").
  ctx.fillStyle = "#000";
  const seed = ctx.fillStyle as string;
  ctx.fillStyle = trimmed;
  const normalized = ctx.fillStyle as string;
  if (normalized === seed && trimmed.toLowerCase() !== "#000" && trimmed.toLowerCase() !== "black") {
    return fallback;
  }
  if (normalized.startsWith("#")) {
    const n = parseInt(normalized.slice(1), 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }
  const m = normalized.match(/[\d.]+/g);
  if (m && m.length >= 3) {
    return [parseFloat(m[0]) / 255, parseFloat(m[1]) / 255, parseFloat(m[2]) / 255];
  }
  return fallback;
}

const ssrFalse = () => false;
function subscribeReducedTransparency(cb: () => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const mq = window.matchMedia("(prefers-reduced-transparency: reduce)");
  mq.addEventListener?.("change", cb);
  return () => mq.removeEventListener?.("change", cb);
}
function getReducedTransparency(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-transparency: reduce)").matches
    : false;
}

const DIRECTION_INDEX: Record<CausticDirection, number> = {
  bottom: 0,
  top: 1,
  left: 2,
  right: 3,
  all: 4,
};

export const CausticLightCard = React.forwardRef<
  HTMLDivElement,
  CausticLightCardProps
>(function CausticLightCard(
  {
    causticColor = "#fff7e0",
    intensity = 0.6,
    speed = 0.5,
    coverage = 0.5,
    direction = "bottom",
    blendMode = "soft-light",
    className,
    children,
    style,
    onHoverStart,
    onHoverEnd,
    ...rest
  },
  ref,
) {
  const idRef = useRef<number>(nextCardId++);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const reduceMotion = useReducedMotion();
  const reducedTransparency = useSyncExternalStore(
    subscribeReducedTransparency,
    getReducedTransparency,
    ssrFalse,
  );

  const springIntensity = useSpring(intensity, { stiffness: 160, damping: 20 });
  const springSpeed = useSpring(speed, { stiffness: 160, damping: 20 });

  useEffect(() => {
    springIntensity.set(intensity);
  }, [intensity, springIntensity]);

  useEffect(() => {
    springSpeed.set(speed);
  }, [speed, springSpeed]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const cardId = idRef.current;
    const io = new IntersectionObserver(
      ([entry]) => {
        const visible = Boolean(entry?.isIntersecting);
        setIsVisible(visible);
        if (!visible) {
          activeCards.delete(cardId);
          setIsActive(false);
          return;
        }
        if (activeCards.has(cardId) || activeCards.size < MAX_ACTIVE_CARDS) {
          activeCards.add(cardId);
          setIsActive(true);
        } else {
          setIsActive(false);
        }
      },
      { threshold: 0.05 },
    );
    io.observe(container);
    return () => {
      io.disconnect();
      activeCards.delete(cardId);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas || !isVisible || !isActive) return;
    // Skip the GPU pipeline entirely for users who've opted out of translucent /
    // glassmorphic effects at the OS level.
    if (reducedTransparency) return;

    const gl = canvas.getContext("webgl2", {
      antialias: false,
      alpha: true,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
    });
    if (!gl) return;

    const compile = (type: number, source: string): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn(
          "[CausticLightCard] shader compile failed:",
          gl.getShaderInfoLog(shader),
        );
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn(
        "[CausticLightCard] program link failed:",
        gl.getProgramInfoLog(program),
      );
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      return;
    }

    gl.useProgram(program);
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);

    const uResolution = gl.getUniformLocation(program, "uResolution");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uTint = gl.getUniformLocation(program, "uTint");
    const uIntensity = gl.getUniformLocation(program, "uIntensity");
    const uCoverage = gl.getUniformLocation(program, "uCoverage");
    const uDirection = gl.getUniformLocation(program, "uDirection");

    const tint = colorStringToRgb(causticColor);
    gl.uniform3f(uTint, tint[0], tint[1], tint[2]);
    gl.uniform1i(uDirection, DIRECTION_INDEX[direction]);

    let width = 0;
    let height = 0;
    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.floor(rect.width * dpr));
      height = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      gl.viewport(0, 0, width, height);
      gl.uniform2f(uResolution, width, height);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const render = (time: number, frozen: boolean) => {
      const t = frozen ? 3.1 : time;
      gl.uniform1f(uTime, t);
      gl.uniform1f(uIntensity, springIntensity.get());
      gl.uniform1f(uCoverage, Math.max(0, Math.min(1, coverage)));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    let raf = 0;
    let lastTs = performance.now();
    let t = 0;
    if (reduceMotion) {
      render(0, true);
    } else {
      const tick = (ts: number) => {
        const dt = Math.min(64, ts - lastTs) / 1000;
        lastTs = ts;
        t += dt * springSpeed.get();
        render(t, false);
        raf = requestAnimationFrame(tick);
      };
      render(0, false);
      raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (vao) gl.deleteVertexArray(vao);
    };
  }, [
    causticColor,
    coverage,
    direction,
    isActive,
    isVisible,
    reduceMotion,
    reducedTransparency,
    springIntensity,
    springSpeed,
  ]);

  return (
    <motion.div
      ref={(node) => {
        containerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref)
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      className={cn(
        "relative isolate overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#0f1b2d] via-[#12243d] to-[#091427]",
        className,
      )}
      style={style}
      onHoverStart={(event, info) => {
        springIntensity.set(intensity * 1.3);
        springSpeed.set(speed * 1.2);
        onHoverStart?.(event, info);
      }}
      onHoverEnd={(event, info) => {
        springIntensity.set(intensity);
        springSpeed.set(speed);
        onHoverEnd?.(event, info);
      }}
      {...rest}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 h-full w-full [mask-image:linear-gradient(to_top,black_0%,black_65%,transparent_100%)]"
        style={{ mixBlendMode: blendMode }}
      />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-[#0b1730]/65 via-transparent to-transparent" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
});

CausticLightCard.displayName = "CausticLightCard";

export default CausticLightCard;
