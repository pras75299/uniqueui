"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { ArrowLeft, Github } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/contexts/theme-context";
import { SECTION_NAV } from "@/config/navigation";

/** Shared across all layouts so the active pill can morph between routes when possible. */
const SECTION_NAV_PILL_LAYOUT_ID = "site-section-nav-pill";

export type SiteHeaderProps = {
  /** Rendered after the theme toggle (e.g. mobile sidebar control). */
  trailing?: ReactNode;
  className?: string;
};

export function SiteHeader({ trailing, className }: SiteHeaderProps) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isHome = pathname === "/";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b backdrop-blur-md",
        isDark
          ? "border-neutral-800 bg-neutral-950/80"
          : "border-neutral-200 bg-white/80",
      )}
    >
      <div
        className={cn(
          "mx-auto grid h-14 max-w-[1600px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-3 sm:gap-4 md:px-4",
          className,
        )}
      >
        {/* Equal 1fr | auto | 1fr keeps section nav centered on the bar when left/right width changes (home vs internal). */}
        <div className="flex min-w-0 items-center justify-self-start gap-2 sm:gap-4">
          {!isHome && (
            <>
              <Link
                href="/"
                className={cn(
                  "hidden items-center gap-1.5 text-sm transition-colors duration-200 ease-out sm:inline-flex",
                  isDark
                    ? "text-neutral-500 hover:text-white"
                    : "text-neutral-500 hover:text-neutral-900",
                )}
              >
                <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Home
              </Link>
              <span
                className={cn(
                  "hidden h-4 w-px shrink-0 sm:block",
                  isDark ? "bg-neutral-800" : "bg-neutral-200",
                )}
                aria-hidden
              />
            </>
          )}
          <Link
            href="/"
            className={cn(
              "flex min-w-0 shrink items-baseline gap-2 truncate font-bold text-lg tracking-tight",
              isDark ? "text-white" : "text-neutral-900",
            )}
          >
            <span className="truncate">UniqueUI</span>
            {isHome ? (
              <span className="shrink-0 font-mono text-[10px] font-normal tracking-normal text-neutral-500 sm:text-xs">
                v1.0.0
              </span>
            ) : null}
          </Link>
        </div>

        <nav
          className="flex shrink-0 justify-self-center items-center gap-0.5 sm:gap-1"
          aria-label="Site sections"
        >
          {SECTION_NAV.map(({ label, href, icon: Icon }) => {
            const isActive =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors duration-200 ease-out sm:px-3",
                  isActive
                    ? "text-white"
                    : isDark
                      ? "text-neutral-400 hover:bg-neutral-800/50 hover:text-white"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
                )}
              >
                {isActive ? (
                  <motion.span
                    layoutId={SECTION_NAV_PILL_LAYOUT_ID}
                    className="absolute inset-0 rounded-lg bg-purple-600"
                    transition={{
                      type: "spring",
                      bounce: 0.2,
                      duration: 0.4,
                    }}
                  />
                ) : null}
                <Icon className="relative z-10 h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="relative z-10 hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex min-w-0 justify-self-end items-center justify-end gap-0.5 sm:gap-2">
          <a
            href="https://github.com/pras75299/uniqueui"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-200 ease-out sm:h-auto sm:w-auto sm:gap-2 sm:px-2.5 sm:py-1.5",
              isDark
                ? "text-neutral-400 hover:bg-neutral-800/50 hover:text-white"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
            )}
            aria-label="UniqueUI on GitHub"
          >
            <Github className="h-4 w-4 shrink-0" aria-hidden />
            <span className="hidden text-sm sm:inline">GitHub</span>
          </a>
          <ThemeToggle />
          {trailing}
        </div>
      </div>
    </header>
  );
}
