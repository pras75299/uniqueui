"use client";

import type { FintechThemeTokens } from "../components/theme";
import { cn } from "@/lib/utils";
import { Reveal } from "../components/reveal";
import { StaggerGroup, StaggerItem } from "../components/stagger";
import { motion, useReducedMotion } from "motion/react";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

const outlets = [
  { name: "Bloomberg", className: "font-medium tracking-[-0.01em]" },
  { name: "Financial Times", className: "italic font-medium tracking-[-0.01em]" },
  { name: "The Economist", className: "font-medium tracking-tight" },
  { name: "Reuters", className: "font-bold tracking-tight" },
  { name: "Barron's", className: "font-medium" },
];

/** Draws in left-to-right when the strip enters view. */
function HairlineRule({ tokens, position }: { tokens: FintechThemeTokens; position: "top" | "bottom" }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      aria-hidden
      initial={reduceMotion ? { scaleX: 1 } : { scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: reduceMotion ? 0 : 0.9, ease: EASE_OUT, delay: position === "top" ? 0.05 : 0.18 }}
      style={{ transformOrigin: "left" }}
      className={cn("h-px w-full bg-current opacity-50", tokens.text)}
    />
  );
}

export default function LogoStrip({ tokens }: { tokens: FintechThemeTokens }) {
  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8">
        <Reveal>
          <p
            className={cn(
              "mb-7 text-center text-[10px] font-medium uppercase tracking-[0.28em]",
              tokens.textSubtle,
            )}
          >
            As covered in
          </p>
        </Reveal>

        <HairlineRule tokens={tokens} position="top" />

        <StaggerGroup
          stagger={0.07}
          delay={0.15}
          className="flex flex-wrap items-center justify-center gap-x-12 gap-y-5 py-7 sm:justify-around"
        >
          {outlets.map(({ name, className }) => (
            <StaggerItem key={name} as="span" y={6}>
              <span
                className={cn(
                  "inline-block select-none text-[18px] sm:text-[20px]",
                  tokens.text,
                  "opacity-50 transition-opacity duration-150 hover:opacity-100",
                  className,
                )}
              >
                {name}
              </span>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <HairlineRule tokens={tokens} position="bottom" />
      </div>
    </section>
  );
}
