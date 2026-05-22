"use client";

/* Hallmark · macrostructure: Long Document · genre: editorial
 * nav: N7 Hairline-text · footer: Ft6 Colophon
 * theme: custom (vibe: "dark editorial · magazine profile · warm metal")
 *   dark  → paper oklch(14% 0.012 250) #0B0D14 · ink #F2EEDB · brass #C09A6B
 *   light → paper #F8F5EC (warm cream)        · ink #1A1714 · brass #8E6938
 *   display: Fraunces (italic-serif) · body: Geist · mono: Geist Mono
 * axes: dark↔light (brass-anchored) / italic-serif / warm
 * enrichment: subtle Aurora bloom (corner-only) — typography-led otherwise
 * tone: editorial · use: read-then-reach · audience: senior IC engineer
 * pre-emit critique: P5 H5 E5 S5 R5 V5
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * INKLINE — Developer Portfolio Template
 * ─────────────────────────────────────────────────────────────────────────────
 * A magazine-profile portfolio for senior IC engineers. Long Document
 * macrostructure: a top-to-bottom narrative, not a scroll-grid of cards.
 *
 * Sections
 * ├── sections/nav.tsx         Hairline text nav (name · 3 links · email · mode)
 * ├── sections/hero.tsx        Long-document opening — hairline-draw + type-settle + italic-beat
 * ├── sections/work.tsx        Selected work — hover-reveal project entries
 * ├── sections/currently.tsx   In-flight items (tilt-card on the lead)
 * ├── sections/timeline.tsx    Career timeline — animated thread draw
 * ├── sections/writing.tsx     Essays / talks archive — index style
 * ├── sections/contact.tsx     Closing paragraph + email + 2 socials
 * └── sections/footer.tsx      Colophon (set in / last shipped / source)
 *
 * Theme module
 * └── components/theme.tsx     Self-contained light/dark system. Module-level
 *                              store via useSyncExternalStore — no provider
 *                              required, ZIP works standalone.
 *
 * All copy is placeholder for the end user to replace — no invented metrics,
 * no fabricated logos, no "trusted by 50k+" lines.
 * ─────────────────────────────────────────────────────────────────────────── */

import Nav        from "./sections/nav";
import Hero       from "./sections/hero";
import Work       from "./sections/work";
import Currently  from "./sections/currently";
import Timeline   from "./sections/timeline";
import Writing    from "./sections/writing";
import Contact    from "./sections/contact";
import Footer     from "./sections/footer";
import { usePortfolioTheme, getPortfolioTokens, portfolioFonts } from "./components/theme";
import { cn } from "@/lib/utils";

export default function Portfolio({ className }: { className?: string }) {
  const { theme } = usePortfolioTheme();
  const tokens = getPortfolioTokens(theme);

  return (
    <div
      data-portfolio-theme={theme}
      className={cn(className)}
      style={{
        fontFamily: portfolioFonts.body,
        backgroundColor: tokens.paper,
        color: tokens.ink,
        lineHeight: 1.6,
        fontFeatureSettings: '"ss01", "cv11"',
        minHeight: "100vh",
        // Smooth the bg/text swap when toggling — long enough to feel intentional,
        // short enough that there's no perceived lag for power users.
        transition: "background-color 320ms cubic-bezier(0.22, 1, 0.36, 1), color 320ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <Nav />
      <Hero />
      <Work />
      <Currently />
      <Timeline />
      <Writing />
      <Contact />
      <Footer />
    </div>
  );
}
