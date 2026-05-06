"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { FintechThemeTokens } from "../components/theme";

const accountRows = [
  { label: "65R00" },
  { label: "48R00" },
  { label: "48R00" },
];

export default function Hero({ tokens }: { tokens: FintechThemeTokens }) {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 60% 50% at 0% 0%, rgba(255,242,180,0.55), transparent 60%)",
      }}
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 pt-10 pb-16 sm:px-6 sm:pt-14 sm:pb-20 md:grid-cols-[1fr_1fr] md:gap-12 md:pt-16 md:pb-24">
        {/* Copy column */}
        <motion.div
          initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 240, damping: 26 }}
          className="space-y-6"
        >
          <h1 className="text-balance text-[44px] font-semibold leading-[1.02] tracking-[-0.02em] sm:text-[58px] lg:text-[68px]">
            Invest Intelligently,
            <br />
            Live Independently
          </h1>
          <p
            className={cn(
              "max-w-md text-[13px] leading-relaxed sm:text-[14px]",
              tokens.textMuted,
            )}
          >
            Your all-in-one solution to smarter money management. Track
            spending, set goals, and make informed financial decisions with
            clarity and ease.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className={cn(
                "inline-flex h-11 items-center rounded-md px-6 text-[13px] font-semibold transition-transform hover:-translate-y-[1px]",
                tokens.primaryBg,
                tokens.primaryFg,
              )}
            >
              Get Started
            </a>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className={cn(
                "inline-flex h-11 items-center rounded-md border bg-transparent px-6 text-[13px] font-medium transition-colors",
                tokens.outlinedBorder,
                tokens.outlinedFg,
              )}
            >
              See Details
            </a>
          </div>
        </motion.div>

        {/* Phone column */}
        <motion.div
          initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 26, delay: 0.08 }}
          className="relative mx-auto w-full max-w-[330px] sm:max-w-[360px]"
        >
          {/* Phone frame */}
          <div className="relative mx-auto h-[560px] w-[270px] rounded-[44px] border-[8px] border-[#0B0D12] bg-[#0B0D12] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45)] sm:h-[600px] sm:w-[290px]">
            <div className="relative h-full w-full overflow-hidden rounded-[36px] bg-white">
              {/* Notch */}
              <div className="absolute left-1/2 top-2.5 z-10 h-7 w-24 -translate-x-1/2 rounded-full bg-[#0B0D12]" aria-hidden>
                <span className="absolute left-[18%] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white/15" />
                <span className="absolute right-[18%] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white/15" />
              </div>

              {/* Status row */}
              <div className="flex items-center justify-between px-5 pt-4 text-[10px] font-semibold text-[#0B0D12]">
                <span className="tabular-nums">9:41</span>
                <div className="flex items-center gap-1 opacity-70">
                  <span>•••</span>
                  <span>📶</span>
                  <span>🔋</span>
                </div>
              </div>

              {/* Balance area */}
              <div className="px-5 pt-7 text-center">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#5A6072]">
                  Total Balance
                </p>
                <p className="mt-1 text-[34px] font-semibold tabular-nums leading-none text-[#0B0D12]">
                  $4,4089
                </p>
              </div>

              {/* Tabs */}
              <div className="mx-5 mt-5 flex items-center rounded-full bg-[#F1F2F6] p-1 text-[11px] font-semibold">
                <span className="flex flex-1 items-center justify-center gap-1 rounded-full bg-[#0B0D12] py-1.5 text-white">
                  <span className="text-[9px]">↗</span> Payout
                </span>
                <span className="flex flex-1 items-center justify-center gap-1 rounded-full py-1.5 text-[#5A6072]">
                  Card
                </span>
              </div>

              {/* Total payout row */}
              <div className="mx-5 mt-4">
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#5A6072]">
                  Total Payout
                </p>
                <div className="mt-1 flex items-end justify-between">
                  <p className="text-[28px] font-semibold tabular-nums leading-none text-[#0B0D12]">
                    $1,469
                  </p>
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[10px] font-semibold text-emerald-600">
                    Get Paid
                  </span>
                </div>
              </div>

              {/* Account list */}
              <div className="mx-5 mt-5 space-y-3">
                {accountRows.map((r, i) => (
                  <motion.div
                    key={i}
                    initial={reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 28,
                      delay: 0.4 + i * 0.07,
                    }}
                    className="flex items-center justify-between border-b border-[#EFF1F5] pb-2 text-[11px]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded-full bg-[#F1F2F6]" />
                      <span className="text-[10px] text-[#5A6072]">Account {i + 1}</span>
                    </div>
                    <span className="font-semibold tabular-nums text-[#0B0D12]">
                      {r.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating chip — On Saves (top-right) */}
          <motion.div
            initial={reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 26, delay: 0.25 }}
            className={cn(
              "absolute -right-4 top-[18%] hidden rounded-xl border px-4 py-2.5 shadow-[0_12px_30px_-10px_rgba(11,13,18,0.18)] sm:flex sm:flex-col",
              tokens.border,
              tokens.cardBg,
            )}
          >
            <span className="flex items-center gap-1.5 text-[10px] text-[#5A6072]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0B0D12]" /> On Saves
            </span>
            <span className="mt-0.5 text-[14px] font-semibold tabular-nums">
              $ 10,400.22
            </span>
          </motion.div>

          {/* Floating chip — Total Expends (bottom-left) */}
          <motion.div
            initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 26, delay: 0.35 }}
            className={cn(
              "absolute -left-4 bottom-[22%] hidden rounded-xl border px-3.5 py-2.5 shadow-[0_12px_30px_-10px_rgba(11,13,18,0.18)] sm:block",
              tokens.border,
              tokens.cardBg,
            )}
          >
            <span className="flex items-center gap-1.5 text-[10px] text-[#5A6072]">
              <span className="rounded-md bg-[#F1F2F6] px-1 py-px text-[9px]">📊</span>
              Total Expends
            </span>
            <p className="mt-0.5 text-[14px] font-semibold tabular-nums">$659.00</p>
            <p className="mt-0.5 flex items-center gap-1 text-[9px] font-semibold text-emerald-600">
              <ArrowUpRight className="h-2.5 w-2.5" />
              5.23% <span className="font-normal text-[#9097A8]">vs last month</span>
            </p>
          </motion.div>

          {/* Floating chip — Cash Available (bottom-mid) */}
          <motion.div
            initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 26, delay: 0.45 }}
            className={cn(
              "absolute -bottom-2 left-1/2 hidden -translate-x-1/3 rounded-xl border px-3.5 py-2.5 shadow-[0_12px_30px_-10px_rgba(11,13,18,0.18)] sm:block",
              tokens.border,
              tokens.cardBg,
            )}
          >
            <span className="flex items-center gap-1.5 text-[10px] text-[#5A6072]">
              <span className="rounded-md bg-[#F1F2F6] px-1 py-px text-[9px]">💸</span>
              Cash Available
            </span>
            <p className="mt-0.5 text-[14px] font-semibold tabular-nums">$546.00</p>
            <p className="mt-0.5 flex items-center gap-1 text-[9px] font-semibold text-rose-500">
              <ArrowDownRight className="h-2.5 w-2.5" />
              5.23% <span className="font-normal text-[#9097A8]">vs last month</span>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
