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
  type Variants,
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
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

type Ray = {
  angle: number;
  length: number; // fraction of maxRadius
  reveal: number; // 0..1 stagger delay
  phase: number; // twinkle offset
  dots: { p: number; r: number; phase: number }[];
};

/* ------------------------------------------------------------------ *
 * RadialBurst — the canvas background (reusable on its own).
 * ------------------------------------------------------------------ */

export type RadialBurstProps = {
  className?: string;
  /** Palette id. */
  theme?: RadialBurstThemeId;
  /** Ray-count multiplier (0.4–2). */
  density?: number;
};

export function RadialBurst({
  className,
  theme = "night",
  density = 1,
}: RadialBurstProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  // Reveal progress driven by Motion — read inside the canvas rAF loop.
  const progress = useMotionValue(reduced ? 1 : 0);

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
  const renderRef = useRef<() => void>(() => {});

  // Mount reveal animation (Motion).
  useEffect(() => {
    if (reduced) {
      progress.set(1);
      return;
    }
    const controls = animate(progress, 1, {
      duration: 1.7,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [progress, reduced]);

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
      renderRef.current();
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

    const seed = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      originX = w / 2;
      originY = h * 0.99;
      maxRadius = h * 0.94;
      const count = Math.round(
        Math.min(340, Math.max(120, w / 4.8)) *
          Math.min(2, Math.max(0.4, density)),
      );
      const aMin = -0.06 * Math.PI;
      const aMax = 1.06 * Math.PI;
      rays = Array.from({ length: count }, (_, i) => {
        const t = count > 1 ? i / (count - 1) : 0.5;
        const angle = lerp(aMin, aMax, t) + (Math.random() - 0.5) * 0.012;
        // Closeness to vertical → longer rays → a dome silhouette.
        const vert = Math.sin(Math.min(Math.PI, Math.max(0, angle)));
        const length =
          (0.34 + 0.66 * vert) * (0.78 + Math.random() * 0.3) +
          (Math.random() < 0.06 ? 0.12 : 0);
        const dotCount = 1 + Math.floor(Math.random() * 4);
        return {
          angle,
          length: Math.min(1.05, length),
          reveal: (1 - vert) * 0.42 + Math.random() * 0.12,
          phase: Math.random() * Math.PI * 2,
          dots: Array.from({ length: dotCount }, () => ({
            p: 0.2 + Math.random() * 0.8,
            r: 0.6 + Math.random() * 0.9,
            phase: Math.random() * Math.PI * 2,
          })),
        };
      });
    };

    const resize = () => {
      const { clientWidth, clientHeight } = canvas;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(clientWidth * dpr);
      canvas.height = Math.round(clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      if (reduced) renderRef.current();
    };

    const render = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const now = performance.now() / 1000;
      const prog = progress.get();
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

      // Central bloom.
      const bloomR = Math.min(w * 0.22, maxRadius * 0.5) * (0.6 + 0.4 * prog);
      const bloom = ctx.createRadialGradient(
        originX,
        originY,
        0,
        originX,
        originY,
        bloomR,
      );
      bloom.addColorStop(0, rgba(disp.core, dark ? 0.7 : 0.6));
      bloom.addColorStop(0.45, rgba(disp.core, dark ? 0.22 : 0.18));
      bloom.addColorStop(1, rgba(disp.core, 0));
      ctx.fillStyle = bloom;
      ctx.beginPath();
      ctx.arc(originX, originY, bloomR, 0, Math.PI * 2);
      ctx.fill();

      ctx.lineWidth = 0.7;
      ctx.lineCap = "round";

      for (let i = 0; i < rays.length; i++) {
        const ray = rays[i];
        const lp = easeOut(
          Math.min(1, Math.max(0, (prog - ray.reveal) / (1 - 0.54))),
        );
        if (lp <= 0) continue;
        const twinkle = reduced ? 1 : 0.72 + 0.28 * Math.sin(now * 1.4 + ray.phase);
        const dx = Math.cos(ray.angle);
        const dy = -Math.sin(ray.angle);
        const len = ray.length * maxRadius * lp;
        const ex = originX + dx * len;
        const ey = originY + dy * len;

        const grad = ctx.createLinearGradient(originX, originY, ex, ey);
        grad.addColorStop(0, rgba(disp.rayBase, 0.0));
        grad.addColorStop(0.05, rgba(disp.rayBase, 0.98 * twinkle));
        grad.addColorStop(0.4, rgba(disp.rayBase, 0.55 * twinkle));
        grad.addColorStop(1, rgba(disp.rayTip, 0));
        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(ex, ey);
        ctx.stroke();

        // Dots — drift slowly outward for a living "data" feel.
        for (let d = 0; d < ray.dots.length; d++) {
          const dot = ray.dots[d];
          const dp = reduced ? dot.p : (dot.p + now * 0.025) % 1;
          if (dp > lp) continue;
          const px = originX + dx * ray.length * maxRadius * dp;
          const py = originY + dy * ray.length * maxRadius * dp;
          const dtw = reduced ? 1 : 0.5 + 0.5 * Math.sin(now * 2 + dot.phase);
          ctx.fillStyle = rgba(
            lerpRGB(disp.dotBase, disp.dotTip, dp),
            (dark ? 0.85 : 0.9) * (0.4 + 0.6 * dtw) * (1 - dp * 0.35),
          );
          ctx.beginPath();
          ctx.arc(px, py, dot.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalCompositeOperation = "source-over";
    };
    renderRef.current = render;

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    if (reduced) {
      render();
      return () => ro.disconnect();
    }

    const loop = () => {
      render();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [density, progress, reduced]);

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
        aria-haspopup="listbox"
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
            role="listbox"
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
                    role="option"
                    aria-selected={active}
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
 * Count-up stat (Motion-driven).
 * ------------------------------------------------------------------ */

type Stat = {
  prefix?: string;
  value: number;
  decimals?: number;
  suffix?: string;
  label: string;
};

const DEFAULT_STATS: Stat[] = [
  { value: 135, suffix: "+", label: "currencies and payment\nmethods supported" },
  { prefix: "US$", value: 1.9, decimals: 1, suffix: "tn", label: "in payments volume\nprocessed in 2025" },
  { value: 99.999, decimals: 3, suffix: "%", label: "historical uptime\nfor Stripe services" },
  { value: 200, suffix: "M+", label: "active subscriptions\nmanaged on Stripe Billing" },
];

function CountUp({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
}: Stat) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const fmt = (v: number) => {
    const fixed = v.toFixed(decimals);
    const [int, dec] = fixed.split(".");
    const withSep = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${prefix}${dec !== undefined ? `${withSep}.${dec}` : withSep}${suffix}`;
  };

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (reduced) {
      node.textContent = fmt(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        node.textContent = fmt(v);
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, decimals, reduced]);

  return (
    <span ref={ref} className="tabular-nums">
      {fmt(value)}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * RadialBurstHero — full composition.
 * ------------------------------------------------------------------ */

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 140, damping: 20 },
  },
};

export type RadialBurstHeroProps = Omit<
  ComponentProps<"section">,
  "children" | "title"
> & {
  /** Initial theme; also synced if it changes (e.g. from a site toggle). */
  defaultTheme?: RadialBurstThemeId;
  title?: ReactNode;
  stats?: Stat[];
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
  stats = DEFAULT_STATS,
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

      {/* Canvas burst. */}
      <RadialBurst theme={theme} {...burstProps} />

      {/* Theme switcher. */}
      <div className="absolute right-5 top-5 z-20 sm:right-8 sm:top-8">
        <ThemeSwitcher theme={theme} onChange={setTheme} mode={palette.mode} />
      </div>

      {/* Content. */}
      <motion.div
        variants={reduced ? undefined : containerVariants}
        initial={reduced ? false : "hidden"}
        animate={reduced ? undefined : "visible"}
        className="relative z-10 mx-auto flex w-full max-w-5xl flex-col px-6 pt-[12vh]"
      >
        <motion.h1
          variants={reduced ? undefined : itemVariants}
          className="text-center text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl"
        >
          {title}
        </motion.h1>

        <motion.div
          variants={reduced ? undefined : itemVariants}
          className={cn(
            "mt-14 grid grid-cols-2 gap-y-10 border-t pt-10 md:grid-cols-4",
            dark ? "border-white/10" : "border-slate-900/10",
          )}
        >
          {stats.map((stat, i) => (
            <div key={i} className="px-2 text-center md:px-4">
              <div
                className={cn(
                  "text-3xl font-medium tracking-tight sm:text-4xl",
                  i === 0
                    ? dark
                      ? "text-white"
                      : "text-slate-900"
                    : dark
                      ? "text-white/85"
                      : "text-slate-500",
                )}
              >
                <CountUp {...stat} />
              </div>
              <p
                className={cn(
                  "mx-auto mt-2 max-w-[16ch] whitespace-pre-line text-xs leading-relaxed sm:text-sm",
                  dark ? "text-white/45" : "text-slate-500",
                )}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

export default RadialBurstHero;
