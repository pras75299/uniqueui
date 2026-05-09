"use client";

import * as React from "react";
import { useMemo, useRef, useSyncExternalStore } from "react";
import {
  motion,
  useReducedMotion,
  useSpring,
  type HTMLMotionProps,
} from "motion/react";
import { cn } from "@/lib/utils";

export type IridescentFoilVariant =
  | "default"
  | "subtle"
  | "vivid"
  | "light"
  | "outline";

export type IridescentFoilSize = "sm" | "md" | "lg";

export interface IridescentFoilButtonProps
  extends Omit<HTMLMotionProps<"button">, "onDrag"> {
  variant?: IridescentFoilVariant;
  size?: IridescentFoilSize;
  /** 0–0.2. Layered noise texture opacity. Default 0.05. */
  grainOpacity?: number;
  /** Cursor-driven hue rotation range, in degrees. Default 120. */
  hueRange?: number;
  /** Optional element rendered before the children (e.g. an icon). */
  leftSlot?: React.ReactNode;
  /** Optional element rendered after the children (e.g. an icon). */
  rightSlot?: React.ReactNode;
  /**
   * When `true`, replaces the children with a spinner, disables the click,
   * sets `aria-busy`, and freezes the foil sheen. Default `false`.
   */
  loading?: boolean;
  /**
   * Disables the GPU-heavy foil + grain layers (keeps the base + a static
   * highlight). When omitted, auto-enables on coarse pointers and when
   * `prefers-reduced-transparency: reduce` is set.
   */
  lowPower?: boolean;
  children: React.ReactNode;
}

const GRAIN_TEXTURE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='120' height='120' filter='url(%23n)' opacity='1'/></svg>";

interface VariantStyle {
  base: string;
  foil: string;
  text: string;
  ring: string;
}

const VARIANT_STYLES: Record<IridescentFoilVariant, VariantStyle> = {
  default: {
    base: "from-[#3a4b76] via-[#243459] to-[#1b2742]",
    foil: "from-fuchsia-400 via-cyan-300 to-violet-300",
    text: "text-white",
    ring: "focus-visible:outline-cyan-200",
  },
  subtle: {
    base: "from-[#374061] via-[#2b3352] to-[#232b44]",
    foil: "from-fuchsia-300/80 via-cyan-200/80 to-blue-200/80",
    text: "text-white",
    ring: "focus-visible:outline-cyan-300",
  },
  vivid: {
    base: "from-[#3d2f78] via-[#233b7a] to-[#0f3f6c]",
    foil: "from-pink-300 via-cyan-200 to-yellow-200",
    text: "text-white",
    ring: "focus-visible:outline-pink-300",
  },
  light: {
    base: "from-[#f4f5fa] via-[#e9ebf3] to-[#dfe2ed]",
    foil: "from-fuchsia-300/70 via-sky-300/70 to-violet-300/70",
    text: "text-neutral-900",
    ring: "focus-visible:outline-violet-500",
  },
  outline: {
    base: "from-transparent via-transparent to-transparent",
    foil: "from-fuchsia-400/70 via-cyan-300/70 to-violet-300/70",
    text: "text-foreground",
    ring: "focus-visible:outline-violet-400",
  },
};

const SIZE_STYLES: Record<IridescentFoilSize, string> = {
  sm: "px-3.5 py-1.5 text-xs rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-6 py-3 text-base rounded-xl",
};

// useSyncExternalStore-based matchMedia subscriptions. SSR-safe (always returns
// false on the server) and lint-clean — no setState in effects.
const ssrFalse = () => false;

function makeMediaQueryHook(query: string) {
  const get = (): boolean =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia(query).matches
      : false;

  const subscribe = (cb: () => void): (() => void) => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return () => {};
    }
    const mq = window.matchMedia(query);
    mq.addEventListener?.("change", cb);
    return () => mq.removeEventListener?.("change", cb);
  };

  return () => useSyncExternalStore(subscribe, get, ssrFalse);
}

const useReducedTransparency = makeMediaQueryHook(
  "(prefers-reduced-transparency: reduce)",
);
const useCoarsePointer = makeMediaQueryHook("(pointer: coarse)");

export const IridescentFoilButton = React.forwardRef<
  HTMLButtonElement,
  IridescentFoilButtonProps
