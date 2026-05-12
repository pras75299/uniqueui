"use client";

import { motion } from "motion/react";
import { useTheme } from "@/contexts/theme-context";
import { SiteHeader } from "@/components/site-header";

export default function BlocksLayout({ children }: { children: React.ReactNode }) {
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
      <main>{children}</main>
    </motion.div>
  );
}
