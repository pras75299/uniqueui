"use client";

import type { FintechThemeTokens } from "../components/theme";
import { cn } from "@/lib/utils";
import { Reveal } from "../components/reveal";
import { StaggerGroup, StaggerItem } from "../components/stagger";
import { CountUp } from "../components/count-up";
import { ArrowUpRight } from "lucide-react";

const transactions = [
  { date: "May 09", desc: "Treasury sweep", amount: "+$24,000.00", positive: true },
  { date: "May 08", desc: "Aalto Industries · DRIP", amount: "+$1,420.18", positive: true },
  { date: "May 06", desc: "Quarterly fee", amount: "−$182.50", positive: false },
  { date: "May 02", desc: "Wire — institutional", amount: "+$50,000.00", positive: true },
];

const bullets = [
  "Sub-second internal settlement",
  "Real-time treasury sweeps to yield",
  "Programmatic execution via the Bayard API",
];

export default function PaymentsFeature({ tokens }: { tokens: FintechThemeTokens }) {
  return (
    <section id="markets" className={cn("scroll-mt-32 py-20 sm:py-28", tokens.pageBg)}>
      <div className="mx-auto grid w-full max-w-[1200px] items-start gap-14 px-5 sm:px-8 md:grid-cols-[1fr_1fr] md:gap-20">
        {/* Visual: editorial transactions ledger */}
        <Reveal
          className={cn(
            "rounded-[10px] border p-7 sm:p-8",
            tokens.border,
            tokens.cardBg,
          )}
        >
          {/* Header */}
          <div className="flex items-baseline justify-between">
            <p className={cn("text-[10px] font-medium uppercase tracking-[0.22em]", tokens.textMuted)}>
              Transactions · Last 7 days
            </p>
            <span className={cn("text-[10px] tabular-nums", tokens.textSubtle)}>
              4 of 12
            </span>
          </div>

          {/* Net flow oversized */}
          <p
            className={cn(
              "mt-4 text-[44px] font-light leading-none tabular-nums sm:text-[52px]",
              tokens.serif,
              tokens.text,
            )}
          >
            <CountUp value={75237.68} prefix="+$" decimals={2} duration={1.0} />
          </p>
          <p className={cn("mt-2 text-[12px]", tokens.textMuted)}>
            Net flow this week
          </p>

          {/* Hairline rule */}
          <div className={cn("mt-6 h-px w-full border-t", tokens.borderSoft)} />

          {/* Transaction rows — staggered fade as ledger entries posting */}
          <StaggerGroup className="mt-2" stagger={0.07} delay={0.25}>
            {transactions.map((t, i) => (
              <StaggerItem
                key={t.desc + i}
                as="div"
                y={6}
                className={cn(
                  "grid grid-cols-[60px_1fr_auto] items-center gap-3 py-3 text-[12px]",
                  i !== 0 && cn("border-t", tokens.borderSoft),
                )}
              >
                <span className={cn("tabular-nums", tokens.textSubtle)}>{t.date}</span>
                <span className={cn("truncate", tokens.text)}>{t.desc}</span>
                <span
                  className={cn(
                    "tabular-nums",
                    t.positive ? tokens.accentText : tokens.textMuted,
                  )}
                >
                  {t.amount}
                </span>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Reveal>

        {/* Copy column */}
        <Reveal delay={0.05} className="flex flex-col justify-center pt-4 md:pt-8">
          <p className={cn("text-[10px] font-medium uppercase tracking-[0.22em]", tokens.accentText)}>
            <span className="inline-block h-px w-7 bg-current align-middle opacity-60" />
            <span className="ml-2.5">Movement</span>
          </p>
          <h2
            className={cn(
              "mt-5 text-balance font-light leading-[1.04] tracking-[-0.02em]",
              "text-[36px] sm:text-[44px] lg:text-[52px]",
              tokens.serif,
              tokens.text,
            )}
          >
            Money moves like a wire,
            <br />
            <span className="italic">priced like a transfer.</span>
          </h2>
          <p className={cn("mt-5 max-w-[42ch] text-[14px] leading-[1.6]", tokens.textMuted)}>
            Every dollar in a Bayard account earns from the moment it lands.
            Internal payments settle in milliseconds; external rails clear at
            interbank cost. There is no float.
          </p>
          <ul className="mt-7 space-y-3 text-[13px]">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-2 inline-block h-px w-4 shrink-0",
                    "bg-current",
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
              "group mt-9 inline-flex h-11 w-fit items-center gap-2 rounded-full px-6 text-[13px] font-medium",
              "transition-transform duration-150 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)]",
              "active:scale-[0.97]",
              tokens.primaryBg,
              tokens.primaryFg,
            )}
          >
            Open an account
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] group-hover:-translate-y-px group-hover:translate-x-px" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
