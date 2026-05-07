"use client";

import * as React from "react";
import { useEffect, useMemo, useRef } from "react";
import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
} from "motion/react";
import { cn } from "@/lib/utils";

export interface ShaderMeshGradientProps
  extends Omit<HTMLMotionProps<"div">, "onDrag"> {
  /** 3–6 color stops. Accepts hex (`#abcdef`), `rgb()`, `rgba()`, `hsl()`, or `oklch(L C H)`. */
  colors?: string[];
  /** Flow speed multiplier. Default 1.0. */
  speed?: number;
  /** 0 = ignore pointer; 0.4 = subtle pull on the nearest blob. */
  pointerInfluence?: number;
  /** Film grain intensity layered on top. 0 disables. */
  grain?: number;
  /** Overlay content rendered crisply above the canvas. */
  children?: React.ReactNode;
}

/* ─── color parsing → OKLab triplets (uniform-ready) ─────────────────── */

function srgbChannelToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearToOklab(r: number, g: number, b: number): [number, number, number] {
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const lc = Math.cbrt(l);
  const mc = Math.cbrt(m);
  const sc = Math.cbrt(s);
  return [
    0.2104542553 * lc + 0.793617785 * mc - 0.0040720468 * sc,
    1.9779984951 * lc - 2.428592205 * mc + 0.4505937099 * sc,
    0.0259040371 * lc + 0.7827717662 * mc - 0.808675766 * sc,
  ];
}

function oklchToOklab(L: number, C: number, hDeg: number): [number, number, number] {
  const h = (hDeg * Math.PI) / 180;
  return [L, C * Math.cos(h), C * Math.sin(h)];
}

/**
 * Parse any CSS color string the browser understands and return its OKLab
 * triplet. Uses a one-off canvas to normalize through `getContext('2d')`,
 * with a manual `oklch()` parser since canvas in older engines may not
 * resolve oklch (Safari ≥ 16, Chrome ≥ 111 do).
 */
/**
 * CSS values inlined into a `style` attribute aren't sanitized by React —
 * a string containing `)` or `url(` could close the `radial-gradient(...)`
 * call and inject another property (e.g. an attacker-controlled tracking
 * pixel via `url()`). We restrict CSS-fallback stops to a strict allow-list
 * of well-formed color functions; anything outside this set is replaced
 * with a neutral grey. The shader path is unaffected — it consumes
 * pre-parsed OKLab triplets, never the raw string.
 */
const SAFE_CSS_COLOR_RE =
  /^(?:#[0-9a-fA-F]{3,8}|rgba?\([\d.,\s%/]+\)|hsla?\([\d.,\s%deg/]+\)|oklch\([\d.,\s%/]+\))$/;

function safeCssColor(input: string): string {
  const trimmed = input.trim();
  return SAFE_CSS_COLOR_RE.test(trimmed) ? trimmed : "oklch(0.7 0.1 200)";
}

function colorStringToOklab(input: string): [number, number, number] {
  const trimmed = input.trim();

  // Manual oklch parsing — most reliable and skips a canvas roundtrip.
  const oklchMatch = trimmed.match(
    /^oklch\(\s*([\d.]+%?)\s+([\d.]+%?)\s+([\d.]+)(?:deg)?\s*(?:\/\s*[\d.]+%?\s*)?\)$/i,
  );
  if (oklchMatch) {
    const Lraw = oklchMatch[1];
    const Craw = oklchMatch[2];
    const hue = parseFloat(oklchMatch[3]);
    const L = Lraw.endsWith("%") ? parseFloat(Lraw) / 100 : parseFloat(Lraw);
    const C = Craw.endsWith("%") ? (parseFloat(Craw) / 100) * 0.4 : parseFloat(Craw);
    return oklchToOklab(L, C, hue);
  }

  // Fall back to a tiny canvas to normalize whatever the browser will accept.
  if (typeof document !== "undefined") {
    const ctx = document.createElement("canvas").getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#000";
      ctx.fillStyle = trimmed;
      const normalized = ctx.fillStyle as string;

      // Hex.
      if (normalized.startsWith("#")) {
        const hex = normalized.slice(1);
        const full =
          hex.length === 3
            ? hex.split("").map((c) => c + c).join("")
            : hex;
        const v = parseInt(full, 16);
        const r = ((v >> 16) & 255) / 255;
        const g = ((v >> 8) & 255) / 255;
        const b = (v & 255) / 255;
        return linearToOklab(
          srgbChannelToLinear(r),
          srgbChannelToLinear(g),
          srgbChannelToLinear(b),
        );
      }

      // rgb / rgba.
      const rgbMatch = normalized.match(/[\d.]+/g);
      if (rgbMatch && rgbMatch.length >= 3) {
        const r = parseFloat(rgbMatch[0]) / 255;
        const g = parseFloat(rgbMatch[1]) / 255;
        const b = parseFloat(rgbMatch[2]) / 255;
        return linearToOklab(
          srgbChannelToLinear(r),
          srgbChannelToLinear(g),
          srgbChannelToLinear(b),
        );
      }
    }
  }

  return [0.5, 0, 0]; // neutral grey fallback
}

