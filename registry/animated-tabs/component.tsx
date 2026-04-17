"use client";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { motion } from "motion/react";

export interface AnimatedTabsProps {
  tabs: {
    id: string;
    label: string;
    content?: React.ReactNode;
  }[];
  className?: string;
  tabClassName?: string;
  activeTabClassName?: string;
  contentClassName?: string;
  onChange?: (id: string) => void;
  theme?: "light" | "dark";
}

export function AnimatedTabs({
  tabs,
  className,
  tabClassName,
  activeTabClassName,
  contentClassName,
  onChange,
  theme = "dark",
}: AnimatedTabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id);
  const isDark = theme === "dark";

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    onChange?.(id);
  };

  return (
    <div className={cn("w-full", className)}>
      <div role="tablist" className={cn("relative flex items-center gap-1 rounded-lg p-1 border", isDark ? "bg-neutral-900/50 border-neutral-800" : "bg-neutral-100 border-neutral-200")}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={cn(
              "relative z-10 flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200",
              activeTab === tab.id
                ? cn(isDark ? "text-white" : "text-neutral-900", activeTabClassName)
                : isDark ? "text-neutral-400 hover:text-neutral-200" : "text-neutral-600 hover:text-neutral-900",
              tabClassName
            )}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="animated-tab-pill"
                className={cn("absolute inset-0 rounded-md border", isDark ? "bg-neutral-800 border-neutral-700" : "bg-white border-neutral-300 shadow-sm")}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 35,
                }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      {tabs.map((tab) =>
        tab.content && activeTab === tab.id ? (
          <motion.div
            key={tab.id}
            role="tabpanel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn("mt-4", contentClassName)}
          >
            {tab.content}
          </motion.div>
        ) : null
      )}
    </div>
  );
}
