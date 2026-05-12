"use client";

import { motion } from "motion/react";
import { componentDemos } from "@/config/demos";
import { useTheme } from "@/contexts/theme-context";
import { cn } from "@/lib/utils";

export default function BlockPreview({ slug, className }: { slug: string; className?: string }) {
  const { theme } = useTheme();
  const Demo = componentDemos[slug];
  const isDark = theme === "dark";

  if (!Demo) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-xl border border-dashed border-neutral-800 bg-neutral-900/10 p-12 text-neutral-500",
          className,
        )}
      >
        Preview not available
      </div>
    );
  }

  return (
    <motion.div
      className={cn(
        "relative w-full overflow-hidden rounded-xl border",
        isDark ? "border-neutral-800 bg-neutral-950" : "border-neutral-200 bg-white",
        className,
      )}
      initial={false}
      animate={{
        borderColor: isDark ? "rgb(38,38,38)" : "rgb(229,229,229)",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="relative min-h-[70svh] w-full">
        <Demo />
      </div>
    </motion.div>
  );
}
