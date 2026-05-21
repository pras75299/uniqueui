"use client";

/**
 * Ft6 Colophon — editorial closing. NOT a 4-column link grid.
 *
 * A colophon is the small block at the back of a magazine that names the
 * fonts, the printer, and the date. It's the right archetype for an
 * editorial portfolio because it signals: this site is a deliberate
 * object, made by a person, dated.
 */

import { usePortfolioTheme, getPortfolioTokens, portfolioFonts } from "../components/theme";

// Hoisted out of render: `new Date().getFullYear()` inside JSX risks a
// server↔client hydration mismatch around year boundaries, and was being
// re-evaluated on every render. Evaluating once at module load is fine for
// a footer copyright — the page reloads at year change anyway.
const COPYRIGHT_YEAR = new Date().getFullYear();

export default function Footer() {
  const { theme } = usePortfolioTheme();
  const portfolioTokens = getPortfolioTokens(theme);
  return (
    <footer
      style={{
        position: "relative",
        padding: "2.5rem 0 3rem",
        borderTop: `1px solid ${portfolioTokens.paperRule}`,
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 2rem",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1.5rem",
          fontFamily: portfolioFonts.mono,
          fontSize: "0.72rem",
          letterSpacing: "0.04em",
          color: portfolioTokens.inkMute,
          lineHeight: 1.8,
        }}
      >
        {/* Colophon body — left */}
        <div style={{ maxWidth: "60ch" }}>
          <p style={{ margin: 0 }}>
            <span style={{ color: portfolioTokens.brass }}>Colophon.</span> Set in{" "}
            <span style={{ color: portfolioTokens.inkSoft, fontFamily: portfolioFonts.display, fontStyle: "italic" }}>
              Fraunces
            </span>{" "}
            for display and{" "}
            <span style={{ color: portfolioTokens.inkSoft }}>Geist</span> for body. Code in{" "}
            <span style={{ color: portfolioTokens.inkSoft }}>Geist Mono</span>. Built in Next.js, hosted on Vercel.
          </p>
          <p style={{ margin: 0, marginTop: "0.4rem" }}>
            Source on{" "}
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              style={{
                color: portfolioTokens.inkSoft,
                textDecoration: "none",
                borderBottom: `1px solid ${portfolioTokens.paperRule}`,
                paddingBottom: 1,
              }}
            >
              GitHub
            </a>
            . Last shipped 2026-04. No analytics.
          </p>
        </div>

        {/* Signature — right */}
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0 }}>
            <span style={{ color: portfolioTokens.brass }}>§</span> Eli Kaczmarek
          </p>
          <p style={{ margin: 0, marginTop: "0.4rem" }}>
            San Francisco · {COPYRIGHT_YEAR}
          </p>
        </div>
      </div>
    </footer>
  );
}
