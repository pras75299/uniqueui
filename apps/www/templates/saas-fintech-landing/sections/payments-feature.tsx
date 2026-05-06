"use client";

import type { FintechThemeTokens } from "../components/theme";
import { cn } from "@/lib/utils";
import { Reveal } from "../components/reveal";
import { ChevronRight, Wifi, ArrowUp, ArrowDown, Send, FilePlus, MoreHorizontal } from "lucide-react";

export default function PaymentsFeature({ tokens }: { tokens: FintechThemeTokens }) {
  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 sm:px-6 md:grid-cols-[0.95fr_1.05fr] md:gap-16">
        {/* Visual: gray rounded panel with savings card */}
        <Reveal
          className={cn(
            "flex flex-col items-center justify-between rounded-3xl p-8",
            tokens.softSurface,
          )}
        >
          {/* Savings card */}
          <div
            className={cn(
              "relative w-full max-w-[280px] rounded-2xl p-5 shadow-[0_18px_40px_-18px_rgba(11,13,18,0.18)]",
              tokens.cardBg,
            )}
          >
            <div className="mb-8 flex items-start justify-between">
              <Wifi
                className={cn("h-4 w-4 -rotate-90", tokens.textMuted)}
                aria-hidden
              />
              <span className="flex items-center gap-1 text-[11px] font-semibold">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#0B0D12]" />
                Payon°
              </span>
            </div>
            <p className={cn("text-[10px] uppercase tracking-[0.16em]", tokens.textMuted)}>
              Savings Card
            </p>
            <p className="mt-1 text-[30px] font-semibold tabular-nums leading-none">
              $16,058
              <span className={cn("text-[20px]", tokens.textMuted)}>.94</span>
            </p>
          </div>

          {/* Better Integration label */}
          <p
            className={cn(
              "mt-7 text-[11px]",
              tokens.textMuted,
            )}
          >
            <span className={tokens.textSubtle}>Better</span>{" "}
            <span className="font-semibold text-current">Integration</span>
          </p>

          {/* Action chips row */}
          <div className="mt-3 flex w-full items-center justify-center gap-2">
            {[
              { Icon: ArrowUp, key: "up" },
              { Icon: ArrowDown, key: "down" },
              { Icon: Send, key: "send" },
              { Icon: FilePlus, key: "file" },
              { Icon: MoreHorizontal, key: "more" },
            ].map(({ Icon, key }) => (
              <span
                key={key}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-md shadow-sm",
                  tokens.cardBg,
                )}
              >
                <Icon className={cn("h-4 w-4", tokens.textMuted)} aria-hidden />
              </span>
            ))}
          </div>
        </Reveal>

        {/* Copy column */}
        <Reveal delay={0.05} className="flex flex-col justify-center">
          <h2 className="text-balance text-[34px] font-semibold leading-[1.06] tracking-[-0.01em] sm:text-[44px]">
            Streamline Sales With
            <br />
            Seamless Payments
          </h2>
          <p className={cn("mt-4 max-w-md text-[13px] leading-relaxed", tokens.textMuted)}>
            Deliver a frictionless buying experience with secure, responsive,
            and fully integrated payment tools.
          </p>
          <ul className="mt-6 space-y-3 text-[14px]">
            {[
              "Real-Time Payment Tracking",
              "Accept Payments Quickly And Securely",
              "Effortless Integration With Your Platform",
            ].map((b) => (
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
            Create Account
          </a>
        </Reveal>
      </div>
    </section>
  );
}
