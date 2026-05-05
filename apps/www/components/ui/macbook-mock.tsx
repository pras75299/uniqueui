"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

const DEFAULT_REVEAL_SRC =
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80";

const LID_CLOSED_DEG = -66;
const LID_OPEN_DEG = 10;

const springLid = { type: "spring" as const, stiffness: 340, damping: 30 };
const springFlap = { type: "spring" as const, stiffness: 380, damping: 28 };
const fadeCross = {
  type: "tween" as const,
  ease: [0.22, 1, 0.36, 1] as const,
  duration: 0.6,
};

const SIZE = {
  sm: { wrap: "w-60", lidH: "h-32" },
  md: { wrap: "w-80", lidH: "h-44" },
  lg: { wrap: "w-[28rem]", lidH: "h-56" },
} as const;

const TINTS = {
  spaceGray: {
    lidShell: "bg-linear-to-b from-neutral-700 to-neutral-800",
    lidRing: "ring-black/40",
    base: "bg-linear-to-b from-neutral-800 via-neutral-900 to-neutral-950",
    hinge: "bg-neutral-600/90",
  },
  silver: {
    lidShell: "bg-linear-to-b from-neutral-200 to-neutral-300",
    lidRing: "ring-black/15",
    base: "bg-linear-to-b from-neutral-200 via-neutral-300 to-neutral-400",
    hinge: "bg-neutral-400",
  },
  midnight: {
    lidShell: "bg-linear-to-b from-neutral-800 to-black",
    lidRing: "ring-black/60",
    base: "bg-linear-to-b from-neutral-900 via-black to-black",
    hinge: "bg-neutral-700",
  },
} as const;

export type MacbookMockProps = {
  className?: string;
  size?: keyof typeof SIZE;
  tint?: keyof typeof TINTS;
  /** Idle screen fill (Tailwind classes). */
  screenIdleClassName?: string;
  /** Image URL revealed on hover. Ignored when `screenContent` is provided. */
  revealSrc?: string;
  revealAlt?: string;
  /** Custom React node rendered into the screen — overrides `revealSrc`. */
  screenContent?: ReactNode;
  /** `fade` crossfades; `flap` folds the top half of the idle layer back in 3D. */
  revealMode?: "fade" | "flap";
  /** Keep the lid open without requiring hover. */
  open?: boolean;
  /** Ignore hover entirely; only the `open` prop controls lid state. */
  hoverDisabled?: boolean;
};

