"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

export type DrawerPosition = "left" | "right" | "top" | "bottom";

export interface DrawerSlideProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: DrawerPosition;
  className?: string;
  overlayClassName?: string;
  width?: string;
  height?: string;
  dragToClose?: boolean;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  theme?: "light" | "dark";
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  );
}

const positionStyles: Record<
  DrawerPosition,
  {
    container: string;
    initial: Record<string, number>;
    animate: Record<string, number>;
    exit: Record<string, number>;
    drag: "x" | "y";
    dragConstraint: Record<string, number>;
  }
> = {
  right: {
    container: "right-0 top-0 h-full",
    initial: { x: 500 },
    animate: { x: 0 },
    exit: { x: 500 },
    drag: "x",
    dragConstraint: { left: 0 },
  },
  left: {
    container: "left-0 top-0 h-full",
    initial: { x: -500 },
    animate: { x: 0 },
    exit: { x: -500 },
    drag: "x",
    dragConstraint: { right: 0 },
  },
  bottom: {
    container: "bottom-0 left-0 w-full",
    initial: { y: 500 },
    animate: { y: 0 },
    exit: { y: 500 },
    drag: "y",
    dragConstraint: { top: 0 },
  },
  top: {
    container: "top-0 left-0 w-full",
    initial: { y: -500 },
    animate: { y: 0 },
    exit: { y: -500 },
    drag: "y",
    dragConstraint: { bottom: 0 },
  },
};

export function DrawerSlide({
  isOpen,
  onClose,
  children,
  position = "right",
  className,
  overlayClassName,
  width = "400px",
  height = "400px",
  dragToClose = true,
  ariaLabel,
  ariaLabelledBy,
  theme = "dark",
}: DrawerSlideProps) {
  const config = positionStyles[position];
  const isHorizontal = position === "left" || position === "right";
  const drawerRef = React.useRef<HTMLDivElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
      closeButtonRef.current?.focus();
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
      previousFocusRef.current?.focus();
    };
  }, [isOpen, handleEscape]);

  useEffect(() => {
    if (!isOpen || !drawerRef.current) {
      return;
    }

    const drawer = drawerRef.current;
    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== "Tab") {
        return;
      }

      const focusable = getFocusableElements(drawer);
      if (focusable.length === 0) {
        event.preventDefault();
        drawer.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    drawer.addEventListener("keydown", handleTab);
    return () => drawer.removeEventListener("keydown", handleTab);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className={cn(
              "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
              overlayClassName
            )}
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            initial={config.initial}
            animate={config.animate}
            exit={config.exit}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            tabIndex={-1}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag={dragToClose ? config.drag : false}
            dragConstraints={config.dragConstraint}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              const threshold = 100;
              const offset = isHorizontal ? info.offset.x : info.offset.y;
              const shouldClose =
                (position === "right" && offset > threshold) ||
                (position === "left" && offset < -threshold) ||
                (position === "bottom" && offset > threshold) ||
                (position === "top" && offset < -threshold);
              if (shouldClose) onClose();
            }}
            className={cn(
              "fixed z-50 shadow-2xl",
              theme === "dark" ? "border-neutral-800 bg-neutral-950" : "border-neutral-200 bg-white",
              config.container,
              isHorizontal ? "border-l" : "border-t",
              className
            )}
            style={{
              width: isHorizontal ? width : undefined,
              height: !isHorizontal ? height : undefined,
            }}
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close drawer"
              className={cn(
                "absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                theme === "dark"
                  ? "bg-neutral-900 text-neutral-400 hover:text-white"
                  : "bg-neutral-100 text-neutral-600 hover:text-neutral-900"
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
            {/* Drag handle */}
            {dragToClose && (
              <div
                aria-hidden="true"
                className={cn(
                  "flex items-center justify-center",
                  isHorizontal
                    ? "absolute top-1/2 -translate-y-1/2 w-5 h-10"
                    : "absolute left-1/2 -translate-x-1/2 h-5 w-10",
                  position === "right" && "left-1",
                  position === "left" && "right-1",
                  position === "bottom" && "top-2",
                  position === "top" && "bottom-2"
                )}
              >
                <div
                  className={cn(
                    "rounded-full",
                    theme === "dark" ? "bg-neutral-700" : "bg-neutral-300",
                    isHorizontal ? "w-1 h-8" : "h-1 w-8"
                  )}
                />
              </div>
            )}

            <div className="h-full overflow-y-auto p-6 pt-14">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
