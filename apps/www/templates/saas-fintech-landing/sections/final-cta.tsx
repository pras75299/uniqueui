"use client";

import type { FintechThemeTokens } from "../components/theme";
import { Reveal } from "../components/reveal";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/** A single hairline ledger line drawing in across the dark CTA panel. */
function HairlineMark() {
  const reduceMotion = useReducedMotion();
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute -bottom-px left-0 h-px w-full"
      viewBox="0 0 600 1"
      preserveAspectRatio="none"
    >
      <motion.line
        x1="0"
        y1="0.5"
        x2="600"
        y2="0.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="600"
        strokeDashoffset={reduceMotion ? 0 : 600}
        whileInView={{ strokeDashoffset: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{
          duration: reduceMotion ? 0 : 1.6,
          ease: EASE_OUT,
        }}
        opacity="0.4"
      />
    </svg>
  );
}

export default function FinalCta({ tokens }: { tokens: FintechThemeTokens }) {
  return (
    <section id="connect" className={cn("scroll-mt-32 pb-20 sm:pb-28", tokens.pageBg)}>
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8">
        <Reveal className="relative overflow-hidden rounded-[10px] bg-[#0A0A0A] p-12 text-[#F2EFE7] sm:p-16 lg:p-20">
          {/* Subtle hairline grid behind */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(242,239,231,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(242,239,231,0.04) 1px, transparent 1px)",
              backgroundSize: "calc(100%/8) 100%, 100% 64px",
            }}
          />
          <HairlineMark />

          <div className="relative z-10 grid gap-10 md:grid-cols-[1.4fr_1fr] md:items-end">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#D88275]">
                <span className="inline-block h-px w-7 bg-current align-middle opacity-60" />
                <span className="ml-2.5">Begin</span>
              </p>
              <h2
                className={cn(
                  "mt-5 text-balance font-light leading-[1.02] tracking-[-0.02em]",
                  "text-[40px] sm:text-[56px] lg:text-[72px]",
                  tokens.serif,
                )}
              >
                <motion.span
                  className="block overflow-hidden"
                >
                  <motion.span
                    className="block"
                    initial={{ y: "100%" }}
                    whileInView={{ y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.1 }}
                  >
                    The compounding starts
                  </motion.span>
                </motion.span>
                <motion.span className="block overflow-hidden">
                  <motion.span
                    className="block italic"
                    initial={{ y: "100%" }}
                    whileInView={{ y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.22 }}
                  >
                    the day you open.
                  </motion.span>
                </motion.span>
              </h2>
            </div>

            <div className="md:pb-3">
              <p className="max-w-[40ch] text-[14px] leading-[1.6] text-[#9C988E]">
                Open an account in under three minutes. Fund it whenever you
                like. Capital is at risk; horizons are long.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-6">
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className={cn(
                    "group inline-flex h-11 items-center gap-2 rounded-full bg-[#F2EFE7] px-6 text-[13px] font-medium text-[#0A0A0A]",
                    "transition-transform duration-150 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)]",
                    "active:scale-[0.97]",
                  )}
                >
                  Open an account
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] group-hover:-translate-y-px group-hover:translate-x-px" />
                </a>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="group inline-flex items-center gap-1.5 border-b border-[#F2EFE7]/60 pb-0.5 text-[13px] font-medium text-[#F2EFE7]"
                >
                  Talk to a partner
                  <span className="transition-transform duration-200 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-0.5">
                    →
                  </span>
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
