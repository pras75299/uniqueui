"use client";

import * as React from "react";
import { useMemo, useRef } from "react";
import {
  motion,
  useReducedMotion,
  useSpring,
  type HTMLMotionProps,
} from "motion/react";
import { cn } from "@/lib/utils";

export interface IridescentFoilButtonProps
  extends Omit<HTMLMotionProps<"button">, "onDrag"> {
  variant?: "default" | "subtle" | "vivid";
  grainOpacity?: number;
  hueRange?: number;
  children: React.ReactNode;
}

const GRAIN_TEXTURE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='120' height='120' filter='url(%23n)' opacity='1'/></svg>";

const VARIANT_STYLES: Record<
  NonNullable<IridescentFoilButtonProps["variant"]>,
  { base: string; foil: string; text: string }
> = {
  default: {
    base: "from-[#3a4b76] via-[#243459] to-[#1b2742]",
    foil: "from-fuchsia-400 via-cyan-300 to-violet-300",
    text: "text-white",
  },
  subtle: {
    base: "from-[#374061] via-[#2b3352] to-[#232b44]",
    foil: "from-fuchsia-300/80 via-cyan-200/80 to-blue-200/80",
    text: "text-white",
  },
  vivid: {
    base: "from-[#3d2f78] via-[#233b7a] to-[#0f3f6c]",
    foil: "from-pink-300 via-cyan-200 to-yellow-200",
    text: "text-white",
  },
};

export const IridescentFoilButton = React.forwardRef<
  HTMLButtonElement,
  IridescentFoilButtonProps
>(function IridescentFoilButton(
  {
    variant = "default",
    grainOpacity = 0.05,
    hueRange = 120,
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
  const scale = useSpring(1, { stiffness: 300, damping: 22 });

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
    else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
  };

  return (
    <motion.button
      ref={setButtonRef}
      disabled={disabled}
      style={{ scale, ...initialVars }}
      className={cn(
        "group relative inline-flex items-center justify-center overflow-hidden rounded-xl border border-white/20 px-5 py-2.5 text-sm font-semibold shadow-[0_10px_24px_-12px_rgba(0,0,0,0.45)]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200",
        "disabled:cursor-not-allowed disabled:opacity-55",
        style.text,
        className,
      )}
      onHoverStart={() => {
        if (!reduceMotion && !disabled) scale.set(1.02);
      }}
      onHoverEnd={() => scale.set(1)}
      onTapStart={() => {
        if (!disabled) scale.set(0.98);
      }}
      onTapCancel={() => scale.set(1)}
      onTap={() => scale.set(1)}
      onPointerMove={(event) => {
        const node = localRef.current;
        if (!node || disabled) {
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
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 opacity-80 transition-opacity duration-200 group-hover:opacity-95",
          "bg-[conic-gradient(from_var(--foil-angle)_at_var(--foil-x)_var(--foil-y),rgba(255,255,255,0.08),rgba(255,255,255,0.36),rgba(255,255,255,0.06),rgba(255,255,255,0.3),rgba(255,255,255,0.08))]",
          "mix-blend-screen",
          style.foil,
        )}
        style={{
          filter: "hue-rotate(var(--foil-hue)) saturate(1.25) brightness(1.08)",
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
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
});

IridescentFoilButton.displayName = "IridescentFoilButton";

export default IridescentFoilButton;
