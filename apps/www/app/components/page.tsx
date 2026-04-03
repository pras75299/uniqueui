"use client";

import { componentsList } from "@/config/components";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Search, Layers } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";

const CATEGORIES = [
  "All",
  "Text",
  "Cards",
  "Effects & Animations",
  "Backgrounds",
  "Navigation & Overlays",
  "Cursor Effects",
  "Social & Interaction",
  "Data & Layout",
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 280, damping: 24 } },
};

export default function ComponentsIndex() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return componentsList.filter((c) => {
      const matchesCat = activeCategory === "All" || c.category === activeCategory;
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.category?.toLowerCase().includes(q) ?? false);
      return matchesCat && matchesSearch;
    });
  }, [search, activeCategory]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: componentsList.length };
    componentsList.forEach((c) => {
      const cat = c.category ?? "Other";
      counts[cat] = (counts[cat] ?? 0) + 1;
    });
    return counts;
  }, []);

  return (
    <div className="space-y-10">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border",
              isDark
                ? "bg-purple-500/10 border-purple-500/30 text-purple-300"
                : "bg-purple-50 border-purple-200 text-purple-700"
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
            {componentsList.length} components
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border",
              isDark
                ? "bg-neutral-800 border-neutral-700 text-neutral-400"
                : "bg-neutral-100 border-neutral-200 text-neutral-500"
            )}
          >
            <Layers className="w-3 h-3" />
            {CATEGORIES.length - 1} categories
          </span>
        </div>

        <h1
          className={cn(
            "text-4xl font-bold tracking-tight sm:text-5xl",
            isDark ? "text-white" : "text-neutral-900"
          )}
        >
          Components
        </h1>
        <p
          className={cn(
            "text-lg max-w-2xl leading-relaxed",
            isDark ? "text-neutral-400" : "text-neutral-600"
          )}
        >
          Beautiful, animated components built with React, Tailwind CSS, and
          Motion. Copy and paste into your apps. No config required.
        </p>
      </motion.div>

      {/* ── Search + Filter ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, type: "spring", stiffness: 280, damping: 26 }}
        className="space-y-4"
      >
        {/* Search input */}
        <div className="relative">
          <Search
            className={cn(
              "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none",
              isDark ? "text-neutral-500" : "text-neutral-400"
            )}
          />
          <input
            type="text"
            placeholder="Search components…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              "w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all",
              isDark
                ? "bg-neutral-900/50 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-purple-500/60 focus:bg-neutral-900"
                : "bg-white border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:border-purple-300 focus:shadow-sm"
            )}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 text-xs px-1.5 py-0.5 rounded",
                isDark ? "text-neutral-500 hover:text-white" : "text-neutral-400 hover:text-neutral-700"
              )}
            >
              ✕
            </button>
          )}
        </div>

        {/* Category pill tabs */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "relative px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors",
                activeCategory === cat
                  ? "text-white"
                  : isDark
                  ? "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
              )}
            >
              {activeCategory === cat && (
                <motion.span
                  layoutId="activeCategory"
                  className="absolute inset-0 rounded-lg bg-purple-600"
                  transition={{ type: "spring", bounce: 0.22, duration: 0.42 }}
                />
              )}
              <span className="relative z-10">
                {cat}
                {cat in categoryCounts && (
                  <span
                    className={cn(
                      "ml-1.5 text-[10px] font-normal",
                      activeCategory === cat
                        ? "text-purple-200"
                        : isDark ? "text-neutral-600" : "text-neutral-400"
                    )}
                  >
                    {categoryCounts[cat]}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Results count ── */}
      <AnimatePresence mode="wait">
        <motion.p
          key={`${search}-${activeCategory}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn("text-sm", isDark ? "text-neutral-600" : "text-neutral-400")}
        >
          {filtered.length === componentsList.length
            ? `All ${componentsList.length} components`
            : `${filtered.length} of ${componentsList.length} components`}
        </motion.p>
      </AnimatePresence>

      {/* ── Grid ── */}
      {filtered.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((component) => (
              <motion.div
                key={component.slug}
                layout
                variants={cardVariants}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.18 } }}
              >
                <Link href={`/components/${component.slug}`} className="block h-full">
                  <div
                    className={cn(
                      "group h-full p-5 rounded-xl border transition-all duration-200 cursor-pointer",
                      isDark
                        ? "border-neutral-800 bg-neutral-900/20 hover:bg-neutral-900/60 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-900/10"
                        : "border-neutral-200 bg-white hover:border-purple-200 hover:shadow-xl hover:shadow-purple-100/60"
                    )}
                  >
                    {/* Icon row */}
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={cn(
                          "p-2.5 rounded-lg border transition-all duration-200",
                          isDark
                            ? "bg-neutral-900 border-neutral-800 text-neutral-400 group-hover:text-purple-400 group-hover:bg-purple-500/10 group-hover:border-purple-500/30"
                            : "bg-neutral-50 border-neutral-200 text-neutral-500 group-hover:text-purple-600 group-hover:bg-purple-50 group-hover:border-purple-200"
                        )}
                      >
                        <component.icon className="w-5 h-5" />
                      </div>
                      <ArrowRight
                        className={cn(
                          "w-4 h-4 mt-1 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-200",
                          isDark ? "text-purple-400" : "text-purple-600"
                        )}
                      />
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      {component.category && (
                        <span
                          className={cn(
                            "inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full",
                            isDark
                              ? "bg-neutral-800 text-neutral-500"
                              : "bg-neutral-100 text-neutral-400"
                          )}
                        >
                          {component.category}
                        </span>
                      )}
                      <h3
                        className={cn(
                          "text-base font-semibold leading-snug transition-colors",
                          isDark
                            ? "text-white group-hover:text-purple-300"
                            : "text-neutral-900 group-hover:text-purple-700"
                        )}
                      >
                        {component.name}
                      </h3>
                      <p
                        className={cn(
                          "text-sm line-clamp-2 leading-relaxed",
                          isDark ? "text-neutral-500" : "text-neutral-500"
                        )}
                      >
                        {component.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* ── Empty state ── */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "text-center py-24 rounded-2xl border-2 border-dashed",
            isDark ? "border-neutral-800 text-neutral-600" : "border-neutral-200 text-neutral-400"
          )}
        >
          <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p className="text-base font-medium mb-1">No components found</p>
          <p className="text-sm">
            Try adjusting your search or{" "}
            <button
              onClick={() => { setSearch(""); setActiveCategory("All"); }}
              className={cn(
                "underline transition-colors",
                isDark ? "hover:text-white" : "hover:text-neutral-700"
              )}
            >
              clear filters
            </button>
          </p>
        </motion.div>
      )}
    </div>
  );
}