>(function IridescentFoilButton(
  {
    variant = "default",
    size = "md",
    grainOpacity = 0.05,
    hueRange = 120,
    leftSlot,
    rightSlot,
    loading = false,
    lowPower,
    className,
    children,
    disabled,
    onPointerMove,
    onPointerLeave,
    ...rest
  },
  ref,
) {
  const localRef = useRef<HTMLButtonElement | null>(null);
  const reduceMotion = useReducedMotion();
  const reducedTransparency = useReducedTransparency();
  const coarse = useCoarsePointer();
  const scale = useSpring(1, { stiffness: 300, damping: 22 });

  // Auto-detect lowPower unless the prop is explicitly set.
  const isLowPower = lowPower ?? (coarse || reducedTransparency);
  const isDisabled = disabled || loading;

  const clampedGrain = Math.min(0.2, Math.max(0, grainOpacity));
  const clampedHueRange = Math.max(0, hueRange);
  const style = VARIANT_STYLES[variant];

  const initialVars = useMemo(
    () =>
      ({
        "--foil-angle": "135deg",
        "--foil-hue": "0deg",
        "--foil-x": "50%",
        "--foil-y": "50%",
      }) as React.CSSProperties,
    [],
  );

  const setButtonRef = (node: HTMLButtonElement | null) => {
    localRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref)
      (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
  };

  return (
    <motion.button
      ref={setButtonRef}
      type="button"
      disabled={isDisabled}
      aria-busy={loading || undefined}
      style={{ scale, ...initialVars }}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 overflow-hidden border border-white/20 font-semibold shadow-[0_10px_24px_-12px_rgba(0,0,0,0.45)]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        "active:translate-y-px",
        "disabled:cursor-not-allowed disabled:opacity-55",
        SIZE_STYLES[size],
        style.text,
        style.ring,
        loading && "cursor-wait",
        // outline variant has no border ring of its own — give it a hairline.
        variant === "outline" && "border-current/30",
        className,
      )}
      onHoverStart={() => {
        if (!reduceMotion && !isDisabled) scale.set(1.02);
      }}
      onHoverEnd={() => scale.set(1)}
      onTapStart={() => {
        if (!isDisabled) scale.set(0.98);
      }}
      onTapCancel={() => scale.set(1)}
      onTap={() => scale.set(1)}
      onPointerMove={(event) => {
        const node = localRef.current;
        if (!node || isDisabled || isLowPower) {
          onPointerMove?.(event);
          return;
        }
        const rect = node.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        const nx = x * 2 - 1;
        const ny = y * 2 - 1;

        const angle = Math.atan2(ny, nx) * (180 / Math.PI);
        const hue = (nx * 0.65 - ny * 0.35) * clampedHueRange;

        node.style.setProperty("--foil-angle", `${angle}deg`);
        node.style.setProperty("--foil-hue", `${hue}deg`);
        node.style.setProperty("--foil-x", `${(x * 100).toFixed(1)}%`);
        node.style.setProperty("--foil-y", `${(y * 100).toFixed(1)}%`);

        onPointerMove?.(event);
      }}
      onPointerLeave={(event) => {
        const node = localRef.current;
        if (node) {
          node.style.setProperty("--foil-angle", "135deg");
          node.style.setProperty("--foil-hue", "0deg");
          node.style.setProperty("--foil-x", "50%");
          node.style.setProperty("--foil-y", "50%");
        }
        onPointerLeave?.(event);
      }}
      {...rest}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br",
          style.base,
        )}
      />

      {!isLowPower ? (
        <>
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 opacity-80 transition-opacity duration-200 group-hover:opacity-95",
              "bg-[conic-gradient(from_var(--foil-angle)_at_var(--foil-x)_var(--foil-y),rgba(255,255,255,0.08),rgba(255,255,255,0.36),rgba(255,255,255,0.06),rgba(255,255,255,0.3),rgba(255,255,255,0.08))]",
              "mix-blend-screen",
              style.foil,
              loading && "[animation-play-state:paused]",
            )}
            style={{
              filter:
                "hue-rotate(var(--foil-hue)) saturate(1.25) brightness(1.08)",
            }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 mix-blend-soft-light"
            style={{
              backgroundImage: `url("${GRAIN_TEXTURE}")`,
              opacity: clampedGrain,
              backgroundSize: "120px 120px",
            }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_var(--foil-x)_var(--foil-y),rgba(255,255,255,0.25),transparent_62%)] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          />
        </>
      ) : (
        // Static highlight for low-power mode — preserves brand presence without
        // running the conic + grain + hue-rotate stack on every pointer move.
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 opacity-70 bg-gradient-to-br mix-blend-screen",
            style.foil,
          )}
        />
      )}

      {loading ? (
        <>
          <span
            aria-hidden
            className="relative z-10 inline-flex h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
          <span className="sr-only">Loading</span>
        </>
      ) : (
        <>
          {leftSlot ? (
            <span aria-hidden className="relative z-10 inline-flex shrink-0">
              {leftSlot}
            </span>
          ) : null}
          <span className="relative z-10">{children}</span>
          {rightSlot ? (
            <span aria-hidden className="relative z-10 inline-flex shrink-0">
              {rightSlot}
            </span>
          ) : null}
        </>
      )}
    </motion.button>
  );
});

IridescentFoilButton.displayName = "IridescentFoilButton";

export default IridescentFoilButton;
