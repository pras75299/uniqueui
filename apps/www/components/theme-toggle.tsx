"use client";

import { motion } from "motion/react";
import { useTheme } from "@/contexts/theme-context";
import { cn } from "@/lib/utils";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
        isDark
          ? "border-neutral-700 bg-neutral-800/80 text-amber-300 hover:bg-neutral-800 focus:ring-neutral-500"
          : "border-neutral-300 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 focus:ring-neutral-400 focus:ring-offset-neutral-50",
        className
      )}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 0 : 180, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="flex items-center justify-center"
      >
        {isDark ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
      </motion.div>
    </button>
  );
}
