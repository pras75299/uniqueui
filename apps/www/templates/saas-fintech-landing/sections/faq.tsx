"use client";

import { useState } from "react";
import type { FintechThemeTokens } from "../components/theme";
import { cn } from "@/lib/utils";
import { Reveal } from "../components/reveal";
import { StaggerGroup, StaggerItem } from "../components/stagger";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;

const faqs: { q: string; a: string }[] = [
  {
    q: "How is Bayard different from a brokerage?",
    a: "Bayard pairs custody with research and execution under one roof. We act as your fiduciary, not your counterparty — assets are held in your name at our custody partners, and revenue comes only from a single transparent management fee.",
  },
  {
    q: "Where are my assets actually held?",
    a: "In segregated, name-titled accounts at our custody partners. Funds and securities are never on Bayard's balance sheet. Independent attestations are published quarterly and available on request.",
  },
  {
    q: "What is the minimum to open an account?",
    a: "There is no minimum to open an account. Strategies that require institutional documentation begin at $250,000.",
  },
  {
    q: "Can I bring my own advisor?",
    a: "Yes. Bayard supports advisor-led accounts with read-only API access, custodial handoff, and consolidated reporting across portfolios.",
  },
  {
    q: "How do you handle taxes?",
    a: "Tax-lot accounting is on by default, with daily harvesting opportunities surfaced before market close. Year-end forms are filed automatically; we work with your CPA on request.",
  },
];

export default function Faq({ tokens }: { tokens: FintechThemeTokens }) {
  const [openIndex, setOpenIndex] = useState(1);
  const reduceMotion = useReducedMotion();

  return (
    <section className={cn("py-20 sm:py-28", tokens.pageBg)}>
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8">
        <Reveal>
          <p className={cn("text-center text-[10px] font-medium uppercase tracking-[0.28em]", tokens.accentText)}>
            Common questions
          </p>
          <h2
            className={cn(
              "mx-auto mt-4 max-w-[18ch] text-balance text-center font-light leading-[1.04] tracking-[-0.02em]",
              "text-[36px] sm:text-[48px] lg:text-[56px]",
              tokens.serif,
              tokens.text,
            )}
          >
            What investors ask before
            <br />
            <span className="italic">opening an account.</span>
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <StaggerGroup
            stagger={0.05}
            delay={0.05}
            className={cn("border-y", tokens.borderSoft)}
          >
            {faqs.map((item, i) => {
              const isOpen = openIndex === i;
              return (
                <StaggerItem
                  key={item.q}
                  as="div"
                  y={6}
                  className={cn(
                    i !== 0 && cn("border-t", tokens.borderSoft),
                  )}
                >
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? -1 : i)}
                      aria-expanded={isOpen}
                      className={cn(
                        "flex w-full items-center justify-between gap-6 py-6 text-left",
                        "text-[15px] font-light tracking-[-0.005em]",
                        tokens.serif,
                        tokens.text,
                      )}
                    >
                      <span>{item.q}</span>
                      <motion.span
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ duration: 0.2, ease: EASE_OUT }}
                        className={cn(
                          "shrink-0 text-[20px] font-light leading-none",
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
                          transition={{ duration: 0.28, ease: EASE_IN_OUT }}
                          className="overflow-hidden"
                        >
                          <p
                            className={cn(
                              "max-w-[60ch] pb-6 pr-10 text-[13px] leading-[1.6]",
                              tokens.textMuted,
                            )}
                          >
                            {item.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                </StaggerItem>
              );
            })}
          </StaggerGroup>

          <Reveal
            delay={0.05}
            className={cn(
              "flex flex-col rounded-[10px] border p-8",
              tokens.border,
              tokens.cardBg,
            )}
          >
            <p className={cn("text-[10px] font-medium uppercase tracking-[0.22em]", tokens.accentText)}>
              Speak to us
            </p>
            <p
              className={cn(
                "mt-4 text-balance font-light leading-[1.1] tracking-[-0.015em]",
                "text-[26px] sm:text-[30px]",
                tokens.serif,
                tokens.text,
              )}
            >
              Still searching for an answer?
            </p>
            <p className={cn("mt-4 text-[13px] leading-[1.6]", tokens.textMuted)}>
              Our investor relations desk replies within one business day.
              Complex situations welcome.
            </p>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className={cn(
                "mt-7 inline-flex h-10 w-fit items-center rounded-full px-5 text-[12px] font-medium",
                "transition-transform duration-150 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)]",
                "active:scale-[0.97]",
                tokens.primaryBg,
                tokens.primaryFg,
              )}
            >
              Contact investor relations
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
