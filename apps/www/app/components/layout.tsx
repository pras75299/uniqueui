"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { componentsList } from "@/config/components";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { ArrowLeft, Menu, X } from "lucide-react";
import { useState } from "react";

export default function ComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-200 font-sans">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800">
        <Link href="/" className="font-bold text-xl tracking-tight">
          UniqueUI
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-neutral-400 hover:text-white"
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 border-r border-neutral-800 bg-neutral-950 transition-transform duration-300 ease-in-out lg:translate-x-0 pt-20 lg:pt-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col overflow-y-auto px-6 py-8">
            <div className="hidden lg:block mb-8">
                <Link href="/" className="flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors mb-4">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>
                <Link href="/components" className="block text-2xl font-bold tracking-tight text-white">
                    UniqueUI
                </Link>
            </div>

            <div className="space-y-1">
                <h4 className="text-sm font-semibold text-neutral-400 mb-4 px-2 uppercase tracking-wider">Components</h4>
                {componentsList.map((component) => {
                    const isActive = pathname === `/components/${component.slug}`;
                    return (
                        <Link
                            key={component.slug}
                            href={`/components/${component.slug}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                                isActive
                                    ? "bg-neutral-900 text-white font-medium"
                                    : "text-neutral-400 hover:text-white hover:bg-neutral-900/50"
                            )}
                        >
                            <component.icon className="w-4 h-4" />
                            {component.name}
                        </Link>
                    );
                })}
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full lg:pl-64 pt-20 lg:pt-0 min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-12 lg:py-16">
            {children}
        </div>
      </main>
    </div>
  );
}