/* ─── runtime detection ──────────────────────────────────────────────── */

type Backend = "webgl2" | "css";

let cachedBackend: Backend | null = null;

function detectBackend(): Backend {
  if (cachedBackend) return cachedBackend;
  if (typeof document === "undefined") return "css";

  // WebGL2 is the render path — the fragment-shader workload is light enough
  // that a parallel WebGPU/WGSL pipeline buys nothing visible. If WebGL2 is
  // unavailable (older Safari without flags, headless, blocklisted GPUs) we
  // fall back to a static CSS radial-gradient stack built from the same stops.
  const probe = document.createElement("canvas");
  const ctx = probe.getContext("webgl2", {
    antialias: false,
    alpha: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
    powerPreference: "default",
  });
  cachedBackend = ctx ? "webgl2" : "css";
  return cachedBackend;
}

/* ─── shader sources ─────────────────────────────────────────────────── */

const VERT = /* glsl */ `#version 300 es
out vec2 vUv;
void main() {
  // Single-triangle full-bleed cover — avoids the seam diagonal of two-tri quads.
  vec2 p = vec2((gl_VertexID == 1) ? 3.0 : -1.0, (gl_VertexID == 2) ? 3.0 : -1.0);
  vUv = (p + 1.0) * 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}`;

const FRAG = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 outColor;

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uMouse;
uniform float uPointerInfluence;
uniform float uGrain;
uniform int uColorCount;
uniform vec3 uColors[6];

