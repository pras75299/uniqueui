"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { componentDemos } from "@/config/demos";
import type { ComponentVariant } from "@/config/components";

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

  const activeVariant = variants.find((v) => v.id === activeId)!;

  return (
    <div className="space-y-6">
      {/* Tab bar — same pill-style as AnimatedTabs */}
      <div className="relative flex w-fit gap-1 rounded-xl border border-neutral-800 bg-neutral-900/60 p-1">
        {variants.map((v) => (
          <button
            key={v.id}
            onClick={() => setActiveId(v.id)}
            className="relative z-10 px-4 py-1.5 text-sm font-medium transition-colors duration-200 rounded-lg"
            style={{
              color: activeId === v.id ? "#fff" : "#a3a3a3",
            }}
          >
            {activeId === v.id && (
              <motion.div
                layoutId="bento-variant-pill"
                className="absolute inset-0 rounded-lg bg-neutral-700"
                transition={{ type: "spring", stiffness: 380, damping: 34 }}
              />
            )}
            <span className="relative">{v.label}</span>
          </button>
        ))}
      </div>

      {/* Preview panel */}
      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-white">Preview</h2>
        <div className="relative rounded-xl border border-neutral-800 bg-neutral-950 min-h-[320px] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeId + "-preview"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            >
              {componentDemos[activeVariant?.demoKey] ?? null}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Usage code panel */}
      <section className="space-y-2 pt-6 border-t border-neutral-800">
        <h2 className="text-xl font-semibold text-white">Usage</h2>
        <div className="relative group rounded-lg overflow-hidden border border-neutral-800 bg-neutral-950">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeId + "-code"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="p-4 overflow-x-auto text-sm font-mono [&>pre]:!bg-transparent [&>pre]:!p-0"
              style={{ backgroundColor: "#0a0a0a" }}
              dangerouslySetInnerHTML={{ __html: highlightedCodes[activeId] ?? "" }}
            />
          </AnimatePresence>

          {/* Copy button */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <CopyButton text={rawCodes[activeId] ?? ""} />
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Inline copy button (avoids needing to import client-copy-button) ─────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="flex items-center gap-1 rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-xs text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
