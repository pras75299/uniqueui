"use client";

import type { FintechThemeTokens } from "../components/theme";
import { cn } from "@/lib/utils";
import { Reveal } from "../components/reveal";
import { ArrowUpRight } from "lucide-react";

export default function FeaturesGrid({ tokens }: { tokens: FintechThemeTokens }) {
  const items = [
    {
      title: "Secure Account\nLogin",
      copy: "Protect Your Financial Data With Secure Account Login, Featuring Encryption And 2-Factor Authentication For Peace Of Mind.",
      surface: tokens.feature.lavender,
    },
    {
      title: "Credit Score\nMonitoring",
      copy: "Stay On Top Of Your Financial Health With Real-Time Credit Score Monitoring And Personalized Improvement Tips.",
      surface: tokens.feature.cream,
    },
    {
      title: "Real-Time\nBalance",
      copy: "Get Instant Access To Your Account Balance Anytime, Anywhere, So You Always Know Where Your Money Stands.",
      surface: tokens.feature.pink,
    },
  ];

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <Reveal>
          <h2 className="text-center text-[34px] font-semibold tracking-[-0.01em] sm:text-[44px]">
            Our Features
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {items.map((item, idx) => (
            <Reveal
              key={item.title}
              delay={idx * 0.06}
              className={cn(
                "group relative flex flex-col rounded-3xl p-7 transition-transform hover:-translate-y-0.5",
                item.surface,
              )}
            >
              <div className="flex items-start justify-between">
                <h3 className="whitespace-pre-line text-[22px] font-semibold leading-tight tracking-[-0.01em]">
                  {item.title}
                </h3>
                <ArrowUpRight
                  className="h-5 w-5 text-[#0B0D12] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:text-white"
                  aria-hidden
                />
              </div>
              <p
                className={cn(
                  "mt-7 text-[12px] leading-relaxed",
                  tokens.textMuted,
                )}
              >
                {item.copy}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