vec3 permute(vec3 x){ return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(
    0.211324865405187,
    0.366025403784439,
   -0.577350269189626,
    0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(
    permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0)
  );
  vec3 m = max(0.5 - vec3(
    dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)
  ), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p){
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * snoise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

vec3 oklabToLinear(vec3 c){
  float l_ = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
  float m_ = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
  float s_ = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;
  vec3 lms = vec3(l_*l_*l_, m_*m_*m_, s_*s_*s_);
  return vec3(
    +4.0767416621*lms.x - 3.3077115913*lms.y + 0.2309699292*lms.z,
    -1.2684380046*lms.x + 2.6097574011*lms.y - 0.3413193965*lms.z,
    -0.0041960863*lms.x - 0.7034186147*lms.y + 1.7076147010*lms.z
  );
}

vec3 linearToSrgb(vec3 c){
  c = max(c, vec3(0.0));
  vec3 hi = 1.055 * pow(c, vec3(1.0/2.4)) - 0.055;
  vec3 lo = 12.92 * c;
  return mix(hi, lo, step(c, vec3(0.0031308)));
}

float hash12(vec2 p){
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

void main(){
  vec2 uv = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(uv.x * aspect, uv.y);

  float t = uTime * 0.22;
  vec2 mouseP = vec2(uMouse.x * aspect, uMouse.y);

  // Cursor proximity in normalized space — drives both the local warp boost
  // and (later) the per-blob attraction strength. Smooth radial falloff.
  float dCursor = distance(p, mouseP);
  float cursorMask = exp(-dCursor * 2.2);

  // Domain-warp the sample point with 3-octave fbm so blobs flow continuously
  // rather than rotate. The cursor adds a localized boost so the flow visibly
  // bends toward the pointer without becoming a draggable toy.
  vec2 q = vec2(
    fbm(p * 1.6 + vec2(t * 1.1, -t * 0.7)),
    fbm(p * 1.6 + vec2(-t * 0.6, t * 1.2) + vec2(5.2, 1.3))
  );
  // Secondary octave at a different frequency makes the field feel non-periodic.
  vec2 q2 = vec2(
    fbm(p * 0.7 + q + vec2(t * 0.4, t * 0.3)),
    fbm(p * 0.7 + q + vec2(-t * 0.5, -t * 0.2) + vec2(8.7, 3.1))
  );
  float warpAmp = 0.85 + uPointerInfluence * 0.5 * cursorMask;
  vec2 warped = p + warpAmp * q + 0.35 * q2;

  // Drift centers per blob using disjoint frequency offsets.
  vec3 mixedOklab = vec3(0.0);
  float wsum = 0.0;

  for (int i = 0; i < 6; i++) {
    if (i >= uColorCount) break;
    float fi = float(i);
    vec2 center = vec2(
      0.5 * aspect + 0.42 * aspect * sin(t * (0.55 + 0.13 * fi) + fi * 1.7),
      0.5 + 0.38 * cos(t * (0.48 + 0.11 * fi) + fi * 2.3)
    );

    // Pointer pull on the nearest blob — softer falloff (~1.4 instead of ~3.5)
    // so the effect is visible at typical cursor distances inside the canvas.
    // The strongest blob also gets a chroma boost via its weight.
    float dMouse = distance(center, mouseP);
    float pull = uPointerInfluence * exp(-dMouse * 1.4);
    center = mix(center, mouseP, pull);

    float d = distance(warped, center);
    // Per-blob hover boost: when the cursor is on top of a blob, its weight
    // briefly increases so its color reads more strongly under the cursor.
    float hoverBoost = 1.0 + uPointerInfluence * 1.4 * exp(-dMouse * 2.5);
    float w = hoverBoost / (0.035 + d * d * 4.0);
    mixedOklab += uColors[i] * w;
    wsum += w;
  }

  vec3 oklab = mixedOklab / max(wsum, 1e-4);
  vec3 linear = oklabToLinear(oklab);
  vec3 srgb = linearToSrgb(linear);

  if (uGrain > 0.0) {
    float n = hash12(gl_FragCoord.xy + vec2(uTime * 60.0, -uTime * 31.0));
    srgb += (n - 0.5) * uGrain;
  }

  // GL context is created with premultipliedAlpha:true. With alpha hardcoded
  // to 1.0, premultiplied and straight alpha are mathematically identical,
  // so writing the rgb directly is correct. If anyone later introduces an
  // alpha < 1.0 (e.g. an edge mask), pre-multiply it: vec4(srgb * a, a).
  outColor = vec4(srgb, 1.0);
}`;

/* ─── component ──────────────────────────────────────────────────────── */

const DEFAULT_COLORS = [
  "oklch(0.78 0.16 30)",   // warm coral
  "oklch(0.72 0.17 295)",  // violet
  "oklch(0.70 0.16 220)",  // blue
  "oklch(0.82 0.14 150)",  // mint
];

export const ShaderMeshGradient = React.forwardRef<
  HTMLDivElement,
  ShaderMeshGradientProps
>(function ShaderMeshGradient(
  {
    colors = DEFAULT_COLORS,
    speed = 1,
    pointerInfluence = 0.4,
    grain = 0.04,
    className,
    children,
    style,
    ...rest
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduceMotion = useReducedMotion();

  // Live refs for prop values read inside the RAF loop. Keeping these out of
  // the main effect's deps avoids tearing down the GL program (shader compile,
  // VAO, uniforms) every time a parent re-renders with a new speed/grain/etc.
  const speedRef = useRef(speed);
  const pointerInfluenceRef = useRef(pointerInfluence);
  const grainRef = useRef(grain);
  speedRef.current = speed;
  pointerInfluenceRef.current = pointerInfluence;
  grainRef.current = grain;

  // Stable reference to the OKLab triplets. We re-parse only when the
  // string list changes — colors[] is an array prop so we key on its joined value.
  const colorsKey = colors.join("|");
  const oklabColors = useMemo(() => {
    const stops = colors.slice(0, 6);
    while (stops.length < 3) stops.push("oklch(0.7 0.1 200)"); // 3 minimum
    return stops.map(colorStringToOklab);
    // colors is captured via colorsKey to avoid re-parsing on identity changes only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorsKey]);

  // Static CSS fallback gradient — used when no GPU context is available
  // and as the SSR baseline before mount.
  const cssFallback = useMemo(() => {
    const stops = colors.slice(0, 6);
    if (stops.length === 0) return "";
    const blobs = stops.map((c, i) => {
      const x = 15 + ((i * 137) % 70);
      const y = 20 + ((i * 79) % 60);
      return `radial-gradient(60% 60% at ${x}% ${y}%, ${safeCssColor(c)} 0%, transparent 60%)`;
    });
    return blobs.join(", ");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorsKey]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    if (detectBackend() !== "webgl2") return;

    // alpha:true so the canvas is transparent before the first draw — the
    // wrapper's CSS radial-gradient fallback shows through during the brief
    // gap between mount and first frame, and stays visible if the GL pipeline
    // ever fails to initialize on a remount.
    const gl = canvas.getContext("webgl2", {
      antialias: false,
      alpha: true,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
    });
    if (!gl) return;

    /* compile + link */
    const compile = (type: number, src: string): WebGLShader | null => {
      const sh = gl.createShader(type);
      if (!sh) return null;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        // Surface the error to the console, but don't throw — fall back to CSS.
        console.warn("[ShaderMeshGradient] shader compile failed:", gl.getShaderInfoLog(sh));
        gl.deleteShader(sh);
        return null;
      }
      return sh;
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
      console.warn("[ShaderMeshGradient] program link failed:", gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      return;
    }

    gl.useProgram(program);

    /* WebGL2 core profile requires a bound VAO for drawArrays even when the
       vertex shader uses gl_VertexID with no attributes. Without this Chromium
       silently no-ops the draw call and you see only whatever's behind the
       canvas (in our case, the CSS fallback). */
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    /* uniform locations */
    const uResolution = gl.getUniformLocation(program, "uResolution");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uMouse = gl.getUniformLocation(program, "uMouse");
    const uPointerInfluence = gl.getUniformLocation(program, "uPointerInfluence");
    const uGrain = gl.getUniformLocation(program, "uGrain");
    const uColorCount = gl.getUniformLocation(program, "uColorCount");
    const uColors = gl.getUniformLocation(program, "uColors[0]");

    /* upload color stops once (oklab) — colorCount is also static for this effect */
    const colorBuffer = new Float32Array(6 * 3);
    for (let i = 0; i < oklabColors.length; i++) {
      colorBuffer[i * 3 + 0] = oklabColors[i][0];
      colorBuffer[i * 3 + 1] = oklabColors[i][1];
      colorBuffer[i * 3 + 2] = oklabColors[i][2];
    }
    gl.uniform3fv(uColors, colorBuffer);
    gl.uniform1i(uColorCount, oklabColors.length);

    /* size + DPR cap at 2 to keep mid-range GPUs at 60fps */
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

    /* pointer (normalized 0–1, exponential lerp) */
    const target = { x: 0.5, y: 0.5 };
    const current = { x: 0.5, y: 0.5 };
    const onMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      target.x = (e.clientX - rect.left) / rect.width;
      target.y = 1 - (e.clientY - rect.top) / rect.height;
    };
    const onLeave = () => {
      target.x = 0.5;
      target.y = 0.5;
    };
    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerleave", onLeave);

    /* render loop */
    let raf = 0;
    let lastTs = performance.now();
    let t = 0;
    const renderFrame = () => {
      // Dynamic uniforms read from refs so prop changes don't rebuild the GL pipeline.
      gl.uniform1f(uTime, t);
      gl.uniform2f(uMouse, current.x, current.y);
      gl.uniform1f(uPointerInfluence, pointerInfluenceRef.current);
      gl.uniform1f(uGrain, grainRef.current);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const tick = (ts: number) => {
      const dtMs = Math.min(64, ts - lastTs); // clamp tab-switch jumps
      lastTs = ts;
      const dt = dtMs / 1000;

      // Exponential lerp toward the cursor (no springs — cheap, stable).
      const k = 1 - Math.exp(-dt * 6);
      current.x += (target.x - current.x) * k;
      current.y += (target.y - current.y) * k;

      t += dt * speedRef.current;
      renderFrame();
      raf = requestAnimationFrame(tick);
    };

    // Paint the first frame synchronously so a remount never shows a flash of
    // empty canvas — even if the next RAF tick is a frame away.
    if (reduceMotion) {
      // Single static frame at a curated seed — visually pleasing without motion.
      t = 4.2;
      renderFrame();
    } else {
      renderFrame();
      raf = requestAnimationFrame(tick);
    }

    return () => {
      // cancelAnimationFrame is a spec no-op for unknown ids, so unconditional is safe.
      cancelAnimationFrame(raf);
      ro.disconnect();
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerleave", onLeave);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (vao) gl.deleteVertexArray(vao);
      // NOTE: deliberately not calling WEBGL_lose_context.loseContext() —
      // it leaves the canvas's context permanently lost, so a remount that
      // reuses the canvas (or strict-mode's double-mount in dev) gets a
      // null gl back from getContext. GC reclaims the context once the
      // canvas is detached from the DOM, which is sufficient.
    };
  }, [oklabColors, reduceMotion]);

  return (
    <motion.div
      ref={(node) => {
        containerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      className={cn("relative isolate h-full w-full overflow-hidden", className)}
      style={{
        // The CSS gradient sits underneath as both a fallback and the SSR
        // first paint — the canvas covers it once mounted.
        backgroundImage: cssFallback,
        backgroundColor: "#0b0b10",
        ...style,
      }}
      {...rest}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        className="absolute inset-0 block h-full w-full"
      />
      {children ? (
        // Absolute overlay so children never constrain the wrapper's height.
        // This makes the component work with both `h-[X]` and `min-h-[X]` parents.
        <div className="absolute inset-0 z-10">{children}</div>
      ) : null}
    </motion.div>
  );
});

ShaderMeshGradient.displayName = "ShaderMeshGradient";

export default ShaderMeshGradient;
