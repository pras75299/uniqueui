"use client";

/**
 * N7 Hairline text nav — anti-slop alternative to the SaaS-default
 * "wordmark + 4 inline links + button-right" archetype.
 *
 * Three rules of restraint:
 *  1. No CTA button. The contact link IS the CTA.
 *  2. No nav background. Just paper-on-paper with a single hairline rule.
 *  3. Hover state is a brass underline drawing in — no color flip, no scale.
 */

import { useState } from "react";
import { usePortfolioTheme, getPortfolioTokens, portfolioFonts, ThemeToggle } from "../components/theme";

const LINKS = [
  { label: "Work",     href: "#work"     },
  { label: "Timeline", href: "#timeline" },
  { label: "Writing",  href: "#writing"  },
];

export default function Nav() {
  const { theme } = usePortfolioTheme();
  const portfolioTokens = getPortfolioTokens(theme);
  // Sticky nav background opacity needs the hex+alpha trick; pre-compute it
  // so we don't repeat the concat inline. E6 ≈ 90% opacity.
  const navBg = `${portfolioTokens.paper}E6`;
  return (
    <nav
      aria-label="Primary"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: navBg,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: `1px solid ${portfolioTokens.paperRule}`,
        transition: "background 320ms cubic-bezier(0.22, 1, 0.36, 1), border-color 320ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "1rem clamp(1rem, 4vw, 2rem)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          fontFamily: portfolioFonts.body,
        }}
      >
        {/* Wordmark — initials + comma, set in display italic. */}
        <a
          href="#top"
          aria-label="Home"
          style={{
            color: portfolioTokens.ink,
            textDecoration: "none",
            fontFamily: portfolioFonts.display,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "1.05rem",
            letterSpacing: "-0.005em",
            flexShrink: 0,
          }}
        >
          E.K.<span style={{ color: portfolioTokens.brass }}>,</span>
        </a>

        {/* Section links — hidden on phones; mailto stays visible everywhere */}
        <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: "2rem", fontSize: "0.84rem" }}>
          {LINKS.map((l) => (
            <NavLink key={l.href} {...l} />
          ))}
        </div>

        {/* Email + theme toggle group — always visible. The CTA of the page. */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
          <NavLink
            label="hello@inkline.dev"
            href="mailto:hello@inkline.dev"
            mono
          />
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile — collapse the section links, keep wordmark + email.
          Also: keyboard focus ring via :focus-visible (replaces the previous
          fragile onKeyDown/onMouseDown style-mutation pattern that left
          orphaned outlines on blur). */}
      <style>{`
        .portfolio-nav-link:focus-visible {
          outline: 2px solid ${portfolioTokens.brassDeep};
          outline-offset: 4px;
          border-radius: 2px;
        }
        @media (max-width: 640px) {
          .nav-links { display: none !important; }
        }
      `}</style>
    </nav>
  );
}

function NavLink({ label, href, mono = false }: { label: string; href: string; mono?: boolean }) {
  const { theme } = usePortfolioTheme();
  const portfolioTokens = getPortfolioTokens(theme);
  // `active` tracks hover OR keyboard focus, so the brass underline draws
  // when the user Tab-navigates through the nav. Previously the underline
  // only fired on mouse hover — keyboard users got no affordance.
  const [active, setActive] = useState(false);
  const activate   = () => setActive(true);
  const deactivate = () => setActive(false);
  return (
    <a
      href={href}
      onMouseEnter={activate}
      onMouseLeave={deactivate}
      onFocus={activate}
      onBlur={deactivate}
      className="portfolio-nav-link"
      style={{
        position: "relative",
        color: active ? portfolioTokens.ink : portfolioTokens.inkSoft,
        textDecoration: "none",
        fontFamily: mono ? portfolioFonts.mono : portfolioFonts.body,
        fontSize: mono ? "0.78rem" : "0.84rem",
        fontWeight: 500,
        transition: "color 200ms ease",
        paddingBottom: "2px",
        outline: "none",
        whiteSpace: "nowrap",
      }}
    >
      {label}
      {/* Brass underline draws from left on hover/focus — no color flip, no scale */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          height: 1,
          width: active ? "100%" : "0%",
          background: portfolioTokens.brass,
          transition: "width 240ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />
    </a>
  );
}
