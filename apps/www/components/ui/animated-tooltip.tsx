"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import * as React from "react";

type Side = "top" | "bottom" | "left" | "right";
type Align = "start" | "center" | "end";

export interface AnimatedTooltipProps {
  /** The trigger element. Must be a single focusable React element. */
  children: React.ReactElement;
  /** Content rendered inside the tooltip bubble. */
  content: React.ReactNode;
  /** Which side of the trigger the tooltip appears on. */
  side?: Side;
  /** Alignment along the trigger's edge. */
  align?: Align;
  /** Background colour of the tooltip bubble. */
  background?: string;
  /** Text colour inside the tooltip. */
  color?: string;
  /** Arrow fill colour. Defaults to `background` so it always matches. */
  arrowColor?: string;
  /** Whether to render the pointing arrow. */
  arrow?: boolean;
  /** Arrow edge length in px. */
  arrowSize?: number;
  /** Gap between trigger and tooltip in px. */
  offset?: number;
  /** Delay before the tooltip appears, in ms. */
  delay?: number;
  /** Disable the tooltip entirely (trigger still renders). */
  disabled?: boolean;
  /** Extra classes merged onto the tooltip bubble. */
  className?: string;
}

function getLayoutStyle(
  side: Side,
  align: Align,
  offset: number,
): React.CSSProperties {
  const style: React.CSSProperties = {};
  const gap = `calc(100% + ${offset}px)`;

  if (side === "top") style.bottom = gap;
  if (side === "bottom") style.top = gap;
  if (side === "left") style.right = gap;
  if (side === "right") style.left = gap;

  if (side === "top" || side === "bottom") {
    if (align === "center") {
      style.left = "50%";
      style.transform = "translateX(-50%)";
    } else if (align === "start") {
      style.left = 0;
    } else {
      style.right = 0;
    }
  } else {
    if (align === "center") {
      style.top = "50%";
      style.transform = "translateY(-50%)";
    } else if (align === "start") {
      style.top = 0;
    } else {
      style.bottom = 0;
    }
  }

  return style;
}

function getArrowStyle(
  side: Side,
  align: Align,
  size: number,
  fill: string,
): React.CSSProperties {
  const half = size / 2;
  const style: React.CSSProperties = {
    position: "absolute",
    width: size,
    height: size,
    background: fill,
    transform: "rotate(45deg)",
    borderRadius: 2,
  };

  // Sit the rotated square half-way over the edge facing the trigger.
  if (side === "top") style.bottom = -half;
  if (side === "bottom") style.top = -half;
  if (side === "left") style.right = -half;
  if (side === "right") style.left = -half;

  // Position the arrow along the edge to track the chosen alignment.
  const edgePad = Math.max(size, 8);
  if (side === "top" || side === "bottom") {
    if (align === "center") {
      style.left = "50%";
      style.marginLeft = -half;
    } else if (align === "start") {
      style.left = edgePad;
    } else {
      style.right = edgePad;
    }
  } else {
    if (align === "center") {
      style.top = "50%";
      style.marginTop = -half;
    } else if (align === "start") {
      style.top = edgePad;
    } else {
      style.bottom = edgePad;
    }
  }

  return style;
}

export function AnimatedTooltip({
  children,
  content,
  side = "top",
  align = "center",
  background = "#18181b",
  color = "#fafafa",
  arrowColor,
  arrow = true,
  arrowSize = 8,
  offset = 8,
  delay = 200,
  disabled = false,
  className,
}: AnimatedTooltipProps) {
  const [open, setOpen] = React.useState(false);
  const tooltipId = React.useId();
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const clearTimer = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const show = React.useCallback(() => {
    if (disabled) return;
    clearTimer();
    timerRef.current = setTimeout(() => setOpen(true), delay);
  }, [disabled, delay, clearTimer]);

  const hide = React.useCallback(() => {
    clearTimer();
    setOpen(false);
  }, [clearTimer]);

  // Clean up any pending show timer on unmount.
  React.useEffect(() => clearTimer, [clearTimer]);

  // Dismiss on Escape, per WAI-ARIA tooltip guidance.
  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") hide();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, hide]);

  // Link the trigger to the bubble for assistive tech while it is visible.
  // Event handlers live on the wrapper below — onFocus/onBlur bubble via
  // focusin/focusout, so descendant focus is captured without cloning refs in.
  const trigger = React.cloneElement(children, {
    "aria-describedby": open ? tooltipId : undefined,
  } as React.HTMLAttributes<HTMLElement>);

  const directional =
    side === "top"
      ? { y: 4 }
      : side === "bottom"
        ? { y: -4 }
        : side === "left"
          ? { x: 4 }
          : { x: -4 };

  const motionProps = prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.12 },
      }
    : {
        initial: { opacity: 0, scale: 0.92, ...directional },
        animate: { opacity: 1, scale: 1, x: 0, y: 0 },
        exit: { opacity: 0, scale: 0.92, ...directional },
        transition: { type: "spring" as const, stiffness: 500, damping: 30 },
      };

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {trigger}
      <AnimatePresence>
        {open && (
          <span
            className="pointer-events-none absolute z-50"
            style={getLayoutStyle(side, align, offset)}
          >
            <motion.span
              role="tooltip"
              id={tooltipId}
              {...motionProps}
              style={{
                background,
                color,
                transformOrigin: "center",
              }}
              className={cn(
                "relative block w-max max-w-xs rounded-md px-2.5 py-1.5 text-sm font-medium leading-snug shadow-lg shadow-black/20",
                className,
              )}
            >
              {content}
              {arrow && (
                <span
                  aria-hidden="true"
                  style={getArrowStyle(
                    side,
                    align,
                    arrowSize,
                    arrowColor ?? background,
                  )}
                />
              )}
            </motion.span>
          </span>
        )}
      </AnimatePresence>
    </span>
  );
}
