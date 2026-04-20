"use client";

import React from "react";
import { componentDemos } from "@/config/demos";
import type { ComponentVariant } from "@/config/components";
import { useTheme } from "@/contexts/theme-context";
import { cn } from "@/lib/utils";
import ClientCopyButton from "@/components/client-copy-button";

interface VariantShowcaseProps {
  variants: ComponentVariant[];
  /** Pre-highlighted HTML per variant id, produced by shiki on the server. */
  highlightedCodes: Record<string, string>;
  /** Raw usage code per variant id, used for the copy button. */
  rawCodes: Record<string, string>;
}

/**
 * Renders every variant stacked vertically: `label → preview → usage` for each
 * one, in order. Replaces the previous tab-based switcher so every scenario is
 * visible on scroll without interaction.
 */
export default function VariantShowcase({
  variants,
  highlightedCodes,
  rawCodes,
}: VariantShowcaseProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="space-y-12">
      {variants.map((variant, index) => {
        const Demo = componentDemos[variant.demoKey];
        const highlighted = highlightedCodes[variant.id] ?? "";
        const raw = rawCodes[variant.id] ?? "";

        return (
          <section
            key={variant.id}
            className={cn(
              "space-y-4",
              index > 0 &&
                (isDark
                  ? "pt-12 border-t border-neutral-800"
                  : "pt-12 border-t border-neutral-200"),
            )}
            aria-labelledby={`variant-${variant.id}`}
          >
            {/* Variant heading */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <h2
                id={`variant-${variant.id}`}
                className={cn(
                  "text-2xl font-semibold tracking-tight",
                  isDark ? "text-white" : "text-neutral-900",
                )}
              >
                {variant.label}
              </h2>
              <span
                className={cn(
                  "text-xs font-mono uppercase tracking-wider",
                  isDark ? "text-neutral-500" : "text-neutral-400",
                )}
              >
                Variant {index + 1} of {variants.length}
              </span>
            </div>

            {/* Preview — same visual treatment as the single-demo ComponentPreview */}
            <div
              className={cn(
                "relative rounded-xl border min-h-[320px] flex items-center justify-center",
                variant.overflowVisible ? "overflow-y-visible" : "overflow-hidden",
                isDark
                  ? "border-neutral-800 bg-neutral-950/50"
                  : "border-neutral-200 bg-neutral-50/80",
              )}
            >
              <div
                className={cn(
                  "absolute inset-0 z-0 opacity-20 pointer-events-none [background-size:24px_24px] rounded-xl",
                  isDark
                    ? "[background-image:linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)]"
                    : "[background-image:linear-gradient(to_right,#d4d4d4_1px,transparent_1px),linear-gradient(to_bottom,#d4d4d4_1px,transparent_1px)]",
                )}
              />
              <div className="relative z-10 w-full">
                {Demo ? (
                  <Demo theme={theme} />
                ) : (
                  <div
                    className={cn(
                      "p-12 text-center",
                      isDark ? "text-neutral-500" : "text-neutral-400",
                    )}
                  >
                    Preview not available
                  </div>
                )}
              </div>
            </div>

            {/* Usage — same visual treatment as the single-demo Usage block */}
            <div
              className={cn(
                "relative group rounded-lg overflow-hidden border",
                isDark
                  ? "border-neutral-800 bg-neutral-950"
                  : "border-neutral-200 bg-neutral-900",
              )}
            >
              <div
                className="p-4 overflow-x-auto text-sm font-mono [&>pre]:bg-transparent! [&>pre]:p-0!"
                style={{ backgroundColor: "#0a0a0a" }}
                dangerouslySetInnerHTML={{ __html: highlighted }}
              />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <ClientCopyButton text={raw} />
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
