"use client";

import { cn } from "@/lib/utils";
import type { FintechThemeTokens } from "../components/theme";
import { StaggerGroup, StaggerItem } from "../components/stagger";
import { Share2, Link2, Globe, Rss } from "lucide-react";

const columns = [
  { title: "Platform", items: ["Markets", "Strategy", "Custody", "API"] },
  { title: "Research", items: ["Letters", "Notes", "Outlook"] },
  { title: "Company", items: ["About", "Investors", "Careers", "Press"] },
  { title: "Legal", items: ["Disclosures", "Privacy", "Terms"] },
];

const socials = [
  { Icon: Share2, label: "X" },
  { Icon: Link2, label: "LinkedIn" },
  { Icon: Globe, label: "GitHub" },
  { Icon: Rss, label: "RSS" },
];

export default function Footer({ tokens }: { tokens: FintechThemeTokens }) {
  return (
    <footer className={cn("border-t pt-16 pb-10", tokens.borderSoft)}>
      <StaggerGroup
        stagger={0.07}
        delay={0.05}
        className="mx-auto grid w-full max-w-[1200px] gap-12 px-5 sm:grid-cols-2 sm:px-8 md:grid-cols-[1.5fr_repeat(4,1fr)]"
      >
        <div className="sm:col-span-2 md:col-span-1">
          <span
            className={cn(
              "select-none text-[20px] font-light tracking-[-0.02em]",
              tokens.serif,
              tokens.text,
            )}
          >
            Bayard<span className="opacity-50">.</span>
          </span>
          <p className={cn("mt-4 max-w-[28ch] text-[12px] leading-[1.6]", tokens.textMuted)}>
            A patient-capital platform for individuals who think in decades.
            Member SIPC. Capital at risk.
          </p>
          <StaggerGroup className="mt-6 flex gap-2" stagger={0.06}>
            {socials.map(({ Icon, label }) => (
              <StaggerItem key={label} as="span" y={6}>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  aria-label={label}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border",
                    "[transition-property:transform,background-color,color] duration-200 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)]",
                    "hover:-translate-y-px active:scale-[0.94]",
                    tokens.outlinedBorder,
                    tokens.textMuted,
                    "hover:text-current",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                </a>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>

        {columns.map((col) => (
          <StaggerItem key={col.title} as="div" y={8}>
            <h4
              className={cn(
                "text-[10px] font-medium uppercase tracking-[0.22em]",
                tokens.textMuted,
              )}
            >
              {col.title}
            </h4>
            <ul className={cn("mt-5 space-y-3 text-[12px]", tokens.text)}>
              {col.items.map((link) => (
                <li
                  key={link}
                  className={cn(
                    "cursor-pointer transition-colors duration-150",
                    tokens.textMuted,
                    "hover:text-current",
                  )}
                >
                  <span
                    className="inline-block transition-transform duration-200 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] hover:translate-x-0.5"
                  >
                    {link}
                  </span>
                </li>
              ))}
            </ul>
          </StaggerItem>
        ))}
      </StaggerGroup>

      <div
        className={cn(
          "mx-auto mt-14 flex w-full max-w-[1200px] flex-col items-start justify-between gap-2 border-t px-5 pt-6 text-[10px] sm:flex-row sm:items-center sm:px-8",
          tokens.borderSoft,
          tokens.textSubtle,
        )}
      >
        <span className="tracking-[0.02em]">© 2026 Bayard Capital, Inc.</span>
        <span className="tracking-[0.02em]">
          Securities offered through Bayard Securities LLC. Member FINRA / SIPC.
        </span>
      </div>
    </footer>
  );
}
