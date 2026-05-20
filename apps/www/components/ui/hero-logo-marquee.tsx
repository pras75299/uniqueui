"use client";

import type { ComponentProps, ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const DEFAULT_LOGOS = [
  "Acme",
  "Globex",
  "Soylent",
  "Initech",
  "Hooli",
  "Umbrella",
  "Stark",
  "Wayne",
  "Cyberdyne",
  "Wonka",
  "Tyrell",
  "Aperture",
];

type LogoMarqueeRowProps = Omit<ComponentProps<"div">, "children"> & {
  /** Brand names rendered as the ticker items. Repeated to keep the loop seamless. */
  logos?: ReadonlyArray<string>;
  /** Loop duration in seconds. Lower = faster. Clamped to a positive number. */
  speed?: number;
  /** Scroll direction. */
  direction?: "left" | "right";
  /**
   * Accessible name for the marquee. Surfaces to screen readers as the
   * row's label (e.g. "Customer logos", "Trusted by"). Defaults to a
   * sensible generic so the row isn't anonymous in AT output.
   */
  label?: string;
};

export function LogoMarqueeRow({
  logos = DEFAULT_LOGOS,
  speed = 32,
  direction = "left",
  label = "Customer logos",
  className,
  ...rest
}: LogoMarqueeRowProps) {
  const reduced = useReducedMotion();
  const safeSpeed = Number.isFinite(speed) && speed > 0 ? speed : 32;

  // Two copies of the list keep the loop seamless: when the first copy has
  // moved by exactly its own width, the second copy is in the same spot.
  const items = [...logos, ...logos];
  const xRange = direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"];

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        "[mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]",
        className,
      )}
      {...rest}
    >
      <motion.ul
        aria-label={label}
        className="flex w-max items-center gap-12 whitespace-nowrap text-base font-medium text-white/55"
        // Anchor `initial` to the first keyframe — motion v12 skips repeat:Infinity loops if SSR bakes in the target frame. Reduced motion freezes statically at 0%.
        initial={reduced ? { x: "0%" } : { x: xRange[0] }}
        animate={reduced ? { x: "0%" } : { x: xRange }}
        transition={
          reduced
            ? undefined
            : { duration: safeSpeed, ease: "linear", repeat: Infinity }
        }
      >
        {items.map((logo, i) => (
          <li
            key={`${logo}-${i}`}
            className="flex shrink-0 items-center gap-3 text-xl tracking-tight"
            aria-hidden={i >= logos.length || undefined}
          >
            <span className="inline-block h-2 w-2 rounded-full bg-white/30" aria-hidden />
            {logo}
          </li>
        ))}
      </motion.ul>
    </div>
  );
}

type LogoMarqueeHeroProps = Omit<ComponentProps<"section">, "children"> & {
  children?: ReactNode;
  /** Logos for the top row. */
  logos?: ReadonlyArray<string>;
  /** Optional second row. Defaults to a reversed copy of `logos`. Pass `null` to hide. */
  secondaryLogos?: ReadonlyArray<string> | null;
  /** Row scroll speed in seconds. */
  speed?: number;
};

export function LogoMarqueeHero({
  children,
  logos = DEFAULT_LOGOS,
  secondaryLogos,
  speed = 32,
  className,
  ...rest
}: LogoMarqueeHeroProps) {
  // `undefined` means "use the reversed default"; `null` means "hide it".
  const showSecondary = secondaryLogos !== null;
  const resolvedSecondary =
    secondaryLogos === undefined ? [...logos].reverse() : secondaryLogos;

  return (
    <section
      {...rest}
      className={cn(
        "relative isolate flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden bg-[#08080a] text-white",
        className,
      )}
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(80,80,120,0.18)_0%,_transparent_60%)]" />
      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-6 text-center">
        {children ?? <DefaultMarqueeContent />}
      </div>
      <div
        data-slot="marquee"
        className={cn(
          "relative z-10 mt-12 flex w-full flex-col gap-6",
          showSecondary ? "sm:mt-16" : "sm:mt-20",
        )}
      >
        <LogoMarqueeRow
          logos={logos}
          speed={speed}
          direction="left"
          label="Customer logos"
        />
        {showSecondary && resolvedSecondary && resolvedSecondary.length > 0 ? (
          <LogoMarqueeRow
            logos={resolvedSecondary}
            speed={speed * 1.15}
            direction="right"
            label="More customer logos"
          />
        ) : null}
      </div>
    </section>
  );
}

function DefaultMarqueeContent() {
  return (
    <>
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, type: "spring", stiffness: 120, damping: 18 }}
        className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/70 backdrop-blur"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-white/80" aria-hidden />
        Trusted across teams
      </motion.span>
      <motion.h1
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, type: "spring", stiffness: 110, damping: 18 }}
        className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl"
      >
        The platform shipping teams ship with.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, type: "spring", stiffness: 110, damping: 18 }}
        className="mt-5 max-w-xl text-pretty text-base text-white/65 sm:text-lg"
      >
        From scrappy seed startups to public companies — UniqueUI components
        ship in production every day.
      </motion.p>
    </>
  );
}
