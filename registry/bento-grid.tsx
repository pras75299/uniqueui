"use client";
import React, { useRef } from "react";
import { motion, useInView } from "motion/react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BentoCardProps {
  /** Icon displayed at the top of the card */
  icon?: React.ReactNode;
  /** Card headline */
  title: string;
  /** Supporting description */
  description?: string;
  /** Optional decorative background layer (image, SVG, gradient, etc.) */
  background?: React.ReactNode;
  /** Call-to-action label shown on hover */
  cta?: string;
  /** When supplied the card renders as an anchor tag */
  href?: string;
  /** Grid span / sizing classes, e.g. "col-span-2" or "row-span-2" */
  className?: string;
  /** Animation entrance delay multiplier (0-based index, injected by BentoGrid) */
  index?: number;
  /**
   * Enable the spinning conic-gradient border effect (same as the hero button).
   * When true, the static border is replaced by an animated colour border.
   */
  spinBorder?: boolean;
  /**
   * Two-colour pair for the spinning conic gradient.
   * Defaults to ["#E2CBFF", "#393BB2"] (purple–indigo).
   */
  spinBorderColors?: [string, string];
}

export interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

// ─── BentoGrid ────────────────────────────────────────────────────────────────

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[200px]",
        className
      )}
    >
      {React.Children.map(children, (child, index) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<BentoCardProps>, { index })
          : child
      )}
    </div>
  );
}

// ─── BentoCard ────────────────────────────────────────────────────────────────

export function BentoCard({
  icon,
  title,
  description,
  background,
  cta,
  href,
  className,
  index = 0,
  spinBorder = false,
  spinBorderColors = ["#E2CBFF", "#393BB2"],
}: BentoCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const Tag = href ? "a" : "div";
  const linkProps = href
    ? { href, target: "_blank" as const, rel: "noopener noreferrer" }
    : {};

  const [c1, c2] = spinBorderColors;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{
        type: "spring",
        stiffness: 80,
        damping: 18,
        delay: index * 0.07,
      }}
      className={cn("group relative", className)}
    >
      {/*
        Spinning border wrapper.
        - When spinBorder is ON:  p-[1px] + overflow-hidden show the 1px gradient ring
        - When spinBorder is OFF: no padding/overflow, same visual as before
        rounded-2xl is set here (and on the inner Tag) so border-radius never changes.
      */}
      <div
        className={cn(
          "relative h-full rounded-2xl",
          spinBorder && "overflow-hidden p-[1px]"
        )}
      >
        {/* Spinning conic-gradient element — clipped by the wrapper above */}
        {spinBorder && (
          <span
            className="pointer-events-none absolute inset-[-1000%] animate-[spin_2s_linear_infinite]"
            style={{
              background: `conic-gradient(from 90deg at 50% 50%, ${c1} 0%, ${c2} 50%, ${c1} 100%)`,
            }}
          />
        )}

        {/* Card surface */}
        <Tag
          {...linkProps}
          className={cn(
            "relative flex h-full w-full flex-col overflow-hidden rounded-2xl bg-neutral-950 p-6 transition-colors duration-300",
            spinBorder
              ? "border-0" // gradient replaces the static border
              : "border border-neutral-800 hover:border-neutral-600"
          )}
        >
          {/* Subtle hover glow */}
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(139,92,246,0.06), transparent 60%)",
            }}
          />

          {/* Decorative background layer */}
          {background && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl opacity-60 transition-opacity duration-500 group-hover:opacity-80">
              {background}
            </div>
          )}

          {/* Content */}
          <div className="relative z-10 flex flex-col h-full">
            {/* Icon */}
            {icon && (
              <motion.div
                className="mb-3 w-fit rounded-xl border border-neutral-800 bg-neutral-900 p-2.5 text-neutral-300 transition-colors duration-300 group-hover:border-neutral-700 group-hover:text-white"
                whileHover={{ scale: 1.08 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                {icon}
              </motion.div>
            )}

            {/* Title + description */}
            <div className="mt-auto">
              <h3 className="text-sm font-semibold text-white leading-snug">{title}</h3>
              {description && (
                <p className="mt-1 text-xs text-neutral-400 leading-relaxed line-clamp-3">
                  {description}
                </p>
              )}
            </div>

            {/* CTA — slides up on hover */}
            {cta && (
              <motion.div
                className="mt-3 flex items-center gap-1 text-xs font-medium text-violet-400"
                initial={{ opacity: 0, y: 8 }}
                whileHover={{}}
                animate={{}}
              >
                <span className="translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  {cta} →
                </span>
              </motion.div>
            )}
          </div>
        </Tag>
      </div>
    </motion.div>
  );
}
