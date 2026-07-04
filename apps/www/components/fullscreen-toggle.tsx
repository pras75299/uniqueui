"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Classes applied to a preview frame while it is in "full screen" — a fixed,
 * viewport-filling overlay (not the native Fullscreen API, so the toggle stays
 * visible and the app theme is preserved). Listed last in a `cn(...)` chain so
 * it overrides the frame's normal layout/border/radius via tailwind-merge.
 *
 * Alignment is intentionally NOT baked in here: consumers add it per-frame so
 * regular demos top-align (`items-start`) while background components stretch to
 * fill the viewport (`items-stretch`). See {@link fullscreenAlignClass}.
 */
export const FULLSCREEN_FRAME_CLASS =
  "fixed inset-0 z-[9999] h-screen w-screen overflow-auto rounded-none border-0";

/**
 * Fullscreen cross-axis alignment for a preview frame. Backgrounds fill the
 * whole screen height; every other demo pins to the top and scrolls if taller
 * than the viewport (rather than sitting vertically centred).
 */
export function fullscreenAlignClass(isBackground: boolean) {
  return isBackground ? "items-stretch justify-center" : "items-start justify-center";
}

/**
 * Applied to a frame's inner content wrapper for a background demo in
 * fullscreen. Background demos wrap in a fixed-height (`h-[400px]`) box; this
 * forces that box to fill so the backdrop covers the screen edge-to-edge.
 */
export const FULLSCREEN_FILL_CLASS = "h-full [&>*]:h-full!";

/**
 * Drives a preview's full-screen toggle: open/close state, body-scroll lock,
 * and Escape-to-exit. Shared by the single-demo preview and each variant frame.
 */
export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const toggle = useCallback(() => setIsFullscreen((v) => !v), []);
  const didMountRef = useRef(false);

  useEffect(() => {
    if (!isFullscreen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isFullscreen]);

  // Size-sensitive demos (canvas particle fields, mesh gradients) re-measure
  // only on window "resize". Entering/exiting fullscreen changes their
  // container size without firing one, leaving the canvas at its old
  // dimensions — so nudge them with a synthetic resize after layout settles.
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    const raf = requestAnimationFrame(() => {
      window.dispatchEvent(new Event("resize"));
    });
    return () => cancelAnimationFrame(raf);
  }, [isFullscreen]);

  return { isFullscreen, toggle };
}

/** Floating top-right button that expands/collapses a preview frame. */
export function FullscreenToggle({
  isFullscreen,
  onToggle,
  isDark,
}: {
  isFullscreen: boolean;
  onToggle: () => void;
  isDark: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isFullscreen ? "Exit full screen" : "View full screen"}
      aria-pressed={isFullscreen}
      title={isFullscreen ? "Exit full screen (Esc)" : "View full screen"}
      className={cn(
        "absolute top-3 right-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-lg border backdrop-blur transition-colors",
        isDark
          ? "border-neutral-700/70 bg-neutral-900/70 text-neutral-300 hover:bg-neutral-800 hover:text-white"
          : "border-neutral-300/70 bg-white/70 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
      )}
    >
      {isFullscreen ? (
        <Minimize2 className="h-4 w-4" />
      ) : (
        <Maximize2 className="h-4 w-4" />
      )}
    </button>
  );
}
