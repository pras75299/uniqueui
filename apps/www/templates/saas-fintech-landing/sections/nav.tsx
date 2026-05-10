"use client";

import { motion, useReducedMotion, useScroll, useMotionValueEvent } from "motion/react";
import { useState } from "react";
import { Sun, Moon } from "lucide-react";
import type { FintechThemeTokens } from "../components/theme";
import { useTheme } from "@/contexts/theme-context";
import { cn } from "@/lib/utils";

const links: { label: string; href: string }[] = [
  { label: "Markets", href: "#markets" },
  { label: "Strategy", href: "#strategy" },
  { label: "Research", href: "#research" },
  { label: "Connect", href: "#connect" },
];

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/**
 * Liquid-glass wordmark: ink color when scrolled (over paper), paper
 * color when transparent (over the hero photo).
 */
function Wordmark({ light, tokens }: { light: boolean; tokens: FintechThemeTokens }) {
  return (
    <span
      className={cn(
        "select-none text-[18px] font-light tracking-[-0.02em] font-[var(--font-serif)]",
        "transition-colors duration-300",
        light ? "text-[#F4F1E8]" : tokens.text,
      )}
    >
      Bayard<span className="opacity-50">.</span>
    </span>
  );
}

export default function Nav({ tokens }: { tokens: FintechThemeTokens }) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  /**
   * Threshold is small (24px) — any meaningful scroll triggers the
   * morph. The pill then floats over whatever is beneath: hero photo
   * (dark) or paper body (light). The glass adapts via theme tokens.
   */
  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 24);
  });

  // Render: light = transparent state (text reads on dark photo)
  const light = !scrolled;

  return (
    <motion.header
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE_OUT }}
      className="pointer-events-none fixed inset-x-0 top-12 z-40 px-2 sm:px-4"
    >
      {/*
        Outer wrapper enables centered max-width transition. Inner pill
        animates: maxWidth (full → 760), margin-top (0 → 12px), padding,
        radius (0 → 9999), and visual properties (bg, border, blur,
        shadow) via CSS for a soft simultaneous fade.
      */}
      <motion.div
        layout="position"
        initial={false}
        animate={
          reduceMotion
            ? { maxWidth: scrolled ? 760 : 1200 }
            : {
                maxWidth: scrolled ? 760 : 1200,
                marginTop: scrolled ? 10 : 0,
                paddingLeft: scrolled ? 18 : 20,
                paddingRight: scrolled ? 8 : 20,
                borderRadius: scrolled ? 9999 : 0,
              }
        }
        transition={{
          duration: reduceMotion ? 0 : 0.5,
          ease: EASE_OUT,
        }}
        className={cn(
          "pointer-events-auto relative mx-auto flex h-14 items-center justify-between",
          "[transition-property:background-color,border-color,box-shadow,backdrop-filter] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
          scrolled
            ? cn(
                "border backdrop-blur-2xl backdrop-saturate-150",
                isDark
                  ? "border-white/[0.08] bg-black/40 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.55)]"
                  : "border-black/[0.06] bg-white/55 shadow-[0_8px_32px_-8px_rgba(20,20,20,0.18)]",
              )
            : "border border-transparent bg-transparent shadow-none",
        )}
      >
        {/*
          Liquid-glass top highlight — a thin gradient ribbon along the
          inner top edge, only visible in pill mode. Mimics the specular
          band on Apple-style glass surfaces.
        */}
        {scrolled && (
          <motion.span
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className={cn(
              "pointer-events-none absolute inset-x-3 top-px h-px",
              isDark
                ? "bg-gradient-to-r from-transparent via-white/15 to-transparent"
                : "bg-gradient-to-r from-transparent via-white/80 to-transparent",
            )}
          />
        )}

        <Wordmark light={light} tokens={tokens} />

        <nav className="hidden items-center gap-9 md:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={cn(
                "text-[11px] font-medium uppercase tracking-[0.18em] transition-colors duration-300",
                light
                  ? "text-[#F4F1E8]/75 hover:text-[#F4F1E8]"
                  : cn(tokens.textMuted, "hover:text-current"),
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border",
              "[transition-property:transform,background-color,border-color,color] duration-200 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)]",
              "active:scale-[0.94]",
              light
                ? "border-white/40 text-[#F4F1E8] hover:bg-white/10"
                : cn(
                    tokens.outlinedBorder,
                    tokens.text,
                    isDark ? "hover:bg-[#13110D]" : "hover:bg-[#F1EEE6]",
                  ),
            )}
          >
            <motion.span
              key={isDark ? "moon" : "sun"}
              initial={reduceMotion ? { opacity: 1, rotate: 0 } : { rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
              className="flex"
            >
              {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
            </motion.span>
          </button>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className={cn(
              "hidden text-[12px] font-medium transition-colors duration-300 sm:inline-block",
              light ? "text-[#F4F1E8] hover:text-white" : tokens.text,
            )}
          >
            Login
          </a>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className={cn(
              "inline-flex h-9 items-center rounded-full px-5 text-[12px] font-medium",
              "[transition-property:transform,background-color,color] duration-200 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)]",
              "active:scale-[0.97]",
              light
                ? "bg-[#F4F1E8] text-[#0A0A0A] hover:bg-white"
                : cn(tokens.primaryBg, tokens.primaryFg),
            )}
          >
            Open account
          </a>
        </div>
      </motion.div>
    </motion.header>
  );
}
