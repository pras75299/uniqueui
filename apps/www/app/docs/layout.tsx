"use client";

import { motion } from "motion/react";
import { useTheme } from "@/contexts/theme-context";
import { SiteHeader } from "@/components/site-header";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.div
      className="min-h-screen"
      initial={false}
      animate={{ backgroundColor: isDark ? "#0a0a0a" : "#fafafa" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <SiteHeader />

      <main>
        <div className="max-w-[1600px] mx-auto px-3 py-8 lg:py-12">
          {children}
        </div>
      </main>
    </motion.div>
  );
}
