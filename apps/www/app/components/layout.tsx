"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { componentsList } from "@/config/components";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/contexts/theme-context";
import { ArrowLeft, Menu, X } from "lucide-react";
import { useState } from "react";

export default function ComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.div
      className={cn("flex min-h-screen font-sans", isDark ? "text-neutral-200" : "text-neutral-800")}
      initial={false}
      animate={{ backgroundColor: isDark ? "#0a0a0a" : "#fafafa" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Mobile Header */}
      <div
        className={cn(
          "lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 backdrop-blur-md border-b",
          isDark ? "bg-neutral-950/80 border-neutral-800" : "bg-white/80 border-neutral-200"
        )}
      >
        <Link href="/" className="font-bold text-xl tracking-tight">
          UniqueUI
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={cn("p-2", isDark ? "text-neutral-400 hover:text-white" : "text-neutral-600 hover:text-neutral-900")}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 border-r transition-transform duration-300 ease-in-out lg:translate-x-0 pt-20 lg:pt-0",
          isDark ? "border-neutral-800 bg-neutral-950" : "border-neutral-200 bg-white",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col overflow-y-auto px-6 py-8">
            <div className="hidden lg:block mb-8">
                <Link
                  href="/"
                  className={cn("flex items-center gap-2 text-sm transition-colors mb-4", isDark ? "text-neutral-500 hover:text-white" : "text-neutral-600 hover:text-neutral-900")}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <Link href="/components" className={cn("block text-2xl font-bold tracking-tight", isDark ? "text-white" : "text-neutral-900")}>
                    UniqueUI
                  </Link>
                  <ThemeToggle />
                </div>
            </div>

            <div className="space-y-6">
                {Array.from(
                    componentsList.reduce((acc, component) => {
                        const category = component.category || "Components";
                        if (!acc.has(category)) acc.set(category, []);
                        acc.get(category)!.push(component);
                        return acc;
                    }, new Map<string, typeof componentsList[0][]>())
                ).map(([category, items]) => (
                    <div key={category} className="space-y-1">
                        <h4 className={cn("text-xs font-semibold mb-2 px-3 uppercase tracking-wider", isDark ? "text-neutral-400" : "text-neutral-500")}>
                            {category}
                        </h4>
                        {items.map((component) => {
                            const isActive = pathname === `/components/${component.slug}`;
                            return (
                                <Link
                                    key={component.slug}
                                    href={`/components/${component.slug}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                                        isActive
                                            ? isDark ? "bg-neutral-900 text-white font-medium" : "bg-neutral-100 text-neutral-900 font-medium"
                                            : isDark ? "text-neutral-400 hover:text-white hover:bg-neutral-900/50" : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                                    )}
                                >
                                    <component.icon className="w-4 h-4" />
                                    {component.name}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full lg:pl-64 pt-20 lg:pt-0 min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-12 lg:py-16">
            {children}
        </div>
      </main>
    </motion.div>
  );
}
