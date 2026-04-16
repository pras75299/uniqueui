"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export interface RadialMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  color?: string;
}

export interface RadialMenuProps {
  /** Array of items to display in the menu */
  items: RadialMenuItem[];
  /** The radius of the circle the items burst outwards to */
  radius?: number;
  /** The starting angle in degrees (0 is right, 90 is bottom, 180 is left, 270 is top) */
  startAngle?: number;
  /** The ending angle in degrees */
  endAngle?: number;
  /** Stagger delay between each item animation */
  staggerDelay?: number;
  /** The central trigger icon (defaults to a plus icon if not provided) */
  triggerIcon?: React.ReactNode;
  /** Additional container classes */
  className?: string;
  /** Classes applied to the main trigger button */
  triggerClassName?: string;
  /** Classes applied to individual menu item buttons */
  itemClassName?: string;
  theme?: "light" | "dark";
  /** Accessible label for the trigger button */
  triggerAriaLabel?: string;
}

export function RadialMenu({
  items,
  radius = 100,
  startAngle = -90,
  endAngle = 180,
  staggerDelay = 0.05,
  triggerIcon,
  className,
  triggerClassName,
  itemClassName,
  _theme = "dark",
  triggerAriaLabel,
}: RadialMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close menu if clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calculate positions for each item
  const calculatePosition = (index: number) => {
    // If there's only one item, place it in the middle of the available angle
    const totalItems = items.length;
    let angleRatio = 0;

    if (totalItems > 1) {
      // If we are drawing a full circle (difference is 360), divide by total items
      // Otherwise divide by totalItems - 1 to distribute from start to end inclusive
      const angleDiff = Math.abs(endAngle - startAngle);
      if (angleDiff >= 360) {
        angleRatio = index / totalItems;
      } else {
        angleRatio = index / (totalItems - 1);
      }
    } else {
      angleRatio = 0.5;
    }

    const currentAngle = startAngle + (endAngle - startAngle) * angleRatio;
    const currentAngleRad = (currentAngle * Math.PI) / 180;

    const x = radius * Math.cos(currentAngleRad);
    const y = radius * Math.sin(currentAngleRad);

    return { x, y };
  };

  const DefaultTrigger = (
    <div className="flex h-6 w-6 items-center justify-center">
      <div className="absolute h-4 w-0.5 rounded-full bg-current transition-all" />
      <div className="absolute h-0.5 w-4 rounded-full bg-current transition-all" />
    </div>
  );

  return (
    <div ref={containerRef} className={cn("relative flex items-center justify-center", className)}>
      <AnimatePresence>
        {isOpen &&
          items.map((item, index) => {
            const { x, y } = calculatePosition(index);

            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                animate={{
                  opacity: 1,
                  x,
                  y,
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: index * staggerDelay,
                  },
                }}
                exit={{
                  opacity: 0,
                  x: 0,
                  y: 0,
                  scale: 0,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                    // Stagger reverse on exit
                    delay: (items.length - 1 - index) * staggerDelay * 0.5,
                  },
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  item.onClick?.();
                  setIsOpen(false);
                }}
                aria-label={item.label}
                title={item.label}
                className={cn(
                  "absolute flex h-12 w-12 items-center justify-center rounded-full shadow-lg border border-neutral-200 bg-white text-neutral-700 hover:text-neutral-900 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-700 dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 focus:ring-offset-2 dark:focus:ring-offset-neutral-950 z-0",
                  itemClassName
                )}
                style={item.color ? { color: item.color } : undefined}
              >
                {item.icon}
              </motion.button>
            );
          })}
      </AnimatePresence>

      <motion.button
        animate={{ rotate: isOpen ? 45 : 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={triggerAriaLabel}
        className={cn(
          "relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-900 text-white shadow-xl hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 dark:focus:ring-neutral-600 dark:focus:ring-offset-neutral-950 transition-colors",
          triggerClassName
        )}
      >
        {triggerIcon || DefaultTrigger}
      </motion.button>
    </div>
  );
}
