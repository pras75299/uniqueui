"use client";

import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useTheme } from "@/contexts/theme-context";
import { SiteHeader } from "@/components/site-header";

export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // On /templates/[slug] the template has its own nav — hide this layout's header
  const isPreviewRoute = pathname !== "/templates" && pathname.startsWith("/templates/");

  if (isPreviewRoute) {
    return <>{children}</>;
  }

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
