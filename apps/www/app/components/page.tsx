"use client";

import { componentsList } from "@/config/components";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { cn } from "@/lib/utils";

export default function ComponentsIndex() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className={cn("text-4xl font-bold tracking-tight sm:text-5xl", isDark ? "text-white" : "text-neutral-900")}>
          Components
        </h1>
        <p className={cn("text-lg max-w-2xl leading-relaxed", isDark ? "text-neutral-400" : "text-neutral-600")}>
          A collection of beautiful, animated components built with React, Tailwind CSS, and Motion.
          Copy and paste into your apps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {componentsList.map((component, idx) => (
          <Link href={`/components/${component.slug}`} key={component.slug}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.05, 0.3), duration: 0.4 }}
              className={cn(
                "group h-full p-6 rounded-xl border transition-all",
                isDark
                  ? "border-neutral-800 bg-neutral-900/20 hover:bg-neutral-900/50 hover:border-neutral-700"
                  : "border-neutral-200 bg-neutral-50/80 hover:bg-neutral-100 hover:border-neutral-300"
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={cn(
                    "p-2 rounded-lg border transition-colors",
                    isDark
                      ? "bg-neutral-900 border-neutral-800 text-neutral-300 group-hover:text-white"
                      : "bg-neutral-100 border-neutral-200 text-neutral-600 group-hover:text-neutral-900"
                  )}
                >
                  <component.icon className="w-6 h-6" />
                </div>
                <ArrowRight
                  className={cn(
                    "w-5 h-5 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all",
                    isDark ? "text-neutral-600 group-hover:text-white" : "text-neutral-400 group-hover:text-neutral-900"
                  )}
                />
              </div>
              <h3
                className={cn(
                  "text-xl font-bold mb-2 transition-colors",
                  isDark ? "text-white group-hover:text-purple-400" : "text-neutral-900 group-hover:text-purple-600"
                )}
              >
                {component.name}
              </h3>
              <p
                className={cn(
                  "text-sm line-clamp-3 transition-colors",
                  isDark ? "text-neutral-500 group-hover:text-neutral-400" : "text-neutral-600 group-hover:text-neutral-700"
                )}
              >
                {component.description}
              </p>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
