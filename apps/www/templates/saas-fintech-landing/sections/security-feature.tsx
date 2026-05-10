"use client";

import type { FintechThemeTokens } from "../components/theme";
import { cn } from "@/lib/utils";
import { Reveal } from "../components/reveal";
import { CountUp } from "../components/count-up";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/** Allocation segments — restrained palette: ink, oxblood, paper-warm. */
const allocation = [
  { label: "Equities", value: "$1.42M", weight: 0.54 },
  { label: "Fixed income", value: "$612K", weight: 0.31 },
  { label: "Cash & equivalents", value: "$298K", weight: 0.15 },
];

/** 12-month bar series — single tone, hairline-thin bars. */
const monthly = [38, 44, 41, 47, 52, 49, 56, 60, 58, 64, 70, 72];

const bullets = [
  "SOC 2 Type II · ISO 27001",
  "Cold-storage custody, segregated assets",
  "Hardware-key authentication for transfers",
];

export default function SecurityFeature({ tokens }: { tokens: FintechThemeTokens }) {
  const reduceMotion = useReducedMotion();
  const max = Math.max(...monthly);

  return (
    <section id="strategy" className={cn("scroll-mt-32 pb-20 sm:pb-28", tokens.pageBg)}>
      <div className="mx-auto grid w-full max-w-[1200px] items-start gap-14 px-5 sm:px-8 md:grid-cols-[1fr_1.05fr] md:gap-20">
        {/* Copy column */}
        <Reveal className="flex flex-col justify-center pt-4 md:pt-8">
          <p className={cn("text-[10px] font-medium uppercase tracking-[0.22em]", tokens.accentText)}>
            <span className="inline-block h-px w-7 bg-current align-middle opacity-60" />
            <span className="ml-2.5">Custody</span>
          </p>
          <h2
            className={cn(
              "mt-5 text-balance font-light leading-[1.04] tracking-[-0.02em]",
              "text-[36px] sm:text-[44px] lg:text-[52px]",
              tokens.serif,
              tokens.text,
            )}
          >
            Engineered for the
            <br />
            <span className="italic">discipline of a bank.</span>
          </h2>
          <p className={cn("mt-5 max-w-[42ch] text-[14px] leading-[1.6]", tokens.textMuted)}>
            Assets sit in segregated, name-titled custody — not on a balance
            sheet. Independent attestations are published quarterly. The
            controls a sovereign fund expects, available to a single account.
          </p>
          <ul className="mt-7 space-y-3 text-[13px]">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-2 inline-block h-px w-4 shrink-0 bg-current",
                    tokens.accentText,
                  )}
                />
                <span className={tokens.text}>{b}</span>
              </li>
            ))}
          </ul>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className={cn(
              "mt-9 inline-flex h-11 w-fit items-center gap-2 rounded-full px-6 text-[13px] font-medium",
              "transition-transform duration-150 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)]",
              "active:scale-[0.97]",
              tokens.primaryBg,
              tokens.primaryFg,
            )}
          >
            Read the controls report
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </Reveal>

        {/* Visual stack — single editorial card with monthly performance + allocation */}
        <Reveal
          delay={0.05}
          className={cn(
            "rounded-[10px] border p-7 sm:p-8",
            tokens.border,
            tokens.cardBg,
          )}
        >
          {/* Header row */}
          <div className="flex items-baseline justify-between">
            <p className={cn("text-[10px] font-medium uppercase tracking-[0.22em]", tokens.textMuted)}>
              Monthly performance · 2026
            </p>
            <span className={cn("text-[10px] tabular-nums", tokens.textSubtle)}>
              FYTD
            </span>
          </div>

          {/* Oversized number */}
          <div className="mt-4 flex items-baseline gap-3">
            <p
              className={cn(
                "text-[44px] font-light leading-none tabular-nums sm:text-[52px]",
                tokens.serif,
                tokens.text,
              )}
            >
              <CountUp value={18.42} prefix="+" decimals={2} duration={1.0} />
              <span className={tokens.textMuted}>%</span>
            </p>
            <span className={cn("text-[12px] tabular-nums", tokens.accentText)}>
              vs. +9.1% benchmark
            </span>
          </div>

          {/* Bars */}
          <div className={cn("mt-7 flex h-[120px] items-end gap-1.5", tokens.text)}>
            {monthly.map((v, i) => (
              <motion.div
                key={i}
                initial={reduceMotion ? { scaleY: v / max } : { scaleY: 0.06 }}
                whileInView={{ scaleY: v / max }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.5,
                  ease: EASE_OUT,
                  delay: 0.12 + i * 0.04,
                }}
                style={{ transformOrigin: "bottom" }}
                className={cn(
                  "h-full flex-1 origin-bottom rounded-[2px] bg-current",
                  i === monthly.length - 1 ? tokens.accentText : tokens.text,
                )}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[9px] tabular-nums">
            <span className={tokens.textSubtle}>Jan</span>
            <span className={tokens.textSubtle}>Apr</span>
            <span className={tokens.textSubtle}>Jul</span>
            <span className={tokens.textSubtle}>Oct</span>
            <span className={tokens.textSubtle}>Dec</span>
          </div>

          {/* Hairline */}
          <div className={cn("mt-7 h-px w-full border-t", tokens.borderSoft)} />

          {/* Allocation */}
          <p
            className={cn(
              "mt-6 text-[10px] font-medium uppercase tracking-[0.22em]",
              tokens.textMuted,
            )}
          >
            Allocation
          </p>
          <div className="mt-3 space-y-3.5">
            {allocation.map((a, i) => (
              <motion.div
                key={a.label}
                initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.32, ease: EASE_OUT, delay: 0.16 + i * 0.06 }}
              >
                <div className="flex items-baseline justify-between text-[12px]">
                  <span className={tokens.text}>{a.label}</span>
                  <span className={cn("tabular-nums", tokens.textMuted)}>{a.value}</span>
                </div>
                <div className={cn("mt-1.5 h-px w-full", tokens.borderSoft, "bg-current opacity-100")}>
                  <motion.div
                    initial={reduceMotion ? { scaleX: a.weight } : { scaleX: 0.02 }}
                    whileInView={{ scaleX: a.weight }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{
                      duration: reduceMotion ? 0 : 0.7,
                      ease: EASE_OUT,
                      delay: 0.2 + i * 0.08,
                    }}
                    style={{ transformOrigin: "left" }}
                    className={cn("h-px w-full bg-current", tokens.text)}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
