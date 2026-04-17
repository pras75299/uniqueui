"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useInView } from "motion/react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

export interface ScrambleTextProps {
  text: string;
  className?: string;
  speed?: number;
  scrambleDuration?: number;
  triggerOnView?: boolean;
  once?: boolean;
  characterSet?: string;
  theme?: "light" | "dark";
}

export function ScrambleText({
  text,
  className,
  speed = 30,
  scrambleDuration = 1500,
  triggerOnView = true,
  once = true,
  characterSet = CHARS,
  theme: _theme = "dark",
}: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once, amount: 0.5 });
  const hasTriggered = useRef(false);
  const intervalRef = useRef<number | null>(null);

  const scramble = useCallback(() => {
    if (isScrambling) return;
    setIsScrambling(true);

    const originalChars = text.split("");
    const totalSteps = Math.ceil(scrambleDuration / speed);
    let step = 0;

    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const intervalId = window.setInterval(() => {
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
        clearInterval(intervalId);
        intervalRef.current = null;
        setDisplayText(text);
        setIsScrambling(false);
      }
    }, speed);

    intervalRef.current = intervalId;
  }, [text, speed, scrambleDuration, characterSet, isScrambling]);

  useEffect(() => {
    if (triggerOnView && isInView && !hasTriggered.current) {
      hasTriggered.current = true;
      scramble();
    }
  }, [isInView, triggerOnView, scramble]);

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

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
