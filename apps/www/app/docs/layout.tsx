"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/contexts/theme-context";
import { SECTION_NAV } from "@/config/navigation";
import { ArrowLeft } from "lucide-react";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.div
      className="min-h-screen"
      initial={false}
      animate={{ backgroundColor: isDark ? "#0a0a0a" : "#fafafa" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <header
        className={cn(
          "sticky top-0 z-50 border-b backdrop-blur-md",
          isDark
            ? "border-neutral-800 bg-neutral-950/80"
            : "border-neutral-200 bg-white/80",
        )}
      >
        <div className="max-w-[1600px] mx-auto px-3 h-14 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className={cn(
                "hidden sm:flex items-center gap-1.5 text-sm transition-colors",
                isDark
                  ? "text-neutral-500 hover:text-white"
                  : "text-neutral-500 hover:text-neutral-900",
              )}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Home
            </Link>
            <span
              className={cn(
                "hidden sm:block h-4 w-px",
                isDark ? "bg-neutral-800" : "bg-neutral-200",
              )}
            />
            <Link
              href="/"
              className={cn(
                "font-bold text-lg tracking-tight",
                isDark ? "text-white" : "text-neutral-900",
              )}
            >
              UniqueUI
            </Link>
          </div>

          <nav className="flex items-center gap-1">
            {SECTION_NAV.map(({ label, href, icon: Icon }) => {
              const isActive =
                pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "text-white"
                      : isDark
                        ? "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                        : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100",
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="docsOverviewPill"
                      className="absolute inset-0 rounded-lg bg-purple-600"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.4,
                      }}
                    />
                  )}
                  <Icon className="w-3.5 h-3.5 relative z-10" />
                  <span className="relative z-10">{label}</span>
                </Link>
              );
            })}
          </nav>

          <ThemeToggle />
        </div>
      </header>

      <main>
        <div className="max-w-[1600px] mx-auto px-3 py-8 lg:py-12">
          {children}
        </div>
      </main>
    </motion.div>
  );
}