export function MacbookMock({
  className,
  size = "md",
  tint = "spaceGray",
  screenIdleClassName = "bg-[#121212]",
  revealSrc = DEFAULT_REVEAL_SRC,
  revealAlt = "Laptop screen content",
  screenContent,
  revealMode = "fade",
  open = false,
  hoverDisabled = false,
}: MacbookMockProps) {
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const isOpen = hoverDisabled ? open : hovered || open;
  const t = TINTS[tint];
  const s = SIZE[size];

  type Stage = "idle" | "loading" | "done";
  const [stage, setStage] = useState<Stage>("idle");
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    setStage(isOpen ? (reduceMotion ? "done" : "loading") : "idle");
  }
  useEffect(() => {
    if (!isOpen || reduceMotion) return;
    const tid = setTimeout(() => setStage("done"), 850);
    return () => clearTimeout(tid);
  }, [isOpen, reduceMotion]);

  const lidTransition = reduceMotion ? { duration: 0.01 } : springLid;
  const flapTransition = reduceMotion ? { duration: 0.01 } : springFlap;
  const fadeTransition = reduceMotion ? { duration: 0.01 } : fadeCross;

  const rotateX = reduceMotion
    ? LID_CLOSED_DEG
    : isOpen
    ? LID_OPEN_DEG
    : LID_CLOSED_DEG;

  return (
    <div
      role="presentation"
      className={cn(
        "flex cursor-default flex-col items-center text-neutral-400",
        className,
      )}
      onPointerEnter={() => !hoverDisabled && setHovered(true)}
      onPointerLeave={() => !hoverDisabled && setHovered(false)}
    >
      <div className={cn("mx-auto [perspective:1400px]", s.wrap)}>
        {/* Lid */}
        <motion.div
          className={cn(
            "mx-auto w-[90%] rounded-tl-lg rounded-tr-lg p-1.5 shadow-md ring-1 ring-inset",
            s.lidH,
            t.lidShell,
            t.lidRing,
          )}
          style={{
            transformOrigin: "center bottom",
            transformStyle: "preserve-3d",
          }}
          animate={{ rotateX }}
          transition={lidTransition}
        >
          <div
            className={cn(
              "relative h-full w-full overflow-hidden rounded-tl rounded-tr-lg rounded-br-sm rounded-bl-sm ring-1 ring-black/50",
              revealMode === "flap" &&
                "[perspective:900px] [transform-style:preserve-3d]",
            )}
          >
            {/* Reveal layer: image OR custom node, sits behind the idle fill */}
            <div className="absolute inset-0 z-0">
              <motion.div
                className={cn(
                  "relative h-full w-full",
                  revealMode === "flap" && "origin-top",
                )}
                initial={false}
                animate={{
                  opacity: revealMode === "fade" ? (isOpen ? 1 : 0) : 1,
                }}
                transition={fadeTransition}
              >
                {screenContent ? (
                  <div className="h-full w-full">{screenContent}</div>
                ) : (
                  // Plain <img> keeps the component framework-agnostic when copy-pasted.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={revealAlt}
                    src={revealSrc}
                    className={cn(
                      "h-full w-full object-cover",
                      revealMode === "flap" && "object-top",
                    )}
                    loading="lazy"
                    decoding="async"
                  />
                )}
              </motion.div>
            </div>

            {/* Idle fill */}
            {revealMode === "fade" ? (
              <motion.div
                className={cn("absolute inset-0 z-[2]", screenIdleClassName)}
                initial={false}
                animate={{ opacity: isOpen ? 0 : 1 }}
                transition={fadeTransition}
              />
            ) : (
              <>
                <div
                  className={cn(
                    "absolute inset-x-0 top-1/2 bottom-0 z-[2]",
                    screenIdleClassName,
                  )}
                />
                <motion.div
                  className={cn(
                    "absolute inset-x-0 top-0 z-[3] h-1/2 shadow-[0_6px_16px_rgba(0,0,0,0.35)]",
                    screenIdleClassName,
                  )}
                  style={{
                    transformOrigin: "center bottom",
                    transformStyle: "preserve-3d",
                    backfaceVisibility: "hidden",
                  }}
                  initial={false}
                  animate={{
                    rotateX: reduceMotion ? 0 : isOpen ? -118 : 0,
                  }}
                  transition={flapTransition}
                />
              </>
            )}

            {/* Dynamic island — idle dots → loader wave → AirPods message */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20">
              <div className="flex w-full items-start justify-center pt-1.5">
                <div className="relative h-2.5 min-w-[4.5rem] overflow-hidden rounded-full bg-black px-1">
                  {/* Idle: 3 static dots */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center gap-px"
                    animate={{ opacity: stage === "idle" ? 1 : 0 }}
                    transition={{ duration: 0.15 }}
                    aria-hidden
                  >
                    <div className="h-0.5 w-0.5 rounded-full bg-neutral-600" />
                    <div className="h-0.5 w-0.5 rounded-full bg-neutral-600" />
                    <div className="h-0.5 w-0.5 rounded-full bg-neutral-600" />
                  </motion.div>

                  {/* Loading: 3 dots wave */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center gap-px"
                    animate={{ opacity: stage === "loading" ? 1 : 0 }}
                    transition={{ duration: 0.15 }}
                    aria-hidden
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="h-0.5 w-0.5 rounded-full bg-white"
                        animate={
                          stage === "loading" && !reduceMotion
                            ? { opacity: [0.3, 1, 0.3], y: [0, -1, 0] }
                            : { opacity: 1, y: 0 }
                        }
                        transition={{
                          duration: 0.7,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.12,
                        }}
                      />
                    ))}
                  </motion.div>

                  {/* Done: AirPods Connected */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center gap-0.5 px-0.5"
                    initial={false}
                    animate={{ opacity: stage === "done" ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                    aria-hidden
                  >
                    <span className="max-w-[3.25rem] truncate text-[3px] leading-none font-medium text-white">
                      AirPods Connected
                    </span>
                    <div className="flex h-1 w-2 shrink-0 items-center rounded-xs border border-emerald-500/80">
                      <div className="h-full w-[82%] bg-emerald-500" />
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Base — thin hinge bar */}
        <div
          className={cn(
            "relative h-3.5 w-full rounded-tl-md rounded-tr-md rounded-br-3xl rounded-bl-3xl shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset]",
            t.base,
          )}
        >
          <div
            className={cn(
              "absolute inset-x-0 top-0 mx-auto h-1.5 w-12 rounded-br-sm rounded-bl-sm",
              t.hinge,
            )}
          />
        </div>
      </div>
    </div>
  );
}
