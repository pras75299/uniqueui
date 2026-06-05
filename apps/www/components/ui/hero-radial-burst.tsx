"use client";

import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import {
  motion,
  AnimatePresence,
  animate,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import {
  CloudMoon,
  Sunrise,
  Sun,
  SunDim,
  Sunset,
  Moon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ *
 * Themes — a day cycle. Each palette drives the background gradient,
 * the canvas burst colors, and (via `mode`) the text/UI contrast.
 * ------------------------------------------------------------------ */

export type RadialBurstThemeId =
  | "pre-dawn"
  | "sunrise"
  | "daytime"
  | "dusk"
  | "sunset"
  | "night";

type RGB = [number, number, number];

type Palette = {
  mode: "light" | "dark";
  /** CSS background for the section (crossfaded on theme change). */
  bg: string;
  /** Central bloom color. */
  core: RGB;
  /** Streamline color near the origin (bright) … */
  rayBase: RGB;
  /** … fading to this color at the tip. */
  rayTip: RGB;
  /** Dot color near the origin … */
  dotBase: RGB;
  /** … to this color at the tip. */
  dotTip: RGB;
};

type ThemeDef = {
  id: RadialBurstThemeId;
  label: string;
  Icon: LucideIcon;
  palette: Palette;
};

export const RADIAL_BURST_THEMES: ThemeDef[] = [
  {
    id: "pre-dawn",
    label: "Pre-dawn",
    Icon: CloudMoon,
    palette: {
      mode: "dark",
      bg: "radial-gradient(125% 90% at 50% 102%, #3730a3 0%, #221d63 40%, #100e2e 74%, #07061a 100%)",
      core: [165, 180, 252],
      rayBase: [199, 210, 254],
      rayTip: [99, 102, 241],
      dotBase: [199, 210, 254],
      dotTip: [129, 140, 248],
    },
  },
  {
    id: "sunrise",
    label: "Sunrise",
    Icon: Sunrise,
    palette: {
      mode: "light",
      bg: "radial-gradient(125% 92% at 50% 102%, #bfdbfe 0%, #dbeafe 40%, #eff6ff 72%, #f8fafc 100%)",
      core: [147, 197, 253],
      rayBase: [37, 99, 235],
      rayTip: [96, 165, 250],
      dotBase: [29, 78, 216],
      dotTip: [59, 130, 246],
    },
  },
  {
    id: "daytime",
    label: "Daytime",
    Icon: Sun,
    palette: {
      mode: "light",
      bg: "radial-gradient(125% 92% at 50% 102%, #e9d5ff 0%, #f3e8ff 42%, #faf5ff 74%, #fcfcfe 100%)",
      core: [216, 180, 254],
      rayBase: [124, 58, 237],
      rayTip: [219, 39, 119],
      dotBase: [30, 64, 175],
      dotTip: [219, 39, 119],
    },
  },
  {
    id: "dusk",
    label: "Dusk",
    Icon: SunDim,
    palette: {
      mode: "light",
      bg: "radial-gradient(125% 92% at 50% 102%, #c4b5fd 0%, #ddd6fe 42%, #ece9fe 74%, #f6f4ff 100%)",
      core: [167, 139, 250],
      rayBase: [109, 40, 217],
      rayTip: [236, 72, 153],
      dotBase: [76, 29, 149],
      dotTip: [219, 39, 119],
    },
  },
  {
    id: "sunset",
    label: "Sunset",
    Icon: Sunset,
    palette: {
      mode: "light",
      bg: "radial-gradient(125% 92% at 50% 102%, #fed7aa 0%, #fde4cf 38%, #fff3e6 70%, #fffaf4 100%)",
      core: [253, 186, 116],
      rayBase: [244, 63, 94],
      rayTip: [251, 146, 60],
      dotBase: [99, 102, 241],
      dotTip: [236, 72, 153],
    },
  },
  {
    id: "night",
    label: "Night",
    Icon: Moon,
    palette: {
      mode: "dark",
      bg: "radial-gradient(125% 92% at 50% 102%, #4f46e5 0%, #312e81 38%, #1e1b4b 70%, #14132e 100%)",
      core: [224, 231, 255],
      rayBase: [237, 233, 254],
      rayTip: [129, 140, 248],
      dotBase: [224, 231, 255],
      dotTip: [165, 180, 252],
    },
  },
];

const THEME_BY_ID = Object.fromEntries(
  RADIAL_BURST_THEMES.map((t) => [t.id, t]),
) as Record<RadialBurstThemeId, ThemeDef>;

/* ------------------------------------------------------------------ *
 * Small helpers
 * ------------------------------------------------------------------ */

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpRGB = (a: RGB, b: RGB, t: number): RGB => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];
const rgba = (c: RGB, a: number) =>
  `rgba(${c[0] | 0}, ${c[1] | 0}, ${c[2] | 0}, ${a})`;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
/** Wrap an angle into (-π, π]. */
const wrapAngle = (a: number) => {
  let x = a;
  while (x > Math.PI) x -= 2 * Math.PI;
  while (x < -Math.PI) x += 2 * Math.PI;
  return x;
};
/** Distance from point (px,py) to segment (ax,ay)-(bx,by). */
const segDist = (
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
) => {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy || 1;
  const t = clamp(((px - ax) * dx + (py - ay) * dy) / len2, 0, 1);
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
};

/** Horizontal spread multiplier — widens the fan without changing its height. */
const SPREAD_X = 1.3;

/** One fiber: a streamline that grows, holds, extends, fades, then respawns. */
type Ray = {
  angle: number; // base emission angle (radians)
  maxLen: number; // target length as a fraction of maxRadius
  speed: number; // life units per second (→ lifetime ≈ 1/speed)
  life: number; // < 0 staggered delay, 0..1 active
  width: number; // core stroke width
  bright: number; // base brightness 0..1
  phase: number; // twinkle offset
  react: number; // smoothed pointer reaction 0..1
  bend: number; // smoothed angular bend toward the pointer
  hasDot: boolean; // whether a glowing dot rides this fiber's tip
  dotR: number; // tip-dot radius
  dotPhase: number; // tip-dot twinkle offset
};

/* ------------------------------------------------------------------ *
 * RadialBurst — the interactive canvas background (reusable on its own).
 *
 * Fibers stream out of a bottom-center origin in a wide radial fan. Each
 * one continuously grows, slightly over-extends, fades, and regenerates
 * with fresh angle/length/speed/opacity, while glowing dots travel along
 * it. Rays near the pointer brighten, stretch, and bend toward it, then
 * ease back to their drift. The burst stays in the lower band so it never
 * reaches the headline above.
 * ------------------------------------------------------------------ */

export type RadialBurstProps = {
  className?: string;
  /** Palette id. */
  theme?: RadialBurstThemeId;
  /** Ray-count multiplier (0.4–2). */
  density?: number;
  /** Disable pointer reactivity. */
  interactive?: boolean;
};

export function RadialBurst({
  className,
  theme = "night",
  density = 1,
  interactive = true,
}: RadialBurstProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  // Global intro fade, driven by Motion — read inside the canvas rAF loop.
  const intro = useMotionValue(reduced ? 1 : 0);

  // Target palette + a smoothed "displayed" palette so theme switches lerp.
  const targetRef = useRef<Palette>(THEME_BY_ID[theme].palette);
  const dispRef = useRef<{
    core: RGB;
    rayBase: RGB;
    rayTip: RGB;
    dotBase: RGB;
    dotTip: RGB;
  }>({
    core: [...THEME_BY_ID[theme].palette.core] as RGB,
    rayBase: [...THEME_BY_ID[theme].palette.rayBase] as RGB,
    rayTip: [...THEME_BY_ID[theme].palette.rayTip] as RGB,
    dotBase: [...THEME_BY_ID[theme].palette.dotBase] as RGB,
    dotTip: [...THEME_BY_ID[theme].palette.dotTip] as RGB,
  });
  const renderRef = useRef<(dt: number) => void>(() => {});

  // Mount fade-in (Motion).
  useEffect(() => {
    if (reduced) {
      intro.set(1);
      return;
    }
    const controls = animate(intro, 1, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [intro, reduced]);

  // Update the target palette when the theme changes; redraw if static.
  useEffect(() => {
    targetRef.current = THEME_BY_ID[theme].palette;
    if (reduced) {
      const d = dispRef.current;
      const p = targetRef.current;
      d.core = [...p.core] as RGB;
      d.rayBase = [...p.rayBase] as RGB;
      d.rayTip = [...p.rayTip] as RGB;
      d.dotBase = [...p.dotBase] as RGB;
      d.dotTip = [...p.dotTip] as RGB;
      renderRef.current(0);
    }
  }, [theme, reduced]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let rays: Ray[] = [];
    let maxRadius = 0;
    let originX = 0;
    let originY = 0;

    const pointer = { x: 0, y: 0, active: false };

    const respawn = (ray: Ray, initial: boolean) => {
      const aMin = -0.06 * Math.PI;
      const aMax = 1.06 * Math.PI;
      const angle = lerp(aMin, aMax, Math.random()) + (Math.random() - 0.5) * 0.05;
      // Mild bias toward vertical, but side rays stay long so the fan fills
      // the full width along the bottom rather than tapering to a dome.
      const vert = Math.sin(clamp(angle, 0, Math.PI));
      ray.angle = angle;
      ray.maxLen = Math.min(
        1.05,
        (0.8 + 0.2 * vert) * (0.6 + Math.random() * 0.45) +
          (Math.random() < 0.06 ? 0.12 : 0),
      );
      ray.speed = 0.085 + Math.random() * 0.13; // lifetime ≈ 4.5–11.8s
      ray.life = initial ? Math.random() : -Math.random() * 0.6;
      ray.width = 0.55 + Math.random() * 0.5;
      ray.bright = 0.5 + Math.random() * 0.5;
      ray.phase = Math.random() * Math.PI * 2;
      // A single glowing dot sits at the tip — it rides the growing tip, it
      // does not travel along the fiber.
      ray.hasDot = Math.random() < 0.72;
      ray.dotR = 0.8 + Math.random() * 1;
      ray.dotPhase = Math.random() * Math.PI * 2;
    };

    const seed = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      originX = w / 2;
      // Origin sits on the bottom edge so the burst touches the bottom.
      originY = h;
      // Lower-band height — kept well below the headline, ~100px shorter.
      maxRadius = Math.max(h * 0.4, h * 0.6 - 100);
      const count = Math.round(
        Math.min(400, Math.max(220, w / 3.2)) * clamp(density, 0.4, 2),
      );
      rays = Array.from({ length: count }, () => {
        const ray: Ray = {
          angle: 0,
          maxLen: 0,
          speed: 0,
          life: 0,
          width: 1,
          bright: 1,
          phase: 0,
          react: 0,
          bend: 0,
          hasDot: false,
          dotR: 1,
          dotPhase: 0,
        };
        respawn(ray, true);
        return ray;
      });
    };

    const resize = () => {
      const { clientWidth, clientHeight } = canvas;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(clientWidth * dpr);
      canvas.height = Math.round(clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      if (reduced) renderRef.current(0);
    };

    const render = (dt: number) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const now = performance.now() / 1000;
      const introA = intro.get();
      const disp = dispRef.current;
      const target = targetRef.current;

      // Ease displayed colors toward the target palette (theme crossfade).
      const k = reduced ? 1 : 0.08;
      disp.core = lerpRGB(disp.core, target.core, k);
      disp.rayBase = lerpRGB(disp.rayBase, target.rayBase, k);
      disp.rayTip = lerpRGB(disp.rayTip, target.rayTip, k);
      disp.dotBase = lerpRGB(disp.dotBase, target.dotBase, k);
      disp.dotTip = lerpRGB(disp.dotTip, target.dotTip, k);

      ctx.clearRect(0, 0, w, h);
      const dark = target.mode === "dark";
      // Dark themes glow additively; light themes paint normally.
      ctx.globalCompositeOperation = dark ? "lighter" : "source-over";
      ctx.lineCap = "round";

      // Central bloom — a soft, diffuse glow rather than a hard bright disc.
      const bloomR =
        Math.min(w * 0.22, maxRadius * 0.6) * (0.7 + 0.3 * introA);
      const bloom = ctx.createRadialGradient(
        originX,
        originY,
        0,
        originX,
        originY,
        bloomR,
      );
      bloom.addColorStop(0, rgba(disp.core, (dark ? 0.5 : 0.44) * introA));
      bloom.addColorStop(0.3, rgba(disp.core, (dark ? 0.18 : 0.15) * introA));
      bloom.addColorStop(0.65, rgba(disp.core, (dark ? 0.06 : 0.05) * introA));
      bloom.addColorStop(1, rgba(disp.core, 0));
      ctx.fillStyle = bloom;
      ctx.beginPath();
      ctx.arc(originX, originY, bloomR, 0, Math.PI * 2);
      ctx.fill();

      const pointerOn = interactive && !reduced && pointer.active;
      const reactR = 170; // px radius of pointer influence
      // No reaction near the origin — only the middle/tip of fibers respond.
      const originGuard = maxRadius * 0.22;
      const pointerNearOrigin =
        Math.hypot(pointer.x - originX, pointer.y - originY) < originGuard;

      for (let i = 0; i < rays.length; i++) {
        const ray = rays[i];

        if (!reduced) {
          ray.life += ray.speed * dt;
          if (ray.life >= 1) respawn(ray, false);
        }
        if (ray.life < 0) continue;

        const life = reduced ? 0.62 : ray.life;
        const growT = clamp(life / 0.7, 0, 1);
        const lenFrac = easeOut(growT);
        const extend = life > 0.7 ? (life - 0.7) / 0.3 : 0;
        const env = reduced
          ? 1
          : Math.min(1, life / 0.12) *
            (life > 0.8 ? clamp(1 - (life - 0.8) / 0.2, 0, 1) : 1);
        if (env <= 0) continue;

        const baseLen =
          ray.maxLen * maxRadius * lenFrac * (1 + 0.06 * extend);

        // Pointer reaction — engage quickly, return slowly. Hit-test only the
        // outer 35%→tip span so the dense near-origin zone stays calm.
        if (pointerOn && !pointerNearOrigin) {
          const cx = Math.cos(ray.angle) * SPREAD_X;
          const cy = -Math.sin(ray.angle);
          const ix = originX + cx * baseLen * 0.35;
          const iy = originY + cy * baseLen * 0.35;
          const bx = originX + cx * baseLen;
          const by = originY + cy * baseLen;
          const d = segDist(pointer.x, pointer.y, ix, iy, bx, by);
          let reactTarget = 0;
          let bendTarget = 0;
          if (d < reactR) {
            reactTarget = 1 - d / reactR;
            reactTarget *= reactTarget;
            const pAng = Math.atan2(
              -(pointer.y - originY),
              (pointer.x - originX) / SPREAD_X,
            );
            bendTarget = clamp(wrapAngle(pAng - ray.angle), -0.4, 0.4);
          }
          ray.react +=
            (reactTarget - ray.react) * (reactTarget > ray.react ? 0.14 : 0.06);
          ray.bend += (bendTarget * ray.react - ray.bend) * 0.1;
        } else if (ray.react !== 0 || ray.bend !== 0) {
          ray.react += -ray.react * 0.06;
          ray.bend += -ray.bend * 0.1;
        }

        const react = ray.react;
        const drawAngle = ray.angle + ray.bend;
        const dirx = Math.cos(drawAngle) * SPREAD_X;
        const diry = -Math.sin(drawAngle);
        const effLen = baseLen * (1 + 0.12 * react);
        const ex = originX + dirx * effLen;
        const ey = originY + diry * effLen;

        const twinkle = reduced ? 1 : 0.82 + 0.18 * Math.sin(now * 1.3 + ray.phase);
        const aBase = clamp(
          env * introA * ray.bright * twinkle * (1 + 0.9 * react),
          0,
          1,
        );

        // Brightness builds up *along* the fiber: near-zero through the dense
        // convergence zone at the origin (so overlapping starts don't blow out
        // to white), peaking once the fibers have fanned apart, fading at the tip.
        const grad = ctx.createLinearGradient(originX, originY, ex, ey);
        grad.addColorStop(0, rgba(disp.rayBase, 0));
        grad.addColorStop(0.16, rgba(disp.rayBase, 0.22 * aBase));
        grad.addColorStop(0.4, rgba(disp.rayBase, 0.85 * aBase));
        grad.addColorStop(0.75, rgba(disp.rayBase, 0.36 * aBase));
        grad.addColorStop(1, rgba(disp.rayTip, 0));
        ctx.strokeStyle = grad;

        // Soft wide pass → subtle blur/glow.
        ctx.lineWidth = ray.width * (dark ? 3.2 : 2.6);
        ctx.globalAlpha = dark ? 0.22 : 0.18;
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(ex, ey);
        ctx.stroke();

        // Crisp core pass.
        ctx.lineWidth = ray.width;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(ex, ey);
        ctx.stroke();

        // A single glowing dot sits at the very tip — it rides the growing
        // tip but never travels along the fiber.
        if (ray.hasDot) {
          const dtw = reduced ? 1 : 0.5 + 0.5 * Math.sin(now * 2 + ray.dotPhase);
          // Dim dots whose tip still sits inside the convergence zone.
          const tipFade = clamp(effLen / (maxRadius * 0.28), 0, 1);
          ctx.fillStyle = rgba(
            disp.dotTip,
            clamp(
              env * introA * tipFade * (dark ? 0.95 : 1) * (0.45 + 0.55 * dtw) *
                (1 + 0.6 * react),
              0,
              1,
            ),
          );
          ctx.beginPath();
          ctx.arc(ex, ey, ray.dotR * (1 + 0.4 * react), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };
    renderRef.current = render;

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    if (reduced) {
      render(0);
      return () => ro.disconnect();
    }

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        pointer.active = false;
        return;
      }
      pointer.x = x;
      pointer.y = y;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };
    if (interactive) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("blur", onLeave);
    }

    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      render(dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      if (interactive) {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("blur", onLeave);
      }
    };
  }, [density, intro, reduced, interactive]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("absolute inset-0 h-full w-full", className)}
    />
  );
}

