"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { componentDemos } from "@/config/demos";
import type { ComponentVariant } from "@/config/components";
import { useTheme } from "@/contexts/theme-context";
import { cn } from "@/lib/utils";
import ClientCopyButton from "@/components/client-copy-button";

interface BentoVariantSwitcherProps {
  variants: ComponentVariant[];
  /** Pre-highlighted HTML per variant id, produced by shiki on the server */
  highlightedCodes: Record<string, string>;
  /** Raw usage code per variant id, used for the copy button */
  rawCodes: Record<string, string>;
}

export default function BentoVariantSwitcher({
  variants,
  highlightedCodes,
  rawCodes,
}: BentoVariantSwitcherProps) {
  const [activeId, setActiveId] = useState(variants[0]?.id ?? "");
  const { theme } = useTheme();
  const activeVariant = variants.find((v) => v.id === activeId)!;
  const isDark = theme === "dark";
  const Demo = activeVariant ? componentDemos[activeVariant.demoKey] : null;

  return (
    <div className="space-y-6">
      {/* Tab bar — same pill-style as AnimatedTabs */}
      <div
        className={cn(
          "relative flex w-full gap-1 rounded-xl border p-1 overflow-x-auto",
          isDark ? "border-neutral-800 bg-neutral-900/60" : "border-neutral-200 bg-neutral-100",
        )}
      >
        {variants.map((v) => (
          <button
            key={v.id}
            onClick={() => setActiveId(v.id)}
            className="relative z-10 px-4 py-1.5 text-sm font-medium transition-colors duration-200 rounded-lg whitespace-nowrap shrink-0"
            style={{
              color: activeId === v.id ? (isDark ? "#fff" : "#171717") : isDark ? "#a3a3a3" : "#737373",
            }}
          >
            {activeId === v.id && (
              <motion.div
                layoutId="bento-variant-pill"
                className={cn("absolute inset-0 rounded-lg", isDark ? "bg-neutral-700" : "bg-neutral-300")}
                transition={{ type: "spring", stiffness: 380, damping: 34 }}
              />
            )}
            <span className="relative whitespace-nowrap">{v.label}</span>
          </button>
        ))}
      </div>

      {/* Preview panel */}
      <section className="space-y-2">
        <h2 className={cn("text-xl font-semibold", isDark ? "text-white" : "text-neutral-900")}>Preview</h2>
        <div
          className={cn(
            "relative rounded-xl border min-h-[320px]",
            // Components with overflowVisible manage their own internal scrolling
            // and would be clipped by overflow:hidden on this wrapper.
            activeVariant?.overflowVisible ? "overflow-y-visible" : "overflow-hidden",
            isDark
              ? "border-neutral-800 bg-neutral-950"
              : "border-neutral-200 bg-neutral-50",
          )}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeId + "-preview"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            >
              {Demo ? <Demo theme={theme} /> : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Usage code panel */}
      <section className={cn("space-y-2 pt-6 border-t", isDark ? "border-neutral-800" : "border-neutral-200")}>
        <h2 className={cn("text-xl font-semibold", isDark ? "text-white" : "text-neutral-900")}>Usage</h2>
        <div className={cn("relative group rounded-lg overflow-hidden border", isDark ? "border-neutral-800 bg-neutral-950" : "border-neutral-200 bg-neutral-900")}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeId + "-code"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="p-4 overflow-x-auto text-sm font-mono [&>pre]:bg-transparent! [&>pre]:p-0!"
              style={{ backgroundColor: "#0a0a0a" }}
              dangerouslySetInnerHTML={{ __html: highlightedCodes[activeId] ?? "" }}
            />
          </AnimatePresence>

          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <ClientCopyButton text={rawCodes[activeId] ?? ""} />
          </div>
        </div>
      </section>
    </div>
  );
}
