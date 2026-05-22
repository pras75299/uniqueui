"use client";

/**
 * Writing — archive index. Six entries. No card backgrounds, no thumbnails.
 *
 * The whole row is hover-reactive: brass underline draws under the title,
 * meta brightens, and the trailing arrow slides 4px to the right. That's
 * it. No glow, no scale, no card lift.
 */

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { usePortfolioTheme, getPortfolioTokens, portfolioFonts } from "../components/theme";
import { cn } from "@/lib/utils";

type Essay = {
  title: string;
  date: string;        // YYYY-MM
  dek: string;
  kind: "essay" | "postmortem" | "talk";
  href?: string;
};

const ESSAYS: Essay[] = [
  {
    title: "Why we replaced Redis with Postgres",
    date: "2026-03",
    dek: "Six months in production. The cost analysis nobody asked us to write.",
    kind: "essay",
  },
  {
    title: "Async at the edge",
    date: "2025-09",
    dek: "StrangeLoop 2025 — slides, transcript, and the demo that didn't make the cut.",
    kind: "talk",
  },
  {
    title: "The 47-minute payment outage",
    date: "2025-02",
    dek: "Postmortem. The proximate cause was a stale leader; the root cause was hubris.",
    kind: "postmortem",
  },
  {
    title: "Reading lists for new staff engineers",
    date: "2024-11",
    dek: "Eighteen things to read before your first all-hands. Nine of them aren't about software.",
    kind: "essay",
  },
  {
    title: "On API ergonomics",
    date: "2024-04",
    dek: "Verbs over nouns. Predictable over clever. Why we keep getting this wrong.",
    kind: "essay",
  },
  {
    title: "Operating boring software",
    date: "2023-08",
    dek: "A defense of the unglamorous parts of the job. The longest piece I've written.",
    kind: "essay",
  },
];

const KIND_LABEL: Record<Essay["kind"], string> = {
  essay: "essay",
  postmortem: "postmortem",
  talk: "talk",
};

