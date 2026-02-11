"use client";
import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export interface TypewriterTextProps {
  words: string[];
  className?: string;
  cursorClassName?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  delayBetweenWords?: number;
  loop?: boolean;
  cursor?: boolean;
}

export function TypewriterText({
  words,
  className,
  cursorClassName,
  typingSpeed = 80,
  deletingSpeed = 50,
  delayBetweenWords = 1500,
  loop = true,
  cursor = true,
}: TypewriterTextProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleTyping = useCallback(() => {
    const currentWord = words[currentWordIndex];

    if (!isDeleting) {
      setCurrentText(currentWord.substring(0, currentText.length + 1));

      if (currentText === currentWord) {
        if (!loop && currentWordIndex === words.length - 1) return;
        setTimeout(() => setIsDeleting(true), delayBetweenWords);
        return;
      }
    } else {
      setCurrentText(currentWord.substring(0, currentText.length - 1));

      if (currentText === "") {
        setIsDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
        return;
      }
    }
  }, [currentText, currentWordIndex, isDeleting, words, loop, delayBetweenWords]);

  useEffect(() => {
    const timeout = setTimeout(
      handleTyping,
      isDeleting ? deletingSpeed : typingSpeed
    );
    return () => clearTimeout(timeout);
  }, [handleTyping, isDeleting, deletingSpeed, typingSpeed]);

  return (
    <span className={cn("inline-flex items-center", className)}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={currentText}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          className="inline-block"
        >
          {currentText}
        </motion.span>
      </AnimatePresence>
      {cursor && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            repeatType: "loop",
          }}
          className={cn(
            "inline-block w-[2px] h-[1em] bg-current ml-0.5 align-middle",
            cursorClassName
          )}
        />
      )}
    </span>
  );
}
