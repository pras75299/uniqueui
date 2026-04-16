"use client";
import React, { useState } from "react";
import { motion } from "motion/react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
}

export function AnimatedTabs({
  tabs,
  className,
  tabClassName,
  activeTabClassName,
  contentClassName,
  onChange,
}: AnimatedTabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id);

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    onChange?.(id);
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="relative flex items-center gap-1 rounded-lg bg-neutral-900/50 p-1 border border-neutral-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={cn(
              "relative z-10 flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200",
              activeTab === tab.id
                ? cn("text-white", activeTabClassName)
                : "text-neutral-400 hover:text-neutral-200",
              tabClassName
            )}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="animated-tab-pill"
                className="absolute inset-0 rounded-md bg-neutral-800 border border-neutral-700"
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
