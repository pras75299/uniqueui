"use client";

import { motion } from "motion/react";
import { Sun, Moon } from "lucide-react";
import type { FintechThemeTokens } from "../components/theme";
import { useTheme } from "@/contexts/theme-context";
import { cn } from "@/lib/utils";

const links = ["Home", "How it works", "Services", "Connect"];

function BrandMark({ isDark }: { isDark: boolean }) {
  return (
    <div
      className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
      style={{
        background: isDark
          ? "radial-gradient(circle at 30% 30%, #2A2218, #0F1116 70%)"
          : "radial-gradient(circle at 30% 30%, #FFF6CF, #F2E6A6 65%, #E5D77F)",
        boxShadow: isDark
          ? "inset 0 0 0 1px rgba(255,255,255,0.06)"
          : "inset 0 0 0 1px rgba(11,13,18,0.05)",
      }}
      aria-hidden
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M3.5 12.5V3.5h3.2c1.7 0 2.7.85 2.7 2.2 0 1-.55 1.7-1.45 1.95v.05c1.15.2 1.85 1 1.85 2.1 0 1.55-1.2 2.7-3.05 2.7H3.5Zm1.55-5.4h1.4c.85 0 1.4-.4 1.4-1.1s-.5-1.05-1.35-1.05H5.05V7.1Zm0 4.05h1.5c1 0 1.55-.4 1.55-1.15 0-.7-.55-1.15-1.5-1.15H5.05v2.3Z"
          fill={isDark ? "#FFF6CF" : "#0B0D12"}
        />
      </svg>
    </div>
  );
}

export default function Nav({ tokens }: { tokens: FintechThemeTokens }) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      className={cn(
        "sticky top-12 z-40 backdrop-blur-md",
        isDark ? "bg-[#0A0B0F]/85" : "bg-white/85",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <BrandMark isDark={isDark} />

        <nav className="hidden items-center gap-9 md:flex">
          {links.map((link, i) => (
            <a
              key={link}
              href="#"
              onClick={(e) => e.preventDefault()}
              className={cn(
                "text-[13px] transition-colors hover:text-current",
                i === 0 ? tokens.text : tokens.textMuted,
              )}
            >
              {link}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
              tokens.outlinedBorder,
              isDark
                ? "bg-[#0F1116] text-amber-200 hover:bg-[#161821]"
                : "bg-white text-[#3A4050] hover:bg-[#F1F2F6]",
            )}
          >
            <motion.span
              key={isDark ? "moon" : "sun"}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className="flex"
            >
              {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </motion.span>
          </button>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className={cn(
              "hidden text-[13px] transition-colors sm:inline-block",
              tokens.text,
            )}
          >
            Login
          </a>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className={cn(
              "inline-flex h-9 items-center rounded-md px-5 text-[13px] font-semibold transition-transform hover:-translate-y-[1px]",
              tokens.primaryBg,
              tokens.primaryFg,
            )}
          >
            Signup
          </a>
        </div>
      </div>
    </motion.header>
  );
}
