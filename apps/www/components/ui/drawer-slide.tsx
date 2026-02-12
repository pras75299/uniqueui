"use client";
import React, { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

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
}: DrawerSlideProps) {
  const config = positionStyles[position];
  const isHorizontal = position === "left" || position === "right";

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
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

          <motion.div
            initial={config.initial}
            animate={config.animate}
            exit={config.exit}
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
              "fixed z-50 border-neutral-800 bg-neutral-950 shadow-2xl",
              config.container,
              isHorizontal ? "border-l" : "border-t",
              className
            )}
            style={{
              width: isHorizontal ? width : undefined,
              height: !isHorizontal ? height : undefined,
            }}
          >
            {dragToClose && (
              <div
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
                    "rounded-full bg-neutral-700",
                    isHorizontal ? "w-1 h-8" : "h-1 w-8"
                  )}
                />
              </div>
            )}

            <div className="h-full overflow-y-auto p-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