/* ------------------------------------------------------------------ *
 * ThemeSwitcher — the corner dropdown.
 * ------------------------------------------------------------------ */

function ThemeSwitcher({
  theme,
  onChange,
  mode,
}: {
  theme: RadialBurstThemeId;
  onChange: (id: RadialBurstThemeId) => void;
  mode: "light" | "dark";
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const Current = THEME_BY_ID[theme].Icon;
  const dark = mode === "dark";

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={`Theme: ${THEME_BY_ID[theme].label}. Change theme`}
        className={cn(
          "inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border backdrop-blur transition-colors",
          dark
            ? "border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
            : "border-slate-900/10 bg-white/70 text-slate-600 hover:bg-white",
        )}
      >
        <Current className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            aria-label="Theme"
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            style={{ transformOrigin: "top right" }}
            className={cn(
              "absolute right-0 top-11 z-30 w-40 overflow-hidden rounded-xl border p-1 shadow-xl backdrop-blur-md",
              dark
                ? "border-white/10 bg-[#1b1842]/90 text-white/80"
                : "border-slate-900/10 bg-white/90 text-slate-700",
            )}
          >
            {RADIAL_BURST_THEMES.map((t) => {
              const active = t.id === theme;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    aria-current={active}
                    onClick={() => {
                      onChange(t.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors",
                      active
                        ? dark
                          ? "bg-white/10 text-white"
                          : "bg-slate-900/5 text-slate-900"
                        : dark
                          ? "hover:bg-white/5"
                          : "hover:bg-slate-900/5",
                    )}
                  >
                    <t.Icon className="h-4 w-4 shrink-0 opacity-80" />
                    {t.label}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * RadialBurstHero — full composition: headline over the interactive burst.
 * ------------------------------------------------------------------ */

export type RadialBurstHeroProps = Omit<
  ComponentProps<"section">,
  "children" | "title"
> & {
  /** Initial theme; also synced if it changes (e.g. from a site toggle). */
  defaultTheme?: RadialBurstThemeId;
  title?: ReactNode;
  burstProps?: Omit<RadialBurstProps, "theme">;
};

export function RadialBurstHero({
  className,
  defaultTheme = "night",
  title = (
    <>
      The backbone
      <br />
      of global commerce
    </>
  ),
  burstProps,
  ...rest
}: RadialBurstHeroProps) {
  const [theme, setTheme] = useState<RadialBurstThemeId>(defaultTheme);
  const reduced = useReducedMotion();

  // Keep in sync if the consumer (or docs theme toggle) changes defaultTheme.
  useEffect(() => {
    setTheme(defaultTheme);
  }, [defaultTheme]);

  const palette = THEME_BY_ID[theme].palette;
  const dark = palette.mode === "dark";

  return (
    <section
      {...rest}
      data-theme={theme}
      className={cn(
        "relative isolate flex min-h-[100svh] w-full flex-col overflow-hidden",
        dark ? "text-white" : "text-slate-900",
        className,
      )}
    >
      {/* Background gradient — crossfades between themes. */}
      <AnimatePresence initial={false}>
        <motion.div
          key={theme}
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute inset-0 -z-10"
          style={{ background: palette.bg }}
        />
      </AnimatePresence>

      {/* Interactive burst — masked so it fades out below the headline. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, transparent 24%, #000 48%, #000 100%)",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, transparent 24%, #000 48%, #000 100%)",
        }}
      >
        <RadialBurst theme={theme} {...burstProps} />
      </div>

      {/* Theme switcher. */}
      <div className="absolute right-5 top-5 z-20 sm:right-8 sm:top-8">
        <ThemeSwitcher theme={theme} onChange={setTheme} mode={palette.mode} />
      </div>

      {/* Headline. */}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col px-6 pt-[14vh]">
        <motion.h1
          initial={reduced ? false : { opacity: 0, y: 18 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 140, damping: 20, delay: 0.1 }}
          className="text-center text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl"
        >
          {title}
        </motion.h1>
      </div>
    </section>
  );
}

export default RadialBurstHero;
