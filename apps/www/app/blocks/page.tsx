"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Blocks as BlocksIcon } from "lucide-react";
import { componentsList, isNewComponent } from "@/config/components";
import { useTheme } from "@/contexts/theme-context";
import { useIsClient } from "@/lib/use-is-client";
import { cn } from "@/lib/utils";
import ComponentPreview from "@/components/component-preview";

const blocksList = componentsList.filter((c) => c.kind === "block");

const ALL = "All";

/** Index-card preview slugs (differs from detail page when crop needs a simpler frame). */
const BLOCK_THUMBNAIL_SLUG: Partial<Record<string, string>> = {
  "hero-logo-marquee": "hero-logo-marquee-thumbnail",
};

function BlockCardThumbnail({
  slug,
  isDark,
}: {
  slug: string;
  isDark: boolean;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={frameRef}
      className={cn(
        "relative aspect-[16/10] overflow-hidden",
        isDark ? "bg-neutral-950" : "bg-neutral-100",
      )}
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[100svh] w-[240%] max-w-none -translate-x-1/2 -translate-y-1/2 origin-center scale-[0.4] sm:scale-[0.48]">
        <ComponentPreview
          slug={slug}
          lazy
          lazyRoot={frameRef}
          variant="thumbnail"
        />
      </div>
      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          isDark
            ? "bg-gradient-to-t from-black/40 via-transparent to-transparent"
            : "bg-gradient-to-t from-white/30 via-transparent to-transparent",
        )}
      />
    </div>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.05,
      type: "spring" as const,
      stiffness: 260,
      damping: 24,
    },
  }),
};

export default function BlocksIndex() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const hydrated = useIsClient();
  const [activeCategory, setActiveCategory] = useState(ALL);

  const categories = useMemo(() => {
    const set = new Set<string>();
    blocksList.forEach((b) => set.add(b.category ?? "Other"));
    return [ALL, ...Array.from(set).sort()];
  }, []);

  const counts = useMemo(() => {
    const map: Record<string, number> = { [ALL]: blocksList.length };
    blocksList.forEach((b) => {
      const k = b.category ?? "Other";
      map[k] = (map[k] ?? 0) + 1;
    });
    return map;
  }, []);

  const filtered = useMemo(
    () =>
      activeCategory === ALL
        ? blocksList
        : blocksList.filter((b) => (b.category ?? "Other") === activeCategory),
    [activeCategory],
  );

  return (
    <div className={cn(isDark ? "text-white" : "text-neutral-900")}>
      <section
        className={cn(
          "relative overflow-hidden border-b",
          isDark ? "border-neutral-800" : "border-neutral-200",
        )}
      >
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0",
            isDark
              ? "bg-[radial-gradient(ellipse_at_top,_rgba(120,80,255,0.18),_transparent_55%)]"
              : "bg-[radial-gradient(ellipse_at_top,_rgba(120,80,255,0.10),_transparent_55%)]",
          )}
        />
        <div className="relative mx-auto max-w-[1400px] px-4 py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            className="flex flex-col gap-4"
          >
            <span
              className={cn(
                "inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em]",
                isDark
                  ? "border-white/15 bg-white/5 text-white/70"
                  : "border-neutral-300 bg-white text-neutral-600",
              )}
            >
              <BlocksIcon className="h-3.5 w-3.5" aria-hidden />
              Blocks
            </span>
            <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Composed sections you can drop into any page.
            </h1>
            <p
              className={cn(
                "max-w-2xl text-pretty text-base sm:text-lg",
                isDark ? "text-white/65" : "text-neutral-600",
              )}
            >
              Heroes, pricing, CTAs — each block ships as one file with a
              slotted <code className="font-mono text-sm">children</code> prop
              and a standalone background export.
            </p>
          </motion.div>

          <div className="mt-8 flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  aria-pressed={isActive}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                    isActive
                      ? isDark
                        ? "border-white/30 bg-white text-neutral-900"
                        : "border-neutral-900 bg-neutral-900 text-white"
                      : isDark
                        ? "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"
                        : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100",
                  )}
                >
                  {cat}
                  <span
                    className={cn(
                      "text-[10px]",
                      isActive ? "opacity-60" : "opacity-50",
                    )}
                  >
                    {counts[cat] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-10 sm:py-14">
        {filtered.length === 0 ? (
          <div
            className={cn(
              "rounded-xl border border-dashed p-12 text-center text-sm",
              isDark
                ? "border-neutral-800 bg-neutral-950/50 text-neutral-500"
                : "border-neutral-200 bg-white text-neutral-500",
            )}
          >
            No blocks in this category yet — more landing soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((block, i) => {
              const isNew = hydrated && isNewComponent(block.addedAt);
              return (
                <motion.div
                  key={block.slug}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Link
                    href={`/blocks/${block.slug}`}
                    className={cn(
                      "group block overflow-hidden rounded-xl border transition-all",
                      isDark
                        ? "border-neutral-800 bg-neutral-950/50 hover:border-neutral-700 hover:bg-neutral-900/50"
                        : "border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-lg",
                    )}
                  >
                    <BlockCardThumbnail
                      slug={BLOCK_THUMBNAIL_SLUG[block.slug] ?? block.slug}
                      isDark={isDark}
                    />
                    <div className="flex items-start justify-between gap-3 p-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-sm font-medium">
                            {block.name}
                          </h3>
                          {isNew ? (
                            <span
                              aria-label="New block"
                              className={cn(
                                "rounded-full px-1.5 py-px text-[9px] font-bold uppercase tracking-wider",
                                isDark
                                  ? "bg-purple-500/20 text-purple-300"
                                  : "bg-purple-100 text-purple-700",
                              )}
                            >
                              New
                            </span>
                          ) : null}
                        </div>
                        <p
                          className={cn(
                            "mt-1 line-clamp-2 text-xs",
                            isDark ? "text-neutral-400" : "text-neutral-500",
                          )}
                        >
                          {block.description}
                        </p>
                      </div>
                      <ArrowRight
                        className={cn(
                          "mt-0.5 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5",
                          isDark ? "text-neutral-500" : "text-neutral-400",
                        )}
                        aria-hidden
                      />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
