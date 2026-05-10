"use client";

import type { FintechThemeTokens } from "../components/theme";
import { cn } from "@/lib/utils";
import { Reveal } from "../components/reveal";
import { motion, useReducedMotion } from "motion/react";
import { Lock, LineChart, ShieldCheck } from "lucide-react";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export default function FeaturesGrid({ tokens }: { tokens: FintechThemeTokens }) {
  const reduceMotion = useReducedMotion();

  const items = [
    {
      Icon: Lock,
      title: "Institutional\ncustody",
      copy: "Assets are held in segregated accounts under your name with our custody partners — never co-mingled with our balance sheet.",
    },
    {
      Icon: LineChart,
      title: "Real-time\nanalytics",
      copy: "Position-level transparency. Performance attribution, factor exposure, and tax lots — recomputed on every market tick.",
    },
    {
      Icon: ShieldCheck,
      title: "Sovereign-tier\nsecurity",
      copy: "Hardware-key authentication. Quarterly SOC 2 attestations. The same controls that protect public funds.",
    },
  ];

  return (
    <section id="research" className={cn("scroll-mt-32 py-20 sm:py-28", tokens.pageBg)}>
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8">
        <Reveal>
          <p className={cn("text-center text-[10px] font-medium uppercase tracking-[0.28em]", tokens.accentText)}>
            Capabilities
          </p>
          <h2
            className={cn(
              "mx-auto mt-4 max-w-[18ch] text-balance text-center font-light leading-[1.04] tracking-[-0.02em]",
              "text-[36px] sm:text-[48px] lg:text-[60px]",
              tokens.serif,
              tokens.text,
            )}
          >
            A platform for the long view.
          </h2>
        </Reveal>

        <div className={cn("mt-16 grid gap-px overflow-hidden rounded-[10px] border md:grid-cols-3", tokens.border)}>
          {items.map((item, idx) => (
            <motion.div
              key={item.title}
              /* Entrance: ease-out fade + translate, fired once per scroll. */
              initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              /* Hover lift handled by Motion (not CSS) so it doesn't fight
                 the inline transform Motion sets after entrance. */
              whileHover={reduceMotion ? undefined : { y: -3 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{
                duration: reduceMotion ? 0 : 0.32,
                ease: EASE_OUT,
                delay: reduceMotion ? 0 : idx * 0.07,
              }}
              className={cn(
                "group relative flex flex-col p-8 sm:p-10",
                tokens.cardBg,
                /* Only background-color transitions via CSS — transform is
                   Motion's domain, so the two never overwrite each other. */
                "[transition-property:background-color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
              )}
            >
              {/* Icon — translates only (no scale, so hover boundary stays
                  fixed and hover state can't oscillate). */}
              <span
                aria-hidden
                className={cn(
                  "inline-flex",
                  "[transition-property:transform] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
                  "group-hover:-translate-y-[3px]",
                )}
              >
                <item.Icon
                  className={cn("h-5 w-5", tokens.text)}
                  strokeWidth={1.25}
                  aria-hidden
                />
              </span>

              <h3
                className={cn(
                  "mt-10 whitespace-pre-line font-light leading-[1.06] tracking-[-0.015em]",
                  "text-[28px] sm:text-[32px]",
                  tokens.serif,
                  tokens.text,
                )}
              >
                {item.title}
              </h3>
              <p
                className={cn(
                  "mt-5 text-[13px] leading-[1.6]",
                  tokens.textMuted,
                )}
              >
                {item.copy}
              </p>

              {/* Link is its own named group — arrow no longer triggers on
                  card hover, only on link hover. Press feedback added. */}
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className={cn(
                  "group/link mt-10 inline-flex w-fit items-center gap-1 border-b border-current pb-0.5 text-[12px] font-medium",
                  "[transition-property:transform,color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
                  "active:scale-[0.97]",
                  tokens.text,
                )}
              >
                Read more
                <span className="inline-block transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/link:translate-x-1">
                  →
                </span>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
