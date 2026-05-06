"use client";

import { cn } from "@/lib/utils";
import type { FintechThemeTokens } from "../components/theme";
import { Instagram, Facebook, Twitter, Youtube } from "lucide-react";

const columns = [
  { title: "About", items: ["Partnership", "Terms of Use", "Privacy"] },
  { title: "Product", items: ["About", "Features", "Support"] },
  { title: "Resources", items: ["Career", "Blog", "Legal"] },
  { title: "Contact", items: ["+123 456 789", "Los Angeles, CA"] },
];

const socials = [
  { Icon: Instagram, label: "Instagram", bg: "bg-[#E879A6]" },
  { Icon: Facebook, label: "Facebook", bg: "bg-[#3B82F6]" },
  { Icon: Twitter, label: "Twitter", bg: "bg-[#0EA5E9]" },
  { Icon: Youtube, label: "YouTube", bg: "bg-[#EF4444]" },
];

function FooterBrandMark() {
  return (
    <span
      className="flex h-6 w-6 items-center justify-center rounded-full"
      style={{
        background:
          "radial-gradient(circle at 30% 30%, #FFF6CF, #F2E6A6 65%, #E5D77F)",
      }}
      aria-hidden
    >
      <span className="text-[10px] font-bold text-[#0B0D12]">b</span>
    </span>
  );
}

export default function Footer({ tokens }: { tokens: FintechThemeTokens }) {
  return (
    <footer className={cn("border-t pt-12 pb-6", tokens.border)}>
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 sm:grid-cols-2 sm:px-6 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div className="sm:col-span-2 md:col-span-1">
          <FooterBrandMark />
          <p
            className={cn(
              "mt-3 max-w-[240px] text-[12px] leading-relaxed",
              tokens.textMuted,
            )}
          >
            Let us handle all your finances and guarantee secure transactions
          </p>
          <div className="mt-5 flex gap-2">
            {socials.map(({ Icon, label, bg }) => (
              <a
                key={label}
                href="#"
                onClick={(e) => e.preventDefault()}
                aria-label={label}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md text-white transition-transform hover:-translate-y-[1px]",
                  bg,
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-[12px] font-semibold">{col.title}</h4>
            <ul className={cn("mt-4 space-y-2.5 text-[12px]", tokens.textMuted)}>
              {col.items.map((link) => (
                <li
                  key={link}
                  className="cursor-pointer transition-colors hover:text-current"
                >
                  {link}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div
        className={cn(
          "mx-auto mt-10 w-full max-w-6xl border-t px-4 pt-5 text-center text-[11px] sm:px-6",
          tokens.borderSoft,
          tokens.textMuted,
        )}
      >
        © 2025. All Rights Reserved.
      </div>
    </footer>
  );
}
