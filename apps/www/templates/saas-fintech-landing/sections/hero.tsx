"use client";

import { motion, useReducedMotion, useScroll, useTransform, useSpring } from "motion/react";
import { useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import type { FintechThemeTokens } from "../components/theme";
import { CountUp } from "../components/count-up";
import { TypingHeadline } from "../components/typing-headline";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/**
 * Aerial dusk skyline — sourced from Unsplash (whitelisted in CSP).
 * Picked specifically for the long horizon line + dusk blue palette.
 */
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=2400&q=85";

const tickers = [
  { sym: "AA", name: "Aalto Industries", change: "+0.42%", positive: true },
  { sym: "GS", name: "Goldsmith Capital", change: "−0.18%", positive: false },
  { sym: "NV", name: "Nordvest Holdings", change: "+0.25%", positive: true },
];

/** Hairline sparkline trending gently upward over 12 months. */
function Sparkline({ stroke }: { stroke: string }) {
  const reduceMotion = useReducedMotion();
  const points = [
    [0, 38], [9, 34], [18, 36], [27, 30], [36, 31],
    [45, 25], [55, 27], [64, 21], [73, 22], [82, 16],
    [91, 18], [100, 12],
  ];
  const d = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x} ${y}`)
    .join(" ");

  return (
    <svg
      viewBox="0 0 100 50"
      preserveAspectRatio="none"
      className="h-[60px] w-full"
      aria-hidden
    >
      <line x1="0" y1="38" x2="100" y2="38" stroke="currentColor" strokeWidth="0.15" opacity="0.18" />
      <line x1="0" y1="20" x2="100" y2="20" stroke="currentColor" strokeWidth="0.15" opacity="0.1" />
      <motion.path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth="0.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: reduceMotion ? 0 : 1.1, ease: EASE_OUT, delay: 1.2 }}
        vectorEffect="non-scaling-stroke"
      />
      <motion.circle
        cx="100"
        cy="12"
        r="0.9"
        fill={stroke}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 2.0, ease: EASE_OUT }}
      />
    </svg>
  );
}

export default function Hero({ tokens: _tokens }: { tokens: FintechThemeTokens }) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  /**
   * Image zoom-out reveal: scale starts at 1.1 and pulls back to 1.0
   * as the section scrolls past. A soft spring smooths the otherwise-
   * jittery scroll-tied scale. Text simultaneously rises ~24px upward
   * (positive scroll progress → negative Y) so the headline lifts
   * into place as the city pulls back.
   */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const rawScale = useTransform(scrollYProgress, [0, 1], [1.1, 1.0]);
  const bgScale = useSpring(rawScale, {
    stiffness: 220,
    damping: 36,
    mass: 0.5,
    restDelta: 0.001,
  });
  const cardY = useTransform(scrollYProgress, [0, 1], [0, -28]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -16]);

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden bg-[#0A0E16]"
    >
      {/* Background image — fills section, scales 1.1 → 1.0 on scroll */}
      <motion.div
        aria-hidden
        style={reduceMotion ? undefined : { scale: bgScale }}
        className="absolute inset-0 origin-center"
      >
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>

      {/* Gradient overlay — darkens upper-left for headline legibility */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-br from-[#070912]/85 via-[#0A0E16]/55 to-[#0A0E16]/30"
      />
      {/* Vignette + bottom fade-to-paper so the section meets the next one cleanly */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 30% 30%, transparent 50%, rgba(7,9,18,0.55) 100%), linear-gradient(to bottom, transparent 60%, rgba(248,246,241,0.9) 100%)",
        }}
      />
      {/* Hairline 8-col grid in faint white */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden md:block text-white"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px)",
          backgroundSize: "calc(100%/8) 100%",
          opacity: 0.045,
        }}
      />

      <div className="relative mx-auto grid w-full max-w-[1200px] gap-14 px-5 pt-20 pb-28 sm:px-8 md:grid-cols-8 md:gap-10 md:pt-28 md:pb-36 lg:pt-32">
        {/* Headline column — 5/8 */}
        <motion.div
          initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
          style={reduceMotion ? undefined : { y: textY }}
          className="md:col-span-5"
        >
          {/* Eyebrow */}
          <motion.p
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: EASE_OUT, delay: 0.05 }}
            className={cn(
              "flex items-center gap-2.5 text-[10px] font-medium uppercase tracking-[0.22em]",
              "text-[#D88275]",
            )}
          >
            <span className="inline-block h-px w-7 bg-current opacity-70" />
            Q2 — 2026 Investor Letter
          </motion.p>

          {/* Typing headline — char-by-char with caret + per-word hover lift */}
          <h1
            className={cn(
              "mt-6 text-balance font-light tracking-[-0.025em] text-[#F4F1E8]",
              "text-[44px] leading-[1.02] sm:text-[58px] md:text-[72px] lg:text-[88px] lg:leading-[0.98]",
              "font-[var(--font-serif)]",
            )}
          >
            <TypingHeadline
              ariaLabel="Invest with the patience of an institution."
              tokens={[
                { text: "Invest" },
                { text: "with" },
                { text: "the" },
                { text: "patience" },
                { lineBreak: true },
                { text: "of", italic: true },
                { text: "an" },
                { text: "institution." },
              ]}
            />
          </h1>

          <motion.p
            initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE_OUT, delay: 1.4 }}
            className={cn(
              "mt-7 max-w-[36ch] text-[14px] leading-[1.65]",
              "text-[#C2BEB2]",
            )}
          >
            A patient-capital platform for individuals who think in decades, not
            quarters. Custody, research, and execution under one roof — built
            on the discipline of a sovereign fund.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE_OUT, delay: 1.55 }}
            className="mt-9 flex flex-wrap items-center gap-6"
          >
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className={cn(
                "group inline-flex h-11 items-center gap-2 rounded-full bg-[#F4F1E8] px-6 text-[13px] font-medium text-[#0A0A0A]",
                "[transition-property:transform,background-color] duration-200 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)]",
                "active:scale-[0.97] hover:bg-white",
              )}
            >
              Open an account
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] group-hover:-translate-y-px group-hover:translate-x-px" />
            </a>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className={cn(
                "group inline-flex items-center gap-1.5 text-[13px] font-medium",
                "border-b border-[#F4F1E8]/60 pb-0.5 text-[#F4F1E8]",
                "transition-colors duration-150 hover:border-[#F4F1E8]",
              )}
            >
              Read the prospectus
              <span className="transition-transform duration-200 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-0.5">
                →
              </span>
            </a>
          </motion.div>
        </motion.div>

        {/* Glass portfolio card — 3/8 */}
        <motion.div
          initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.7 }}
          style={reduceMotion ? undefined : { y: cardY }}
          className="md:col-span-3 md:pt-2"
        >
          <div
            className={cn(
              "rounded-[10px] border border-white/[0.14] bg-white/[0.05] p-7 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:p-8",
            )}
          >
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#C2BEB2]">
              Portfolio Balance
            </p>
            <p
              className={cn(
                "mt-3 truncate text-[32px] font-light leading-none tabular-nums tracking-[-0.015em] text-[#F4F1E8] sm:text-[38px] lg:text-[42px]",
                "font-[var(--font-serif)]",
              )}
            >
              <CountUp value={1284690.42} prefix="$" decimals={2} delay={1.0} duration={1.0} />
            </p>

            <div className="mt-3 flex items-baseline gap-3 text-[12px]">
              <span className="inline-flex items-center gap-1 tabular-nums text-[#D88275]">
                <svg width="9" height="9" viewBox="0 0 9 9" aria-hidden>
                  <path d="M4.5 1.5 L8 5 H6 V8 H3 V5 H1 Z" fill="currentColor" />
                </svg>
                +$24,310.18
              </span>
              <span className="tabular-nums text-[#9F9C90]">+1.92% today</span>
            </div>

            <div className="mt-6 h-px w-full bg-white/[0.12]" />

            <div className="mt-5">
              <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.2em]">
                <span className="text-[#9F9C90]">YTD Performance</span>
                <span className="tabular-nums text-[#D88275]">+18.42%</span>
              </div>
              <div className="mt-2 text-[#F4F1E8]">
                <Sparkline stroke="currentColor" />
              </div>
            </div>

            <div className="mt-5 h-px w-full bg-white/[0.12]" />

            <ul className="mt-5 space-y-0">
              {tickers.map((t, i) => (
                <motion.li
                  key={t.sym}
                  initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: EASE_OUT, delay: 1.6 + i * 0.06 }}
                  className={cn(
                    "flex items-center gap-3 py-3 text-[12px]",
                    i !== 0 && "border-t border-white/[0.08]",
                  )}
                >
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px] border border-white/[0.18] text-[10px] font-medium tracking-[0.05em] text-[#F4F1E8]">
                    {t.sym}
                  </span>
                  <span className="flex-1 truncate text-[#F4F1E8]">{t.name}</span>
                  <span
                    className={cn(
                      "tabular-nums",
                      t.positive ? "text-[#D88275]" : "text-[#9F9C90]",
                    )}
                  >
                    {t.change}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>

          <p className="mt-3 text-[10px] tracking-[0.02em] text-[#7E7B72]">
            Indicative figures. Capital at risk. See prospectus for details.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
