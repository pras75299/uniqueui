"use client";

/**
 * Currently — what's in flight. Three short entries.
 * The LEAD entry uses a subtle 3D tilt on hover (~3deg, perspective 1200).
 * Trailing entries are flat. This is the right way to use a tilt card:
 * once per page, on the thing you actually want the eye to land on.
 */

import { motion, useReducedMotion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useRef, type MouseEvent } from "react";
import { usePortfolioTheme, getPortfolioTokens, portfolioFonts } from "../components/theme";
import { cn } from "@/lib/utils";

type Entry = {
  kind: "writing" | "shipping" | "reading";
  title: string;
  detail: string;
  meta: string;
};

const ENTRIES: Entry[] = [
  {
    kind: "shipping",
    title: "Locks v0.3 — semantics nail-down",
    detail:
      "Pinning down what 'fair' means when three replicas disagree. Most of the work is in the docs.",
    meta: "shipping · this quarter",
  },
  {
    kind: "writing",
    title: "On building rate limiters that survive a Reddit hug",
    detail: "First draft. ~3,000 words. The good half is about backpressure.",
    meta: "writing · April 2026",
  },
  {
    kind: "reading",
    title: "Designing Data-Intensive Applications, 2nd ed.",
    detail: "Re-reading. The first edition got me my last two jobs.",
    meta: "reading · ongoing",
  },
];

export default function Currently({ className }: { className?: string }) {
  const { theme } = usePortfolioTheme();
  const portfolioTokens = getPortfolioTokens(theme);
  return (
    <section
      id="currently"
      className={cn(className)}
      style={{
        position: "relative",
        padding: "5rem 0 5rem",
        borderTop: `1px solid ${portfolioTokens.paperRule}`,
        background: `linear-gradient(180deg, transparent 0%, ${portfolioTokens.brassGlow} 100%)`,
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 2rem",
        }}
      >
        {/* Section head */}
        <div style={{ marginBottom: "3rem", maxWidth: "60ch" }}>
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
            In flight
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
            Three things, this week.
          </h2>
        </div>

        {/* Lead + trailing layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
            gap: "2rem",
          }}
          className="currently-grid"
        >
          <LeadEntry entry={ENTRIES[0]} />
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {ENTRIES.slice(1).map((e) => (
              <TrailingEntry key={e.title} entry={e} />
            ))}
          </div>
        </div>

        {/* Mobile collapse — Hallmark gate 64 */}
        <style>{`
          @media (max-width: 768px) {
            .currently-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </section>
  );
}

/* Lead card with subtle 3D tilt. The card never tilts more than 4deg total
   on either axis, and the spring damping is high so the rest position is
   the rule. Anything more and the card becomes the slop fingerprint. */
function LeadEntry({ entry }: { entry: Entry }) {
  const { theme } = usePortfolioTheme();
  const portfolioTokens = getPortfolioTokens(theme);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(rx, { stiffness: 220, damping: 30, mass: 0.6 });
  const rotateY = useSpring(ry, { stiffness: 220, damping: 30, mass: 0.6 });

  const glowX = useTransform(ry, [-4, 4], [-30, 30]);
  const glowY = useTransform(rx, [-4, 4], [30, -30]);

  // Hoisted out of JSX — previously this useTransform was nested inside the
  // motion.div's `style` object literal, which created a new MotionValue +
  // new internal hooks on every render. At top of component it's evaluated
  // once per mount and the MotionValue is stable across rerenders.
  const spotlightBg = useTransform(
    [glowX, glowY],
    ([x, y]) =>
      `radial-gradient(circle at ${50 + (x as number)}% ${50 + (y as number)}%, ${portfolioTokens.brass}15 0%, transparent 50%)`
  );

  function onMove(e: MouseEvent<HTMLDivElement>) {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    ry.set((px - 0.5) * 6);    // ~±3deg
    rx.set((0.5 - py) * 6);
  }

  function onLeave() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        perspective: 1200,
        transformStyle: "preserve-3d",
        rotateX: reduce ? 0 : rotateX,
        rotateY: reduce ? 0 : rotateY,
        background: portfolioTokens.paperRaise,
        border: `1px solid ${portfolioTokens.paperRule}`,
        borderRadius: 6,
        padding: "2rem 2rem 1.75rem",
        position: "relative",
        overflow: "hidden",
        willChange: "transform",
      }}
    >
      {/* Following spotlight glow — brass-tinted */}
      <motion.div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: spotlightBg,
        }}
      />
      <KindBadge kind={entry.kind} />
      <h3
        style={{
          fontFamily: portfolioFonts.display,
          fontStyle: "italic",
          fontWeight: 300,
          fontSize: "1.7rem",
          lineHeight: 1.18,
          letterSpacing: "-0.015em",
          color: portfolioTokens.ink,
          margin: "0.75rem 0 0.85rem",
        }}
      >
        {entry.title}
      </h3>
      <p
        style={{
          color: portfolioTokens.inkSoft,
          fontSize: "0.98rem",
          lineHeight: 1.6,
          margin: 0,
          marginBottom: "1.25rem",
          maxWidth: "44ch",
        }}
      >
        {entry.detail}
      </p>
      <p
        style={{
          fontFamily: portfolioFonts.mono,
          fontSize: "0.72rem",
          letterSpacing: "0.08em",
          color: portfolioTokens.inkMute,
          textTransform: "uppercase",
          margin: 0,
        }}
      >
        {entry.meta}
      </p>
    </motion.div>
  );
}

function TrailingEntry({ entry }: { entry: Entry }) {
  const { theme } = usePortfolioTheme();
  const portfolioTokens = getPortfolioTokens(theme);
  return (
    <div
      style={{
        padding: "1.5rem 1.5rem",
        border: `1px solid ${portfolioTokens.paperRule}`,
        borderRadius: 6,
        background: portfolioTokens.paperRaise,
      }}
    >
      <KindBadge kind={entry.kind} />
      <h3
        style={{
          fontFamily: portfolioFonts.display,
          fontStyle: "italic",
          fontWeight: 300,
          fontSize: "1.15rem",
          lineHeight: 1.25,
          letterSpacing: "-0.01em",
          color: portfolioTokens.ink,
          margin: "0.6rem 0 0.5rem",
        }}
      >
        {entry.title}
      </h3>
      <p
        style={{
          color: portfolioTokens.inkSoft,
          fontSize: "0.875rem",
          lineHeight: 1.55,
          margin: 0,
          marginBottom: "0.75rem",
        }}
      >
        {entry.detail}
      </p>
      <p
        style={{
          fontFamily: portfolioFonts.mono,
          fontSize: "0.7rem",
          letterSpacing: "0.08em",
          color: portfolioTokens.inkMute,
          textTransform: "uppercase",
          margin: 0,
        }}
      >
        {entry.meta}
      </p>
    </div>
  );
}

const KIND_LABEL: Record<Entry["kind"], string> = {
  writing: "writing",
  shipping: "shipping",
  reading: "reading",
};

function KindBadge({ kind }: { kind: Entry["kind"] }) {
  const { theme } = usePortfolioTheme();
  const portfolioTokens = getPortfolioTokens(theme);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        fontFamily: portfolioFonts.mono,
        fontSize: "0.68rem",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: portfolioTokens.brass,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: portfolioTokens.brass,
          display: "inline-block",
        }}
      />
      {KIND_LABEL[kind]}
    </span>
  );
}
