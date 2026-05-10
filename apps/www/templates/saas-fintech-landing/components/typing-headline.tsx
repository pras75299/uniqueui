"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/**
 * One word of the typing headline. Each character animates in with a
 * staggered delay computed by the parent so the whole line types out
 * left → right. The word itself is a hover target — moving the cursor
 * over a word lifts it 4px so the headline becomes touchable typography.
 */
function Word({
  text,
  italic,
  startIndex,
  charDelay,
  duration,
  reduceMotion,
}: {
  text: string;
  italic?: boolean;
  startIndex: number;
  charDelay: number;
  duration: number;
  reduceMotion: boolean | null;
}) {
  const reduce = !!reduceMotion;
  return (
    <span
      className={cn(
        "inline-block",
        "[transition-property:transform] duration-300 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)]",
        "hover:-translate-y-1",
        italic && "italic",
      )}
    >
      {Array.from(text).map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden
          initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduce ? 0 : duration,
            ease: EASE_OUT,
            delay: reduce ? 0 : (startIndex + i) * charDelay,
          }}
          className="inline-block"
        >
          {ch === " " ? " " : ch}
        </motion.span>
      ))}
    </span>
  );
}

type Token = { text: string; italic?: boolean } | { lineBreak: true };

/**
 * Editorial typing headline. Renders tokens (words and line breaks),
 * each character animates in left→right via stagger, a soft caret blinks
 * at the end of the typed text, and each word is independently
 * hover-liftable.
 *
 * Tokens are passed as an array, with `lineBreak: true` markers between
 * lines. The caret moves to the last character once typing completes
 * and then blinks indefinitely (CSS keyframe).
 */
export function TypingHeadline({
  tokens,
  charDelay = 0.028,
  charDuration = 0.18,
  className,
  caretClassName,
  ariaLabel,
}: {
  tokens: Token[];
  /** Delay between each character's stagger (s). */
  charDelay?: number;
  /** Per-character entrance duration (s). */
  charDuration?: number;
  className?: string;
  caretClassName?: string;
  ariaLabel: string;
}) {
  const reduceMotion = useReducedMotion();

  // Compute total visible characters (excluding line breaks) so we know
  // when the caret should arrive at the end and start blinking.
  const totalChars = tokens.reduce(
    (acc, t) => acc + ("lineBreak" in t ? 0 : t.text.length),
    0,
  );
  const totalDelay = totalChars * charDelay + charDuration;

  // Caret state: visible during typing → blinking after.
  const [typingDone, setTypingDone] = useState(!!reduceMotion);
  useEffect(() => {
    if (reduceMotion) return;
    const t = setTimeout(() => setTypingDone(true), totalDelay * 1000);
    return () => clearTimeout(t);
  }, [totalDelay, reduceMotion]);

  // Precompute each token's char-offset so we can stagger the typing without
  // mutating state during render.
  const offsets: number[] = [];
  tokens.reduce((acc, tok) => {
    offsets.push(acc);
    return acc + ("lineBreak" in tok ? 0 : tok.text.length);
  }, 0);

  return (
    <span
      aria-label={ariaLabel}
      className={cn("relative inline-block", className)}
    >
      {tokens.map((tok, idx) => {
        if ("lineBreak" in tok) {
          return <br key={`br-${idx}`} />;
        }
        const nextTok = tokens[idx + 1];
        const showSpace = !!nextTok && !("lineBreak" in nextTok);
        return (
          <span key={`w-${idx}`}>
            <Word
              text={tok.text}
              italic={tok.italic}
              startIndex={offsets[idx]}
              charDelay={charDelay}
              duration={charDuration}
              reduceMotion={reduceMotion}
            />
            {showSpace && <span aria-hidden> </span>}
          </span>
        );
      })}
      {/* Caret — fades in with the last character, then blinks. */}
      <motion.span
        aria-hidden
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.2,
          ease: EASE_OUT,
          delay: reduceMotion ? 0 : Math.max(0, totalDelay - 0.15),
        }}
        className={cn(
          "ml-1 inline-block h-[0.85em] w-[2px] translate-y-[0.08em] align-baseline bg-current",
          typingDone && "animate-caret-blink",
          caretClassName,
        )}
      />
    </span>
  );
}
