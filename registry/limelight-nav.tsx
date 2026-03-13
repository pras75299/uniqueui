"use client";

import React, { useState, useEffect, cloneElement, ReactElement, useId } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

// --- Internal Types and Defaults ---

const DefaultHomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
);
const DefaultCompassIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
  </svg>
);
const DefaultBellIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

export type NavItem = {
  id: string | number;
  icon: ReactElement;
  label?: string;
  ariaLabel?: string;
  onClick?: () => void;
};

const defaultNavItems: NavItem[] = [
  { id: "default-home", icon: <DefaultHomeIcon />, label: "Home" },
  { id: "default-explore", icon: <DefaultCompassIcon />, label: "Explore" },
  { id: "default-notifications", icon: <DefaultBellIcon />, label: "Notifications" },
];

export interface LimelightNavProps extends React.HTMLAttributes<HTMLElement> {
  items?: NavItem[];
  defaultActiveIndex?: number;
  onTabChange?: (index: number) => void;
  limelightColor?: string;
  limelightClassName?: string;
  iconContainerClassName?: string;
  iconClassName?: string;
}

/**
 * An adaptive-width navigation bar with a "limelight" effect that highlights the active item, powered by motion/react.
 */
export const LimelightNav = ({
  items = defaultNavItems,
  defaultActiveIndex = 0,
  onTabChange,
  limelightColor = "#a855f7",
  className,
  limelightClassName,
  iconContainerClassName,
  iconClassName,
  ...props
}: LimelightNavProps) => {
  const [activeIndex, setActiveIndex] = useState(() => {
    if (items.length === 0) return -1;
    return Math.min(Math.max(0, defaultActiveIndex), items.length - 1);
  });

  useEffect(() => {
    if (items.length > 0 && activeIndex >= items.length) {
      setActiveIndex(items.length - 1);
    } else if (items.length === 0 && activeIndex !== -1) {
      setActiveIndex(-1);
    }
  }, [items.length, activeIndex]);

  const componentId = useId();

  if (items.length === 0) {
    return null;
  }

  const handleItemClick = (index: number, itemOnClick?: () => void) => {
    setActiveIndex(index);
    onTabChange?.(index);
    itemOnClick?.();
  };

  return (
    <nav
      className={cn(
        "relative inline-flex items-center h-16 rounded-2xl bg-neutral-950 text-foreground border border-white/10 px-2 overflow-hidden",
        className
      )}
      {...props}
    >
      {items.map(({ id, icon, label, ariaLabel, onClick }, index) => {
        const isActive = activeIndex === index;

        if (!label && !ariaLabel) {
          console.warn(
            `LimelightNav: Item with id "${id}" is missing both 'label' and 'ariaLabel'. An accessible name is required for screen readers.`
          );
        }

        return (
          <button
            key={id}
            type="button"
            onClick={() => handleItemClick(index, onClick)}
            aria-label={ariaLabel ?? label}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative z-20 flex h-full cursor-pointer items-center justify-center p-5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:rounded-xl",
              iconContainerClassName
            )}
          >
            {/* Active Highlight (Limelight) Background */}
            {isActive && (
              <motion.div
                layoutId={`limelight-indicator-${componentId}`}
                className={cn(
                  "absolute top-0 z-10 w-11 h-[3px] rounded-full",
                  limelightClassName
                )}
                style={{
                  backgroundColor: limelightColor,
                  boxShadow: `0 50px 15px ${limelightColor}`,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
              >
                <div 
                  className="absolute left-[-30%] top-[3px] w-[160%] h-14 [clip-path:polygon(5%_100%,25%_0,75%_0,95%_100%)] pointer-events-none"
                  style={{
                    background: `linear-gradient(to bottom, ${limelightColor}, transparent)`,
                    opacity: 0.3
                  }}
                />
              </motion.div>
            )}

            <motion.div
              animate={{
                opacity: isActive ? 1 : 0.4,
                scale: isActive ? 1.1 : 1,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
            >
              {cloneElement(icon, {
                className: cn(
                  "w-6 h-6",
                  (icon.props as React.HTMLAttributes<HTMLElement>).className,
                  iconClassName
                ),
              } as React.HTMLAttributes<HTMLElement>)}
            </motion.div>
          </button>
        );
      })}
    </nav>
  );
};
