"use client";

import type { FintechThemeTokens } from "../components/theme";
import { Reveal } from "../components/reveal";
import { motion, useReducedMotion } from "motion/react";

/** Decorative starburst / firework on the bottom-left of the CTA */
function Starburst() {
  const lines = Array.from({ length: 22 }, (_, i) => {
    const angle = (i / 22) * Math.PI * 2;
    const len = 36 + (i % 3) * 14;
    return {
      x2: 60 + Math.cos(angle) * len,
      y2: 60 + Math.sin(angle) * len,
      delay: i * 0.04,
    };
  });
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute -bottom-6 -left-2 h-40 w-40 opacity-90"
      viewBox="0 0 120 120"
    >
      {lines.map((l, i) => (
        <motion.line
          key={i}
          x1="60"
          y1="60"
          x2={l.x2}
          y2={l.y2}
          stroke="white"
          strokeWidth="0.6"
          strokeLinecap="round"
          initial={{ opacity: 0.2, pathLength: 0 }}
          whileInView={{ opacity: [0.25, 0.7, 0.25], pathLength: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            pathLength: { duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: l.delay },
            opacity: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: l.delay },
          }}
        />
      ))}
      <circle cx="60" cy="60" r="2.4" fill="white" />
    </svg>
  );
}

/** Right-side play arrow inside a thin circle outline */
function PlayMark() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute right-8 top-1/2 hidden h-16 w-16 -translate-y-1/2 sm:block"
      viewBox="0 0 64 64"
    >
      <circle cx="32" cy="32" r="30" fill="none" stroke="white" strokeWidth="1" opacity="0.35" />
      <path d="M26 22 L44 32 L26 42 Z" fill="white" />
    </svg>
  );
}

export default function FinalCta({ tokens: _tokens }: { tokens: FintechThemeTokens }) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="pb-14 sm:pb-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <Reveal className="relative overflow-hidden rounded-3xl bg-[#0B0D12] p-10 text-center text-white sm:p-14">
          <Starburst />
          <PlayMark />
          <motion.div
            aria-hidden
            initial={{ opacity: 0.25 }}
            animate={reduceMotion ? { opacity: 0.25 } : { opacity: [0.2, 0.45, 0.2] }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 7, repeat: Infinity, ease: "easeInOut" }
            }
            className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,rgba(56,189,248,0.18),transparent_55%)]"
          />
          <div className="relative z-10">
            <h2 className="text-balance text-[28px] font-semibold leading-[1.1] tracking-[-0.01em] sm:text-[36px]">
              Take Full Control of Your Financial
              <br className="hidden sm:block" /> Future Starting Today
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[13px] text-white/65 sm:text-[14px]">
              Start Taking Charge of Your Finances and Build a Better Tomorrow
            </p>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="mt-6 inline-flex h-10 items-center rounded-md bg-white px-5 text-[12px] font-semibold text-black transition-transform hover:-translate-y-[1px]"
            >
              Contact us
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
