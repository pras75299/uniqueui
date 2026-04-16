"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useInView } from "motion/react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

export interface ScrambleTextProps {
  text: string;
  className?: string;
  speed?: number;
  scrambleDuration?: number;
  triggerOnView?: boolean;
  once?: boolean;
  characterSet?: string;
}

export function ScrambleText({
  text,
  className,
  speed = 30,
  scrambleDuration = 1500,
  triggerOnView = true,
  once = true,
  characterSet = CHARS,
}: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once, amount: 0.5 });
  const hasTriggered = useRef(false);

  const scramble = useCallback(() => {
    if (isScrambling) return;
    setIsScrambling(true);

    const originalChars = text.split("");
    const totalSteps = Math.ceil(scrambleDuration / speed);
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const progress = step / totalSteps;

      const newText = originalChars
        .map((char, i) => {
          if (char === " ") return " ";
          // Characters resolve left-to-right based on progress
          if (i / originalChars.length < progress) return char;
          return characterSet[Math.floor(Math.random() * characterSet.length)];
        })
        .join("");

      setDisplayText(newText);

      if (step >= totalSteps) {
        clearInterval(interval);
        setDisplayText(text);
        setIsScrambling(false);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, scrambleDuration, characterSet, isScrambling]);

  useEffect(() => {
    if (triggerOnView && isInView && !hasTriggered.current) {
      hasTriggered.current = true;
      scramble();
    }
  }, [isInView, triggerOnView, scramble]);

  return (
    <span
      ref={ref}
      className={cn("inline-block font-mono", className)}
      onMouseEnter={() => {
        if (!triggerOnView) scramble();
      }}
    >
      {displayText.split("").map((char, i) => (
        <span
          key={i}
          className={cn(
            "inline-block transition-colors duration-150",
            isScrambling && char !== text[i]
              ? "text-purple-400"
              : "text-current"
          )}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}
