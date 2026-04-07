"use client";

import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "@/contexts/theme-context";
import { cn } from "@/lib/utils";
import { ArrowUpRight, Clock, Star, Sparkles, Download, Eye } from "lucide-react";
import { useState, useMemo } from "react";
import Link from "next/link";
import { TEMPLATES } from "@/config/templates";

const NICHES = ["All", ...Array.from(new Set(TEMPLATES.map((t) => t.niche)))];

const DIFFICULTIES = ["All", "Starter", "Pro"];

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.06, type: "spring" as const, stiffness: 260, damping: 24 },
  }),
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.18 } },
};

export default function TemplatesPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeNiche, setActiveNiche] = useState("All");
  const [activeDifficulty, setActiveDifficulty] = useState("All");

  const filtered = useMemo(
    () =>
      TEMPLATES.filter((t) => {
        const nicheOk = activeNiche === "All" || t.niche === activeNiche;
        const diffOk = activeDifficulty === "All" || t.difficulty === activeDifficulty;
        return nicheOk && diffOk;
      }),
    [activeNiche, activeDifficulty]
  );

  return (
    <div className={cn("min-h-screen", isDark ? "text-white" : "text-neutral-900")}>
      {/* ── Page hero ── */}
      <section
        className={cn(
          "relative overflow-hidden border-b",
          isDark ? "border-neutral-800" : "border-neutral-200"
        )}
      >
        {/* Background decoration */}
        <div
          className={cn(
            "absolute inset-0 pointer-events-none",
            isDark
              ? "[background:radial-gradient(80%_60%_at_50%_0%,rgba(124,58,237,0.12)_0%,transparent_100%)]"
              : "[background:radial-gradient(80%_60%_at_50%_0%,rgba(221,214,254,0.5)_0%,transparent_100%)]"
          )}
        />

        <div className="relative max-w-7xl mx-auto px-6 py-20 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
          >
            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border mb-6",
                isDark
                  ? "bg-purple-500/10 border-purple-500/30 text-purple-300"
                  : "bg-purple-50 border-purple-200 text-purple-700"
              )}
            >
              <Sparkles className="w-3 h-3" />
              {TEMPLATES.length} templates · more coming soon
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04, type: "spring", stiffness: 280, damping: 26 }}
            className={cn(
              "text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight bg-clip-text text-transparent",
              isDark
                ? "bg-linear-to-b from-white to-neutral-400"
                : "bg-linear-to-b from-neutral-900 to-purple-700"
            )}
          >
            Templates
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, type: "spring", stiffness: 260, damping: 24 }}
            className={cn("text-lg max-w-2xl mx-auto leading-relaxed", isDark ? "text-neutral-400" : "text-neutral-600")}
          >
            Full page layouts built from UniqueUI components. Pick a niche, drop it into
            your project, and customize from there.
          </motion.p>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, type: "spring", stiffness: 260, damping: 24 }}
            className="flex justify-center gap-8 pt-2"
          >
            {[
              { label: "Niches", value: NICHES.length - 1 },
              { label: "Templates", value: TEMPLATES.length },
              { label: "Components used", value: new Set(TEMPLATES.flatMap((t) => t.components)).size },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className={cn("text-2xl font-bold", isDark ? "text-white" : "text-neutral-900")}>{value}</p>
                <p className={cn("text-xs", isDark ? "text-neutral-500" : "text-neutral-500")}>{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Filters ── */}
      <section className="max-w-7xl mx-auto px-6 py-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Niche tabs */}
          <div className="flex flex-wrap gap-2">
            <span className={cn("text-xs font-semibold uppercase tracking-widest self-center mr-1", isDark ? "text-neutral-600" : "text-neutral-400")}>
              Niche
            </span>
            {NICHES.map((niche) => (
              <button
                key={niche}
                onClick={() => setActiveNiche(niche)}
                className={cn(
                  "relative px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  activeNiche === niche
                    ? "text-white"
                    : isDark
                    ? "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                )}
              >
                {activeNiche === niche && (
                  <motion.span
                    layoutId="activeNiche"
                    className="absolute inset-0 rounded-lg bg-purple-600"
                    transition={{ type: "spring", bounce: 0.22, duration: 0.42 }}
                  />
                )}
                <span className="relative z-10">{niche}</span>
              </button>
            ))}
          </div>

          <div className={cn("hidden sm:block w-px self-stretch", isDark ? "bg-neutral-800" : "bg-neutral-200")} />

          {/* Difficulty tabs */}
          <div className="flex flex-wrap gap-2">
            <span className={cn("text-xs font-semibold uppercase tracking-widest self-center mr-1", isDark ? "text-neutral-600" : "text-neutral-400")}>
              Level
            </span>
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff}
                onClick={() => setActiveDifficulty(diff)}
                className={cn(
                  "relative px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  activeDifficulty === diff
                    ? "text-white"
                    : isDark
                    ? "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                )}
              >
                {activeDifficulty === diff && (
                  <motion.span
                    layoutId="activeDifficulty"
                    className="absolute inset-0 rounded-lg bg-neutral-600"
                    transition={{ type: "spring", bounce: 0.22, duration: 0.42 }}
                  />
                )}
                <span className="relative z-10">{diff}</span>
              </button>
            ))}
          </div>
        </div>

        <p className={cn("text-sm", isDark ? "text-neutral-600" : "text-neutral-400")}>
          {filtered.length} template{filtered.length !== 1 ? "s" : ""} found
        </p>
      </section>

      {/* ── Template Grid ── */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((template, idx) => (
              <motion.div
                key={template.id}
                layout
                custom={idx}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={cn(
                  "group rounded-2xl border overflow-hidden flex flex-col transition-all duration-300",
                  isDark
                    ? "border-neutral-800 bg-neutral-900/30 hover:border-neutral-700 hover:shadow-2xl hover:shadow-purple-900/10"
                    : "border-neutral-200 bg-white hover:border-purple-200 hover:shadow-2xl hover:shadow-purple-100/60"
                )}
              >
                {/* ── Preview gradient area ── */}
                <div className={cn("relative h-44 bg-gradient-to-br overflow-hidden", template.gradient)}>
                  {/* Decorative grid */}
                  <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:24px_24px]" />

                  {/* Floating component badges */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-wrap gap-1.5 justify-center px-6">
                      {template.components.slice(0, 3).map((comp) => (
                        <span
                          key={comp}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-white/80 backdrop-blur-sm"
                        >
                          {comp}
                        </span>
                      ))}
                      {template.components.length > 3 && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-white/60">
                          +{template.components.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status + difficulty badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span
                      className={cn(
                        "text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border",
                        template.status === "coming-soon"
                          ? "bg-black/30 border-white/20 text-white/70"
                          : "bg-green-500/20 border-green-500/30 text-green-300"
                      )}
                    >
                      {template.status === "coming-soon" ? (
                        <span className="flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          Coming soon
                        </span>
                      ) : (
                        "Available"
                      )}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border",
                        template.difficulty === "Pro"
                          ? "bg-amber-500/20 border-amber-500/30 text-amber-200"
                          : "bg-white/10 border-white/20 text-white/70"
                      )}
                    >
                      <span className="flex items-center gap-1">
                        <Star className="w-2.5 h-2.5" />
                        {template.difficulty}
                      </span>
                    </span>
                  </div>
                </div>

                {/* ── Card body ── */}
                <div className="flex flex-col flex-1 p-5 space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={cn("text-base font-semibold", isDark ? "text-white" : "text-neutral-900")}>
                        {template.name}
                      </h3>
                      <span
                        className={cn(
                          "shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full",
                          isDark ? "bg-neutral-800 text-neutral-400" : "bg-neutral-100 text-neutral-500"
                        )}
                      >
                        {template.niche}
                      </span>
                    </div>
                    <p className={cn("text-sm leading-relaxed", isDark ? "text-neutral-500" : "text-neutral-500")}>
                      {template.description}
                    </p>
                  </div>

                  {/* Component tags */}
                  <div className="flex flex-wrap gap-1.5 flex-1">
                    {template.components.map((comp) => (
                      <span
                        key={comp}
                        className={cn(
                          "text-[10px] font-medium px-2 py-0.5 rounded-full border",
                          isDark
                            ? "border-neutral-800 bg-neutral-900/50 text-neutral-500"
                            : "border-neutral-200 bg-neutral-50 text-neutral-400"
                        )}
                      >
                        {comp}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="flex gap-2 pt-1">
                    {template.status === "available" ? (
                      <>
                        <Link
                          href={`/templates/${template.id}`}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                            isDark
                              ? "bg-white text-black hover:bg-neutral-200"
                              : "bg-neutral-900 text-white hover:bg-neutral-800"
                          )}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Preview
                        </Link>
                        <a
                          href={`/api/templates/${template.id}/download`}
                          download={`${template.id}-template.zip`}
                          className={cn(
                            "flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-colors",
                            isDark
                              ? "border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700"
                              : "border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:border-neutral-300"
                          )}
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download
                        </a>
                      </>
                    ) : (
                      <button
                        disabled
                        className={cn(
                          "flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border cursor-not-allowed opacity-50",
                          isDark
                            ? "border-neutral-800 text-neutral-500"
                            : "border-neutral-200 text-neutral-400"
                        )}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        Coming soon
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* ── Contribute CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 24 }}
          className={cn(
            "mt-16 rounded-2xl border p-8 md:p-12 text-center space-y-5",
            isDark
              ? "border-neutral-800 bg-neutral-900/30 [background:radial-gradient(60%_80%_at_50%_100%,rgba(124,58,237,0.08)_0%,transparent_100%)]"
              : "border-purple-100 bg-purple-50/40"
          )}
        >
          <div className={cn("inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border", isDark ? "bg-purple-500/10 border-purple-500/30 text-purple-300" : "bg-purple-100 border-purple-200 text-purple-700")}>
            <Sparkles className="w-3 h-3" />
            Open source
          </div>
          <h2 className={cn("text-2xl sm:text-3xl font-bold", isDark ? "text-white" : "text-neutral-900")}>
            Have a template idea?
          </h2>
          <p className={cn("max-w-md mx-auto text-sm sm:text-base leading-relaxed", isDark ? "text-neutral-400" : "text-neutral-600")}>
            Templates are built from UniqueUI components. If you want to contribute a niche
            layout or request one, open an issue on GitHub.
          </p>
          <a
            href="https://github.com/pras75299/uniqueui"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-colors",
              isDark
                ? "bg-white text-black hover:bg-neutral-200"
                : "bg-neutral-900 text-white hover:bg-neutral-800"
            )}
          >
            View on GitHub
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </motion.div>
      </section>
    </div>
  );
}
