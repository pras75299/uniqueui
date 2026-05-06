"use client";

import { useState } from "react";
import type { FintechThemeTokens } from "../components/theme";
import { cn } from "@/lib/utils";
import { Reveal } from "../components/reveal";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const faqs: { q: string; a: string }[] = [
  {
    q: "What can I do with your platform?",
    a: "Send and receive money worldwide, set spending goals, run automated treasury, and monitor every transaction in real time.",
  },
  {
    q: "Is my financial data safe and secure?",
    a: "Absolutely. We use industry-standard encryption and multi-factor authentication to keep your personal and financial information protected at all times.",
  },
  {
    q: "Do I need to connect my bank accounts to use this app?",
    a: "Connecting your bank accounts unlocks the full experience, but you can explore goals, budgets, and analytics without linking any account.",
  },
  {
    q: "Can I set financial goals and monitor progress?",
    a: "Yes. Create unlimited goals, track contributions automatically, and get reminders when you fall behind your target pace.",
  },
  {
    q: "What platforms is this app available on?",
    a: "Web, iOS, Android, and a desktop app for macOS and Windows. All clients sync in real time.",
  },
];

export default function Faq({ tokens }: { tokens: FintechThemeTokens }) {
  const [openIndex, setOpenIndex] = useState(1);
  const reduceMotion = useReducedMotion();

  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <Reveal>
          <h2 className="text-center text-[34px] font-semibold tracking-[-0.01em] sm:text-[44px]">
            Frequently Asked Questions
          </h2>
          <p className={cn("mt-2 text-center text-[13px]", tokens.textMuted)}>
            These are the questions we hear more often.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-5 lg:grid-cols-[1.5fr_0.65fr]">
          <Reveal>
            <div className={cn("divide-y", tokens.borderSoft)}>
              {faqs.map((item, i) => {
                const isOpen = openIndex === i;
                return (
                  <div key={item.q}>
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? -1 : i)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 py-5 text-left text-[14px] font-medium"
                    >
                      <span>{item.q}</span>
                      <motion.span
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ type: "spring", stiffness: 280, damping: 24 }}
                        className={cn(
                          "shrink-0 text-lg leading-none",
                          tokens.textMuted,
                        )}
                        aria-hidden
                      >
                        +
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="content"
                          initial={
                            reduceMotion
                              ? { height: "auto", opacity: 1 }
                              : { height: 0, opacity: 0 }
                          }
                          animate={{ height: "auto", opacity: 1 }}
                          exit={
                            reduceMotion
                              ? { height: "auto", opacity: 0 }
                              : { height: 0, opacity: 0 }
                          }
                          transition={{ type: "spring", stiffness: 240, damping: 28 }}
                          className="overflow-hidden"
                        >
                          <p
                            className={cn(
                              "pb-5 pr-10 text-[13px] leading-relaxed",
                              tokens.textMuted,
                            )}
                          >
                            {item.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </Reveal>

          <Reveal
            delay={0.05}
            className={cn(
              "flex flex-col items-center justify-center rounded-3xl p-8 text-center",
              tokens.softSurface,
            )}
          >
            <p className="text-balance text-[16px] font-semibold leading-snug">
              Don&apos;t see the answer you
              <br />
              need?
            </p>
            <p className={cn("mt-3 max-w-[220px] text-[12px] leading-relaxed", tokens.textMuted)}>
              That&apos;s ok. Just drop a message and we will get back to you ASAP.
            </p>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className={cn(
                "mt-6 inline-flex h-10 items-center rounded-md px-5 text-[12px] font-semibold transition-transform hover:-translate-y-[1px]",
                tokens.primaryBg,
                tokens.primaryFg,
              )}
            >
              Contact us
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
