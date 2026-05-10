"use client";

/**
 * Editorial Fintech tokens.
 * Restrained, document-like. Paper surfaces, ink text, a single oxblood accent.
 * Light-first; dark mode kept minimal but coherent (newsprint inverted to ink).
 */
export type FintechThemeTokens = {
  /** Page background (warm paper in light, near-black in dark). */
  pageBg: string;
  /** Inset surface (used by FAQ side card, payment-feature panel). */
  surface: string;
  /** Slightly raised surface — kept for compatibility, equal to surface here. */
  elevated: string;
  /** Card background — pure white in light, near-black raised in dark. */
  cardBg: string;
  /** Primary text — ink. */
  text: string;
  /** Secondary text — slate. */
  textMuted: string;
  /** Tertiary text — pale slate. */
  textSubtle: string;
  /** Hairline border — the structural device that replaces shadows. */
  border: string;
  /** Even softer hairline (separators inside cards). */
  borderSoft: string;
  /** Primary button bg (ink). */
  primaryBg: string;
  /** Primary button fg (paper). */
  primaryFg: string;
  /** Outlined button border. */
  outlinedBorder: string;
  /** Outlined button fg. */
  outlinedFg: string;
  /** Soft inset surface — used by feature panels & FAQ side card. */
  softSurface: string;
  /** The single oxblood accent — eyebrows, positive deltas, underlines. */
  accentText: string;
  /** Accent-tinted background, very faint. */
  accentSoft: string;
  /**
   * Feature card surfaces. In editorial, all three are pure white with hairline
   * borders — kept as separate keys for compatibility with features-grid.
   */
  feature: { lavender: string; cream: string; pink: string };
  /** Serif display font stack — applied via Tailwind arbitrary value. */
  serif: string;
};

export function getFintechThemeTokens(isDark: boolean): FintechThemeTokens {
  const serif = "font-[var(--font-serif)]";

  return isDark
    ? {
        pageBg: "bg-[#0B0A08]",
        surface: "bg-[#100E0B]",
        elevated: "bg-[#100E0B]",
        cardBg: "bg-[#0F0E0B]",
        text: "text-[#F2EFE7]",
        textMuted: "text-[#9C988E]",
        textSubtle: "text-[#6E6B63]",
        border: "border-[#26221C]",
        borderSoft: "border-[#1A1714]",
        primaryBg: "bg-[#F2EFE7]",
        primaryFg: "text-[#0B0A08]",
        outlinedBorder: "border-[#33302A]",
        outlinedFg: "text-[#D8D4C8]",
        softSurface: "bg-[#13110D]",
        accentText: "text-[#D88275]",
        accentSoft: "bg-[#1F120F]",
        feature: {
          lavender: "bg-[#0F0E0B]",
          cream: "bg-[#0F0E0B]",
          pink: "bg-[#0F0E0B]",
        },
        serif,
      }
    : {
        pageBg: "bg-[#F8F6F1]",
        surface: "bg-[#FFFFFF]",
        elevated: "bg-[#FFFFFF]",
        cardBg: "bg-white",
        text: "text-[#0A0A0A]",
        textMuted: "text-[#4A4A45]",
        textSubtle: "text-[#8A877E]",
        border: "border-[#E6E3DA]",
        borderSoft: "border-[#EDEAE0]",
        primaryBg: "bg-[#0A0A0A]",
        primaryFg: "text-[#F8F6F1]",
        outlinedBorder: "border-[#D6D3C9]",
        outlinedFg: "text-[#0A0A0A]",
        softSurface: "bg-[#F1EEE6]",
        accentText: "text-[#7A1F1A]",
        accentSoft: "bg-[#F4E9E6]",
        feature: {
          lavender: "bg-white",
          cream: "bg-white",
          pink: "bg-white",
        },
        serif,
      };
}
