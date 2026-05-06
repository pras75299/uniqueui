"use client";

export type FintechThemeTokens = {
  pageBg: string;
  surface: string;
  elevated: string;
  cardBg: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  border: string;
  borderSoft: string;
  primaryBg: string;
  primaryFg: string;
  outlinedBorder: string;
  outlinedFg: string;
  /** Soft gray surface used by the savings-card visual & FAQ side card */
  softSurface: string;
  feature: { lavender: string; cream: string; pink: string };
};

export function getFintechThemeTokens(isDark: boolean): FintechThemeTokens {
  return isDark
    ? {
        pageBg: "bg-[#0A0B0F]",
        surface: "bg-[#0F1116]",
        elevated: "bg-[#161821]",
        cardBg: "bg-[#11131A]",
        text: "text-neutral-100",
        textMuted: "text-neutral-400",
        textSubtle: "text-neutral-500",
        border: "border-white/10",
        borderSoft: "border-white/5",
        primaryBg: "bg-white",
        primaryFg: "text-black",
        outlinedBorder: "border-white/15",
        outlinedFg: "text-neutral-200",
        softSurface: "bg-[#161821]",
        feature: {
          lavender: "bg-[#171A26]",
          cream: "bg-[#1F1B12]",
          pink: "bg-[#1F141B]",
        },
      }
    : {
        pageBg: "bg-white",
        surface: "bg-white",
        elevated: "bg-white",
        cardBg: "bg-white",
        text: "text-[#0B0D12]",
        textMuted: "text-[#5A6072]",
        textSubtle: "text-[#9097A8]",
        border: "border-[#E8EAF0]",
        borderSoft: "border-[#EFF1F5]",
        primaryBg: "bg-[#0B0D12]",
        primaryFg: "text-white",
        outlinedBorder: "border-[#D8DCE5]",
        outlinedFg: "text-[#3A4050]",
        softSurface: "bg-[#EEEFF2]",
        feature: {
          lavender: "bg-[#E8EBF5]",
          cream: "bg-[#F4EDD9]",
          pink: "bg-[#F2DDE0]",
        },
      };
}
