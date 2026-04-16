"use client";
import { cn } from "@/lib/utils";
import { useInView } from "motion/react";
import { useRef, useState, useEffect } from "react";

export interface CountUpProps {
  /** Starting value */
  from?: number;
  /** Ending value */
  to: number;
  /** Animation duration in seconds */
  duration?: number;
  /** Decimal places to display */
  decimals?: number;
  /** String prepended to the number (e.g. "$") */
  prefix?: string;
  /** String appended to the number (e.g. "k+") */
  suffix?: string;
  /** Thousands separator character. Pass "" to disable */
  separator?: string;
  className?: string;
  /** Only animate once on first enter */
  once?: boolean;
  theme?: "light" | "dark";
}

export function CountUp({
  from = 0,
  to,
  duration = 2,
  decimals = 0,
  prefix = "",
  suffix = "",
  separator = ",",
  className,
  once = true,
  _theme = "dark",
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once, amount: 0.5 });
  const [value, setValue] = useState(from);

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    let raf: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * eased;
      setValue(current);
      if (progress < 1) {
        raf = requestAnimationFrame(step);
      } else {
        setValue(to);
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [isInView, from, to, duration]);

  const formatted = (() => {
    const fixed = value.toFixed(decimals);
    if (!separator) return fixed;
    const [integer, decimal] = fixed.split(".");
    const withSep = integer.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return decimal !== undefined ? `${withSep}.${decimal}` : withSep;
  })();

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
