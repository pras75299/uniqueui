"use client";

import { createContext, useContext, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

const fineHover =
  "[@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_0_6px_0_rgba(0,0,0,0.3),0_0.5px_0.5px_0_rgba(0,0,0,0.1),inset_0_0.5px_0_0_rgba(255,255,255,1)]";
const fineHoverDark =
  "dark:[@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_0_6px_0_rgba(255,255,255,0.2),0_0.5px_0.5px_0_rgba(0,0,0,0.3),inset_0_0.5px_0_0_rgba(255,255,255,0.1)]";

const keyCap = cn(
  "flex cursor-default items-center justify-center rounded-[2px] bg-neutral-100 text-[3px] font-medium text-neutral-700",
  "shadow-[0_0.5px_0.5px_0_rgba(0,0,0,0.1),inset_0_0.5px_0_0_rgba(255,255,255,1)] transition-shadow duration-150",
  fineHover,
  "dark:bg-neutral-700 dark:text-neutral-300",
  "dark:shadow-[0_0.5px_0.5px_0_rgba(0,0,0,0.3),inset_0_0.5px_0_0_rgba(255,255,255,0.1)]",
  fineHoverDark,
);

const KeysClassContext = createContext<string | undefined>(undefined);

function ModKey({
  className,
  children,
}: {
  className: string;
  children?: ReactNode;
}) {
  const keysClassName = useContext(KeysClassContext);
  return <div className={cn(keyCap, keysClassName, className)}>{children}</div>;
}

function Key({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <ModKey className={cn("h-3 w-3", className)}>{children}</ModKey>;
}

export type MiniMacKeyboardProps = {
  /** Tailwind on the transform layer (scale, translate) inside the motion enter wrapper. */
  wrapperClassName?: string;
  /** Merged onto the outer keyboard chassis (bezel). */
  className?: string;
  /** Merged onto every key cap after defaults — e.g. `bg-zinc-800 text-zinc-100 dark:bg-zinc-950`. */
  keysClassName?: string;
  /** Merged onto the power-indicator outer ring inside the F12 key. */
  indicatorRingClassName?: string;
  /** Merged onto the power-indicator inner dot. */
  indicatorDotClassName?: string;
};

const defaultTransform = cn(
  "origin-center translate-x-8 translate-y-6 scale-[1.85] sm:translate-x-10 sm:translate-y-6 sm:scale-[2.2] md:translate-x-10 md:-translate-y-2",
);

/**
 * Decorative compact Mac-style keyboard built from layered divs (no images).
 * Keys are non-interactive except hover shine; use for hero or device mockups.
 */
export function MiniMacKeyboard({
  wrapperClassName,
  className,
  keysClassName,
  indicatorRingClassName,
  indicatorDotClassName,
}: MiniMacKeyboardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      role="img"
      aria-label="Decorative illustration of a compact Mac-style keyboard"
      className="mx-auto w-fit"
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
    >
      <div className={cn(defaultTransform, wrapperClassName)}>
        <KeysClassContext.Provider value={keysClassName}>
          <div
            className={cn(
              "rounded-xl bg-neutral-200 p-[3px] shadow-sm ring-1 ring-black/5 dark:bg-neutral-800 dark:ring-white/10",
              className,
            )}
          >
            <div className="mb-px flex gap-px">
              <Key className="w-5 rounded-tl-lg">esc</Key>
              {[
                "F1",
                "F2",
                "F3",
                "F4",
                "F5",
                "F6",
                "F7",
                "F8",
                "F9",
                "F10",
                "F11",
                "F12",
              ].map((label) => (
                <Key key={label}>{label}</Key>
              ))}
              <Key className="rounded-tr-lg">
                <div
                  className={cn(
                    "size-1.5 rounded-full bg-linear-to-b from-neutral-300 via-neutral-200 to-neutral-300 p-px dark:from-neutral-600 dark:via-neutral-700 dark:to-neutral-600",
                    indicatorRingClassName,
                  )}
                >
                  <div
                    className={cn(
                      "size-full rounded-full bg-neutral-100 dark:bg-neutral-800",
                      indicatorDotClassName,
                    )}
                  />
                </div>
              </Key>
            </div>

            <div className="mb-px flex gap-px">
              {[
                "~",
                "1",
                "2",
                "3",
                "4",
                "5",
                "6",
                "7",
                "8",
                "9",
                "0",
                "-",
                "=",
              ].map((c) => (
                <Key key={c}>{c}</Key>
              ))}
              <ModKey className="h-3 w-5 text-[3px] font-medium">delete</ModKey>
            </div>

            <div className="mb-px flex gap-px">
              <ModKey className="h-3 w-5 text-[3px] font-medium">tab</ModKey>
              {[
                "Q",
                "W",
                "E",
                "R",
                "T",
                "Y",
                "U",
                "I",
                "O",
                "P",
                "[",
                "]",
                "\\",
              ].map((c) => (
                <Key key={c}>{c}</Key>
              ))}
            </div>

            <div className="mb-px flex gap-px">
              <ModKey className="h-3 w-[22px] text-[3px] font-medium">
                caps
              </ModKey>
              {["A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'"].map(
                (c) => (
                  <Key key={c}>{c}</Key>
                ),
              )}
              <ModKey className="h-3 w-[23px] text-[3px] font-medium">
                return
              </ModKey>
            </div>

            <div className="mb-px flex gap-px">
              <ModKey className="h-3 w-[29px] text-[3px] font-medium">
                shift
              </ModKey>
              {["Z", "X", "C", "V", "B", "N", "M", ",", ".", "/"].map((c) => (
                <Key key={c}>{c}</Key>
              ))}
              <ModKey className="h-3 w-[29px] text-[3px] font-medium">
                shift
              </ModKey>
            </div>

            <div className="mb-px flex gap-px">
              <Key className="rounded-bl-lg">fn</Key>
              <Key>ctrl</Key>
              <Key>opt</Key>
              <ModKey className="h-3 w-4 text-[3px] font-medium">cmd</ModKey>
              <ModKey className="h-3 w-[66px]" />
              <ModKey className="h-3 w-4 text-[3px] font-medium">cmd</ModKey>
              <Key>opt</Key>
              <div className="flex h-3 items-center gap-px rounded-[2px]">
                <Key>←</Key>
                <div className="flex flex-col gap-px">
                  <ModKey className="h-[5.5px] w-3 text-[3px] font-medium">
                    ↑
                  </ModKey>
                  <ModKey className="h-[5.5px] w-3 text-[3px] font-medium">
                    ↓
                  </ModKey>
                </div>
                <ModKey className="h-3 w-3 rounded-br-lg text-[3px] font-medium">
                  →
                </ModKey>
              </div>
            </div>
          </div>
        </KeysClassContext.Provider>
      </div>
    </motion.div>
  );
}
