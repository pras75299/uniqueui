"use client";

import { motion } from "motion/react";
import { componentDemos } from "@/config/demos";
import { useTheme } from "@/contexts/theme-context";
import { cn } from "@/lib/utils";

export default function ComponentPreview({ slug }: { slug: string }) {
  const { theme } = useTheme();
  const Demo = componentDemos[slug];

  if (!Demo) {
    return (
      <div className="flex items-center justify-center p-12 text-neutral-500 bg-neutral-900/10 border border-neutral-800 rounded-lg border-dashed">
        Preview not available
      </div>
    );
  }

  const hasOverflowHidden = slug !== "horizontal-scroll-gallery";
  const isDark = theme === "dark";

  return (
    <motion.div
      className={cn(
        "w-full rounded-xl border relative min-h-[300px] flex items-center justify-center",
        hasOverflowHidden && "overflow-hidden",
        isDark ? "border-neutral-800 bg-neutral-950/50" : "border-neutral-200 bg-neutral-50/80"
      )}
      initial={false}
      animate={{
        backgroundColor: isDark ? "rgba(10,10,10,0.5)" : "rgba(250,250,250,0.8)",
        borderColor: isDark ? "rgb(38,38,38)" : "rgb(229,229,229)",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div
        className={cn(
          "absolute inset-0 z-0 opacity-20 pointer-events-none [background-size:24px_24px]",
          hasOverflowHidden ? "" : "rounded-xl overflow-hidden",
          isDark
            ? "[background-image:linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)]"
            : "[background-image:linear-gradient(to_right,#d4d4d4_1px,transparent_1px),linear-gradient(to_bottom,#d4d4d4_1px,transparent_1px)]"
        )}
      />
      <div className="relative z-10 w-full">
        <Demo theme={theme} />
      </div>
    </motion.div>
  );
}
