"use client";

import type { FintechThemeTokens } from "../components/theme";
import { cn } from "@/lib/utils";
import { Reveal } from "../components/reveal";
import { motion, useReducedMotion } from "motion/react";
import { ChevronRight } from "lucide-react";

const audienceBars = [
  { male: 40, female: 65 },
  { male: 70, female: 50 },
  { male: 55, female: 80 },
  { male: 90, female: 70 },
];

const categories = [
  { label: "Smartphones", value: "$98K", color: "#7DD3FC" },
  { label: "Tablets", value: "$72K", color: "#0B0D12" },
  { label: "Laptops", value: "$26K", color: "#FACC15" },
];

export default function SecurityFeature({ tokens }: { tokens: FintechThemeTokens }) {
  const reduceMotion = useReducedMotion();

  // Donut math
  const radius = 32;
  const circ = 2 * Math.PI * radius;
  const segments = [
    { offset: 0, length: circ * 0.4, color: "#7DD3FC" },
    { offset: circ * 0.4, length: circ * 0.32, color: "#0B0D12" },
    { offset: circ * 0.72, length: circ * 0.18, color: "#FACC15" },
  ];

  return (
    <section className="pb-14 sm:pb-20">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 sm:px-6 md:grid-cols-[1fr_1.1fr] md:gap-16">
        {/* Copy column */}
        <Reveal className="flex flex-col justify-center">
          <h2 className="text-balance text-[34px] font-semibold leading-[1.06] tracking-[-0.01em] sm:text-[44px]">
            Sell Smarter With Fast,
            <br />
            Secure Payments
          </h2>
          <p className={cn("mt-4 max-w-md text-[13px] leading-relaxed", tokens.textMuted)}>
            Make every transaction count with a payment system that&apos;s built
            for speed and security.
          </p>
          <ul className="mt-6 space-y-3 text-[14px]">
            {["Instant Payment Insights", "Track Payments Instantly"].map((b) => (
              <li key={b} className="flex items-start gap-2">
                <ChevronRight className={cn("mt-0.5 h-4 w-4 shrink-0", tokens.textMuted)} />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className={cn(
              "mt-7 inline-flex h-11 w-fit items-center rounded-md px-6 text-[13px] font-semibold transition-transform hover:-translate-y-[1px]",
              tokens.primaryBg,
              tokens.primaryFg,
            )}
          >
            See Details
          </a>
        </Reveal>

        {/* Visual stack */}
        <Reveal delay={0.05} className="relative h-[360px] sm:h-[400px]">
          {/* Audience bar chart card */}
          <motion.div
            initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ type: "spring", stiffness: 220, damping: 24, delay: 0.05 }}
            className={cn(
              "absolute left-0 top-0 w-[260px] rounded-2xl border p-4 shadow-[0_18px_40px_-18px_rgba(11,13,18,0.16)]",
              tokens.border,
              tokens.cardBg,
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-[#7DD3FC]" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em]">
                  Audience
                </span>
              </div>
              <span className={cn("text-[9px]", tokens.textSubtle)}>Last 6 months ›</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-[22px] font-semibold tabular-nums">240.8K</span>
              <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-600">
                +24.4%
              </span>
            </div>
            <div className={cn("mt-3 flex h-24 items-end gap-3", tokens.text)}>
              {audienceBars.map((b, i) => (
                <div key={i} className="flex flex-1 items-end gap-1">
                  <motion.div
                    initial={reduceMotion ? { scaleY: b.male / 100 } : { scaleY: 0 }}
                    whileInView={{ scaleY: b.male / 100 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ type: "spring", stiffness: 220, damping: 24, delay: i * 0.06 }}
                    style={{ transformOrigin: "bottom" }}
                    className="h-full flex-1 rounded-sm bg-[#0B0D12]"
                  />
                  <motion.div
                    initial={reduceMotion ? { scaleY: b.female / 100 } : { scaleY: 0 }}
                    whileInView={{ scaleY: b.female / 100 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ type: "spring", stiffness: 220, damping: 24, delay: i * 0.06 + 0.04 }}
                    style={{ transformOrigin: "bottom" }}
                    className="h-full flex-1 rounded-sm bg-[#7DD3FC]"
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-3 text-[9px]">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0B0D12]" /> Male
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#7DD3FC]" /> Female
              </span>
            </div>
          </motion.div>

          {/* Product categories card */}
          <motion.div
            initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ type: "spring", stiffness: 220, damping: 24, delay: 0.15 }}
            className={cn(
              "absolute right-0 top-6 w-[270px] rounded-2xl border p-4 shadow-[0_18px_40px_-18px_rgba(11,13,18,0.16)]",
              tokens.border,
              tokens.cardBg,
            )}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em]">
              Product categories
            </p>
            <div className="mt-3 flex items-center gap-4">
              <svg width="92" height="92" viewBox="0 0 92 92" className="shrink-0">
                <circle cx="46" cy="46" r={radius} fill="none" stroke="#EFF1F5" strokeWidth="10" />
                {segments.map((s, i) => (
                  <motion.circle
                    key={i}
                    cx="46"
                    cy="46"
                    r={radius}
                    fill="none"
                    stroke={s.color}
                    strokeWidth="10"
                    strokeLinecap="butt"
                    strokeDasharray={`${s.length} ${circ}`}
                    transform={`rotate(${(s.offset / circ) * 360 - 90} 46 46)`}
                    initial={reduceMotion ? { strokeDashoffset: 0 } : { strokeDashoffset: s.length }}
                    whileInView={{ strokeDashoffset: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 + i * 0.1 }}
                  />
                ))}
                <text x="46" y="44" textAnchor="middle" className="fill-current text-[8px] font-semibold opacity-70">Total</text>
                <text x="46" y="56" textAnchor="middle" className="fill-current text-[12px] font-bold tabular-nums">$196K</text>
              </svg>
              <ul className="space-y-1.5 text-[11px]">
                {categories.map((c) => (
                  <li key={c.label} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                      {c.label}
                    </span>
                    <span className="font-semibold tabular-nums">{c.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Page views card (overlapping bottom-left) */}
          <motion.div
            initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ type: "spring", stiffness: 220, damping: 24, delay: 0.25 }}
            className={cn(
              "absolute bottom-0 left-6 flex w-[210px] items-center gap-3 rounded-2xl border p-3.5 shadow-[0_18px_40px_-18px_rgba(11,13,18,0.18)]",
              tokens.border,
              tokens.cardBg,
            )}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FB923C]/15 text-[#FB923C]">
              <span className="text-base">⚡</span>
            </div>
            <div className="flex-1">
              <p className={cn("text-[10px] uppercase tracking-[0.14em]", tokens.textMuted)}>
                Page views
              </p>
              <p className="mt-0.5 flex items-baseline gap-1.5">
                <span className="text-[20px] font-semibold tabular-nums">$50.8K</span>
                <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-600">
                  24.4%
                </span>
              </p>
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