export default function Writing({ className }: { className?: string }) {
  const { theme } = usePortfolioTheme();
  const portfolioTokens = getPortfolioTokens(theme);
  return (
    <section
      id="writing"
      className={cn(className)}
      style={{
        position: "relative",
        padding: "6rem 0 5rem",
        borderTop: `1px solid ${portfolioTokens.paperRule}`,
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 2rem" }}>
        {/* Section head */}
        <div
          style={{
            marginBottom: "3rem",
            maxWidth: "60ch",
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: "2rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <p
              style={{
                fontFamily: portfolioFonts.mono,
                fontSize: "0.72rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: portfolioTokens.inkMute,
                margin: 0,
                marginBottom: "0.8rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.6rem",
              }}
            >
              <span style={{ width: 16, height: 1, background: portfolioTokens.brass }} />
              Writing
            </p>
            <h2
              style={{
                fontFamily: portfolioFonts.display,
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: "clamp(1.7rem, 3.4vw, 2.4rem)",
                lineHeight: 1.1,
                letterSpacing: "-0.018em",
                color: portfolioTokens.ink,
                margin: 0,
              }}
            >
              A few essays worth keeping.
            </h2>
          </div>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            style={{
              fontFamily: portfolioFonts.mono,
              fontSize: "0.78rem",
              color: portfolioTokens.brass,
              textDecoration: "none",
              borderBottom: `1px solid ${portfolioTokens.brassDeep}`,
              paddingBottom: 2,
              letterSpacing: "0.02em",
            }}
          >
            full archive →
          </a>
        </div>

        {/* Index rows */}
        <ol
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            borderTop: `1px solid ${portfolioTokens.paperRule}`,
          }}
        >
          {ESSAYS.map((e, i) => (
            <EssayRow key={e.title} essay={e} index={i} />
          ))}
        </ol>

        {/* Mobile — collapse to two-col (title + arrow), date moves above the title */}
        <style>{`
          .essay-row-link:focus-visible {
            outline: 2px solid ${portfolioTokens.brassDeep};
            outline-offset: 4px;
            border-radius: 3px;
          }
          @media (max-width: 640px) {
            .essay-row-link {
              grid-template-columns: minmax(0, 1fr) auto !important;
              column-gap: 1rem !important;
            }
            .essay-row-link > div:first-child {
              grid-column: 1 / -1;
              min-width: 0;
            }
          }
        `}</style>
      </div>
    </section>
  );
}

function EssayRow({ essay, index }: { essay: Essay; index: number }) {
  const { theme } = usePortfolioTheme();
  const portfolioTokens = getPortfolioTokens(theme);
  const reduce = useReducedMotion();
  // `active` = hover OR keyboard focus — so the brass underline draws when
  // the user Tab-navigates the archive. Touch + keyboard users get the
  // same affordance as mouse users.
  const [active, setActive] = useState(false);
  const on  = () => setActive(true);
  const off = () => setActive(false);

  return (
    <motion.li
      initial={reduce ? false : { opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: index * 0.04 }}
      style={{
        borderBottom: `1px solid ${portfolioTokens.paperRule}`,
      }}
    >
      <a
        href={essay.href ?? "#"}
        onClick={(e) => e.preventDefault()}
        onMouseEnter={on}
        onMouseLeave={off}
        onFocus={on}
        onBlur={off}
        className="essay-row-link"
        style={{
          display: "grid",
          gridTemplateColumns: "9rem minmax(0, 1fr) auto",
          columnGap: "1.75rem",
          rowGap: "0.3rem",
          alignItems: "baseline",
          padding: "1.5rem 0",
          color: "inherit",
          textDecoration: "none",
          cursor: "pointer",
          outline: "none",
        }}
      >
        {/* Date + kind on the left */}
        <div
          style={{
            minWidth: "9rem",
            fontFamily: portfolioFonts.mono,
            fontSize: "0.76rem",
            color: active ? portfolioTokens.brass : portfolioTokens.inkMute,
            letterSpacing: "0.02em",
            transition: "color 240ms ease",
          }}
        >
          {essay.date} · {KIND_LABEL[essay.kind]}
        </div>

        {/* Title + dek */}
        <div style={{ minWidth: 0 }}>
          <h3
            style={{
              fontFamily: portfolioFonts.display,
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "1.3rem",
              lineHeight: 1.22,
              letterSpacing: "-0.012em",
              color: portfolioTokens.ink,
              margin: 0,
              marginBottom: "0.35rem",
              position: "relative",
              display: "inline",
            }}
          >
            <span style={{ position: "relative" }}>
              {essay.title}
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: -2,
                  height: 1,
                  width: active ? "100%" : "0%",
                  background: portfolioTokens.brass,
                  transition: "width 340ms cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              />
            </span>
          </h3>
          <p
            style={{
              color: portfolioTokens.inkSoft,
              fontSize: "0.92rem",
              lineHeight: 1.55,
              margin: 0,
              maxWidth: "62ch",
            }}
          >
            {essay.dek}
          </p>
        </div>

        {/* Arrow — slides right on hover. alignSelf:center overrides the
            grid's baseline alignment so the arrow vertically centers against
            the full row height (title + dek), not just the title's baseline. */}
        <span
          aria-hidden
          style={{
            alignSelf: "center",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "1.75rem",
            height: "1.75rem",
            fontFamily: portfolioFonts.mono,
            fontSize: "1.4rem",
            fontWeight: 400,
            lineHeight: 1,
            color: active ? portfolioTokens.brass : portfolioTokens.inkSoft,
            transform: active ? "translateX(4px)" : "translateX(0)",
            transition: "transform 240ms cubic-bezier(0.22, 1, 0.36, 1), color 240ms ease",
          }}
        >
          →
        </span>
      </a>
    </motion.li>
  );
}
