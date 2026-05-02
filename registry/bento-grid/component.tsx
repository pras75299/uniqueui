"use client";
import React, { useCallback, useRef } from "react";
import {
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
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
  /** Pointer-follow radial highlight (Aceternity-style bento polish). Default true. */
  interactiveSpotlight?: boolean;
  theme?: "light" | "dark";
}

export interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
  theme?: "light" | "dark";
}

const SPOTLIGHT_SIZE = 480;

// ─── BentoGrid ────────────────────────────────────────────────────────────────

export function BentoGrid({ children, className, theme = "dark" }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[200px]",
        className
      )}
    >
      {React.Children.map(children, (child, index) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<BentoCardProps>, { index, theme })
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
  interactiveSpotlight = true,
  theme = "dark",
}: BentoCardProps) {
  const inViewRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(inViewRef, { once: true, amount: 0.2 });
  const prefersReducedMotion = useReducedMotion();

  const mouseX = useMotionValue(-SPOTLIGHT_SIZE);
  const mouseY = useMotionValue(-SPOTLIGHT_SIZE);
  const smoothX = useSpring(mouseX, { stiffness: 280, damping: 32, mass: 0.35 });
  const smoothY = useSpring(mouseY, { stiffness: 280, damping: 32, mass: 0.35 });

  const spotlightColor =
    theme === "dark" ? "rgba(139, 92, 246, 0.16)" : "rgba(79, 70, 229, 0.14)";
  const spotlightTrack = prefersReducedMotion ? mouseX : smoothX;
  const spotlightTrackY = prefersReducedMotion ? mouseY : smoothY;

  const spotlightBackground = useMotionTemplate`radial-gradient(${SPOTLIGHT_SIZE}px circle at ${spotlightTrack}px ${spotlightTrackY}px, ${spotlightColor}, transparent 72%)`;

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!interactiveSpotlight || !surfaceRef.current) return;
      const rect = surfaceRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [interactiveSpotlight, mouseX, mouseY]
  );

  const handlePointerLeave = useCallback(() => {
    mouseX.set(-SPOTLIGHT_SIZE);
    mouseY.set(-SPOTLIGHT_SIZE);
  }, [mouseX, mouseY]);

  const Tag = href ? "a" : "div";
  const linkProps = href
    ? { href, target: "_blank" as const, rel: "noopener noreferrer" }
    : {};

  const [c1, c2] = spinBorderColors;

  const springHover = { type: "spring" as const, stiffness: 400, damping: 30 };
  const hoverLift = prefersReducedMotion ? undefined : { y: -5, transition: springHover };
  const tapScale = prefersReducedMotion
    ? undefined
    : { scale: 0.985, transition: { type: "spring" as const, stiffness: 520, damping: 34 } };

  return (
    <motion.div
      ref={inViewRef}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{
        type: "spring",
        stiffness: 70,
        damping: 20,
        mass: 0.55,
        delay: prefersReducedMotion ? 0 : index * 0.06,
      }}
      className={cn("group relative h-full", className)}
      whileHover={hoverLift}
      whileTap={tapScale}
    >
      <div
        className={cn(
          "relative h-full rounded-2xl transition-[box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "[@media(hover:hover)_and_(pointer:fine)]:group-hover:shadow-xl",
          theme === "dark"
            ? "[@media(hover:hover)_and_(pointer:fine)]:group-hover:shadow-black/40"
            : "[@media(hover:hover)_and_(pointer:fine)]:group-hover:shadow-neutral-400/25"
        )}
      >
        <div
          ref={surfaceRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          className={cn(
            "relative h-full rounded-2xl",
            spinBorder && "overflow-hidden p-[1px]"
          )}
        >
          {spinBorder && (
            <span
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-[-1000%] animate-[spin_2s_linear_infinite]",
                "motion-reduce:animate-none"
              )}
              style={{
                background: `conic-gradient(from 90deg at 50% 50%, ${c1} 0%, ${c2} 50%, ${c1} 100%)`,
              }}
            />
          )}

          <Tag
            {...linkProps}
            className={cn(
              "relative flex h-full w-full flex-col overflow-hidden rounded-2xl p-6",
              "transition-[border-color,background-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
              "focus-within:ring-2 focus-within:ring-violet-500/50 focus-within:ring-offset-2",
              theme === "dark" ? "focus-within:ring-offset-neutral-950" : "focus-within:ring-offset-white",
              theme === "dark" ? "bg-neutral-950" : "bg-white",
              href && "cursor-pointer",
              spinBorder
                ? "border-0"
                : theme === "dark"
                  ? "border border-neutral-800 [@media(hover:hover)_and_(pointer:fine)]:hover:border-neutral-600"
                  : "border border-neutral-200 [@media(hover:hover)_and_(pointer:fine)]:hover:border-neutral-400"
            )}
          >
            {interactiveSpotlight && (
              <motion.div
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-200 ease-out [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100 motion-reduce:opacity-0 motion-reduce:group-hover:opacity-0"
                style={{ background: spotlightBackground }}
              />
            )}

            {background && (
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl opacity-55 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-opacity [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-[1.04] [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-80 motion-reduce:[@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-100">
                <div className="h-full w-full origin-center">{background}</div>
              </div>
            )}

            <div className="relative z-10 flex h-full flex-col">
              {icon && (
                <motion.div
                  className={cn(
                    "mb-3 w-fit rounded-xl border p-2.5",
                    "transition-[border-color,background-color,color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    theme === "dark"
                      ? "border-neutral-800 bg-neutral-900 text-neutral-300 [@media(hover:hover)_and_(pointer:fine)]:group-hover:border-neutral-600 [@media(hover:hover)_and_(pointer:fine)]:group-hover:bg-neutral-800/90 [@media(hover:hover)_and_(pointer:fine)]:group-hover:text-white"
                      : "border-neutral-200 bg-neutral-100 text-neutral-700 [@media(hover:hover)_and_(pointer:fine)]:group-hover:border-neutral-300 [@media(hover:hover)_and_(pointer:fine)]:group-hover:bg-white [@media(hover:hover)_and_(pointer:fine)]:group-hover:text-neutral-900"
                  )}
                  whileHover={
                    prefersReducedMotion
                      ? undefined
                      : { scale: 1.06, rotate: -4, transition: { type: "spring", stiffness: 420, damping: 18 } }
                  }
                >
                  {icon}
                </motion.div>
              )}

              <div className="mt-auto">
                <h3
                  className={cn(
                    "text-sm font-semibold leading-snug",
                    theme === "dark" ? "text-white" : "text-neutral-900"
                  )}
                >
                  {title}
                </h3>
                {description && (
                  <p
                    className={cn(
                      "mt-1 line-clamp-3 text-xs leading-relaxed",
                      theme === "dark" ? "text-neutral-400" : "text-neutral-600"
                    )}
                  >
                    {description}
                  </p>
                )}
              </div>

              {cta && (
                <div className="mt-3 flex min-h-[1.25rem] items-center">
                  <span
                    className={cn(
                      "inline-flex translate-y-2 items-center gap-1 text-xs font-medium opacity-0 transition-[transform,opacity] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      theme === "dark" ? "text-violet-400" : "text-violet-600",
                      "[@media(hover:hover)_and_(pointer:fine)]:group-hover:translate-y-0 [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100",
                      "motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none"
                    )}
                  >
                    {cta} →
                  </span>
                </div>
              )}
            </div>
          </Tag>
        </div>
      </div>
    </motion.div>
  );
}
