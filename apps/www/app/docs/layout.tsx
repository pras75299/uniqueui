"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { componentsList } from "@/config/components";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/contexts/theme-context";
import { SECTION_NAV } from "@/config/navigation";
import {
  ArrowLeft,
  Menu,
  X,
  BookOpen,
  Rocket,
  Download,
  Zap,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

const GETTING_STARTED = [
  { label: "Introduction", href: "/docs", icon: BookOpen },
  { label: "Installation", href: "/docs#installation", icon: Download },
  { label: "Quick Start", href: "/docs#quickstart", icon: Zap },
  { label: "CLI Reference", href: "/docs#cli", icon: Rocket },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hash, setHash] = useState("");
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const activeItemRef = useRef<HTMLAnchorElement | null>(null);
  // Tracks which section IDs are currently intersecting the viewport trigger zone.
  // Using a ref avoids re-creating the observer on every set update.
  const intersectingRef = useRef<Set<string>>(new Set());

  // Scroll active component doc link into view when pathname changes
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [pathname]);

  // Track hash for Getting Started active states
  useEffect(() => {
    if (pathname !== "/docs") {
      setHash("");
      return;
    }

    setHash(window.location.hash);

    // Keep in sync when user clicks a hash link
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);

    // Scroll-spy: update active item as user scrolls through sections.
    // The observer callback only receives CHANGED entries, not all observed ones,
    // so we maintain a Set of currently-visible IDs to reliably detect "above all sections".
    const SECTION_IDS = ["installation", "quickstart", "cli"];
    intersectingRef.current.clear();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            intersectingRef.current.add(entry.target.id);
          } else {
            intersectingRef.current.delete(entry.target.id);
          }
        }
        if (intersectingRef.current.size === 0) {
          const firstEl = document.getElementById(SECTION_IDS[0]);
          const lastEl = document.getElementById(SECTION_IDS[SECTION_IDS.length - 1]);
          
          if (firstEl && firstEl.getBoundingClientRect().top > 0) {
            setHash("");
          } else if (lastEl && lastEl.getBoundingClientRect().bottom < window.innerHeight) {
            setHash(`#${SECTION_IDS[SECTION_IDS.length - 1]}`);
          }
        } else {
          // Prefer the first section in document order when multiple are visible
          const active = SECTION_IDS.find((id) => intersectingRef.current.has(id));
          if (active) setHash(`#${active}`);
        }
      },
      { rootMargin: "-20% 0px -75% 0px", threshold: 0 }
    );

    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => {
      window.removeEventListener("hashchange", onHashChange);
      observer.disconnect();
    };
  }, [pathname]);

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
            type="button"
            aria-label={isMobileMenuOpen ? "Close docs navigation" : "Open docs navigation"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="docs-sidebar"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={cn("p-2", isDark ? "text-neutral-400 hover:text-white" : "text-neutral-600 hover:text-neutral-900")}
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
      <motion.aside
        id="docs-sidebar"
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 border-r pt-20 lg:pt-0 lg:!transform-none",
          isDark ? "border-neutral-800 bg-neutral-950" : "border-neutral-200 bg-white",
          isMobileMenuOpen
            ? "visible pointer-events-auto"
            : "pointer-events-none lg:visible lg:pointer-events-auto"
        )}
        initial={false}
        animate={{
          x: isMobileMenuOpen ? 0 : -256,
          opacity: isMobileMenuOpen ? 1 : 0,
        }}
        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
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
              <Link href="/docs" className={cn("text-xl font-bold tracking-tight", isDark ? "text-white" : "text-neutral-900")}>
                UniqueUI
              </Link>
              <ThemeToggle />
            </div>
          </div>

          {/* ── Section nav ── */}
          <div className={cn("flex flex-col gap-1 mb-6 pb-6 border-b", isDark ? "border-neutral-800" : "border-neutral-100")}>
            {SECTION_NAV.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive ? "text-white" : isDark ? "text-neutral-400 hover:text-white hover:bg-neutral-800/50" : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="docsActiveSectionPill"
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

          {/* ── Getting Started ── */}
          <div className="space-y-0.5 mb-6">
            <h4 className={cn("text-[10px] font-semibold uppercase tracking-widest px-3 mb-2", isDark ? "text-neutral-500" : "text-neutral-400")}>
              Getting Started
            </h4>
            {GETTING_STARTED.map(({ label, href, icon: Icon }) => {
              const isActive =
                pathname === "/docs" &&
                (href === "/docs" ? hash === "" : href === `/docs${hash}`);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-current={isActive ? (href.includes("#") ? "location" : "page") : undefined}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm transition-colors",
                    isActive
                      ? isDark ? "bg-neutral-800 text-white font-medium" : "bg-neutral-100 text-neutral-900 font-medium"
                      : isDark ? "text-neutral-400 hover:text-white hover:bg-neutral-900/50" : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                  )}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* ── Component docs (grouped by category) ── */}
          <div className="space-y-5 flex-1">
            <h4 className={cn("text-[10px] font-semibold uppercase tracking-widest px-3", isDark ? "text-neutral-500" : "text-neutral-400")}>
              Component Docs
            </h4>
            {Array.from(
              componentsList.reduce((acc, component) => {
                const category = component.category ?? "Components";
                if (!acc.has(category)) acc.set(category, []);
                acc.get(category)!.push(component);
                return acc;
              }, new Map<string, typeof componentsList[number][]>())
            ).map(([category, items]) => (
              <div key={category} className="space-y-0.5">
                <h5 className={cn("text-[10px] font-semibold uppercase tracking-widest px-3 mb-1.5", isDark ? "text-neutral-600" : "text-neutral-400")}>
                  {category}
                </h5>
                {items.map((component) => {
                  const isActive = pathname === `/docs/${component.slug}`;
                  return (
                    <Link
                      key={component.slug}
                      href={`/docs/${component.slug}`}
                      ref={isActive ? activeItemRef : null}
                      onClick={() => setIsMobileMenuOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm transition-colors",
                        isActive
                          ? isDark ? "bg-neutral-800 text-white font-medium" : "bg-neutral-100 text-neutral-900 font-medium"
                          : isDark ? "text-neutral-400 hover:text-white hover:bg-neutral-900/50" : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
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
      </motion.aside>

      {/* ── Main Content ── */}
      <main className="flex-1 w-full lg:pl-64 pt-20 lg:pt-0 min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-12 lg:py-16">{children}</div>
      </main>
    </motion.div>
  );
}
