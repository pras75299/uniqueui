"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { componentsList } from "@/config/components";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/theme-context";
import { Menu, X } from "lucide-react";
import { motion } from "motion/react";
import { SiteHeader } from "@/components/site-header";
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

  // Scroll active component link into view when pathname changes
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [pathname]);

  const topHeader = (
    <SiteHeader
      trailing={
        !isOverview ? (
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={
              isMobileMenuOpen
                ? "Close components menu"
                : "Open components menu"
            }
            aria-expanded={isMobileMenuOpen}
            aria-controls="components-sidebar"
            className={cn(
              "rounded-lg p-2 lg:hidden",
              isDark
                ? "text-neutral-400 hover:bg-neutral-800/50 hover:text-white"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
            )}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        ) : null
      }
    />
  );

  // ── Overview page: top-nav + full-width content ────────────────────────────
  if (isOverview) {
    return (
      <motion.div
        className="min-h-screen"
        initial={false}
        animate={{ backgroundColor: isDark ? "#0a0a0a" : "#fafafa" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {topHeader}
        <main>
          <div className="max-w-[1600px] mx-auto px-3 py-8 lg:py-12">
            {children}
          </div>
        </main>
      </motion.div>
    );
  }

  // ── Detail page: top-nav + sidebar (component list only) + content ─────────
  return (
    <motion.div
      className={cn(
        "flex flex-col min-h-screen font-sans",
        isDark ? "text-neutral-200" : "text-neutral-800",
      )}
      initial={false}
      animate={{ backgroundColor: isDark ? "#0a0a0a" : "#fafafa" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {topHeader}

      <div className="flex flex-1">
        {/* ── Mobile backdrop ── */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* ── Sidebar (component list only) ── */}
        <aside
          id="components-sidebar"
          className={cn(
            "fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-64 border-r transition-transform duration-300 ease-in-out lg:translate-x-0",
            isDark
              ? "border-neutral-800 bg-neutral-950"
              : "border-neutral-200 bg-white",
            isMobileMenuOpen
              ? "translate-x-0 visible pointer-events-auto"
              : "-translate-x-full invisible pointer-events-none lg:visible lg:pointer-events-auto",
          )}
        >
          <div className="h-full overflow-y-auto px-3 py-4">
            <div className="space-y-5">
              {Array.from(
                componentsList.reduce((acc, component) => {
                  const category = component.category ?? "Components";
                  if (!acc.has(category)) acc.set(category, []);
                  acc.get(category)!.push(component);
                  return acc;
                }, new Map<string, (typeof componentsList)[number][]>()),
              ).map(([category, items]) => (
                <div key={category} className="space-y-0.5">
                  <h4
                    className={cn(
                      "text-[10px] font-semibold uppercase tracking-widest px-3 mb-2",
                      isDark ? "text-neutral-500" : "text-neutral-400",
                    )}
                  >
                    {category}
                  </h4>
                  {items.map((component) => {
                    const isActive =
                      pathname === `/components/${component.slug}`;
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
                              : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100",
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
        <main className="flex-1 w-full lg:pl-64 min-h-full">
          <div className="max-w-7xl mx-auto px-3 py-8 lg:py-12">
            {children}
          </div>
        </main>
      </div>
    </motion.div>
  );
}
