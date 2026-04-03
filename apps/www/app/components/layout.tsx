"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { componentsList } from "@/config/components";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/contexts/theme-context";
import { SECTION_NAV } from "@/config/navigation";
import { ArrowLeft, Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function ComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const activeItemRef = useRef<HTMLAnchorElement | null>(null);

  const isOverview = pathname === "/components";

  const activeSection = SECTION_NAV.find((s) =>
    pathname === s.href || pathname.startsWith(s.href + "/")
  )?.href ?? "/components";

  // Scroll active component link into view when pathname changes
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [pathname]);

  // ── Overview page: full-width top-nav layout (no sidebar) ──────────────────
  if (isOverview) {
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
            isDark ? "border-neutral-800 bg-neutral-950/80" : "border-neutral-200 bg-white/80"
          )}
        >
          <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className={cn(
                  "hidden sm:flex items-center gap-1.5 text-sm transition-colors",
                  isDark ? "text-neutral-500 hover:text-white" : "text-neutral-500 hover:text-neutral-900"
                )}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Home
              </Link>
              <span className={cn("hidden sm:block h-4 w-px", isDark ? "bg-neutral-800" : "bg-neutral-200")} />
              <Link
                href="/"
                className={cn("font-bold text-lg tracking-tight", isDark ? "text-white" : "text-neutral-900")}
              >
                UniqueUI
              </Link>
            </div>

            <nav className="flex items-center gap-1">
              {SECTION_NAV.map(({ label, href, icon: Icon }) => {
                const isActive = pathname === href || pathname.startsWith(href + "/");
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
                        : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="componentsOverviewPill"
                        className="absolute inset-0 rounded-lg bg-purple-600"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
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
          <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">{children}</div>
        </main>
      </motion.div>
    );
  }

  // ── Individual component page: sidebar layout ──────────────────────────────
  return (
    <motion.div
      className={cn("flex min-h-screen font-sans", isDark ? "text-neutral-200" : "text-neutral-800")}
      initial={false}
      animate={{ backgroundColor: isDark ? "#0a0a0a" : "#fafafa" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* ── Mobile Header ── */}
      <div
        className={cn(
          "lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 backdrop-blur-md border-b",
          isDark ? "bg-neutral-950/80 border-neutral-800" : "bg-white/80 border-neutral-200"
        )}
      >
        <Link href="/" className="font-bold text-xl tracking-tight">
          UniqueUI
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={cn(
              "p-2",
              isDark ? "text-neutral-400 hover:text-white" : "text-neutral-600 hover:text-neutral-900"
            )}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* ── Mobile backdrop ── */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 border-r transition-transform duration-300 ease-in-out lg:translate-x-0 pt-20 lg:pt-0",
          isDark ? "border-neutral-800 bg-neutral-950" : "border-neutral-200 bg-white",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col overflow-y-auto px-4 py-6">
          {/* Logo + back */}
          <div className="hidden lg:block mb-6">
            <Link
              href="/"
              className={cn(
                "flex items-center gap-2 text-sm transition-colors mb-5",
                isDark ? "text-neutral-500 hover:text-white" : "text-neutral-500 hover:text-neutral-900"
              )}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Home
            </Link>
            <div className="flex items-center justify-between">
              <Link
                href="/components"
                className={cn(
                  "text-xl font-bold tracking-tight",
                  isDark ? "text-white" : "text-neutral-900"
                )}
              >
                UniqueUI
              </Link>
              <ThemeToggle />
            </div>
          </div>

          {/* ── Section nav ── */}
          <div
            className={cn(
              "flex flex-col gap-1 mb-6 pb-6 border-b",
              isDark ? "border-neutral-800" : "border-neutral-100"
            )}
          >
            {SECTION_NAV.map(({ label, href, icon: Icon }) => {
              const isActive = activeSection === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "text-white"
                      : isDark
                      ? "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeSectionPill"
                      className="absolute inset-0 rounded-lg bg-purple-600"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">{label}</span>
                </Link>
              );
            })}
          </div>

          {/* ── Component list (grouped by category) ── */}
          <div className="space-y-5 flex-1">
            {Array.from(
              componentsList.reduce((acc, component) => {
                const category = component.category ?? "Components";
                if (!acc.has(category)) acc.set(category, []);
                acc.get(category)!.push(component);
                return acc;
              }, new Map<string, typeof componentsList[number][]>())
            ).map(([category, items]) => (
              <div key={category} className="space-y-0.5">
                <h4
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-widest px-3 mb-2",
                    isDark ? "text-neutral-500" : "text-neutral-400"
                  )}
                >
                  {category}
                </h4>
                {items.map((component) => {
                  const isActive = pathname === `/components/${component.slug}`;
                  return (
                    <Link
                      key={component.slug}
                      href={`/components/${component.slug}`}
                      ref={isActive ? activeItemRef : null}
                      onClick={() => setIsMobileMenuOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm transition-colors",
                        isActive
                          ? isDark
                            ? "bg-neutral-800 text-white font-medium"
                            : "bg-neutral-100 text-neutral-900 font-medium"
                          : isDark
                          ? "text-neutral-400 hover:text-white hover:bg-neutral-900/50"
                          : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                      )}
                    >
                      <component.icon className="w-3.5 h-3.5 shrink-0" />
                      {component.name}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 w-full lg:pl-64 pt-20 lg:pt-0 min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-12 lg:py-16">{children}</div>
      </main>
    </motion.div>
  );
}
