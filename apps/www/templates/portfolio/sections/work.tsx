"use client";

/**
 * Selected Work — magazine-style index, not a card grid.
 *
 * Each entry is a numbered row: year · title · meta · expandable detail.
 * Hover reveals the expanded detail (tech, link, role) AND a subtle brass
 * underscore beneath the title. No card backgrounds. Hairline rules only.
 *
 * Why this archetype (not a 3-col card grid):
 *  • Editorial voice wants list-form, not gallery-form.
 *  • Engineers reading another engineer's portfolio scan top-to-bottom.
 *  • A card grid forces 6-9 equal-weight projects. Real careers have
 *    one or two flagships and a long tail — list form expresses that.
 */

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { usePortfolioTheme, getPortfolioTokens, portfolioFonts } from "../components/theme";

type Project = {
  year: string;
  title: string;
  role: string;
  employer: string;
  description: string;
  stack: string[];
  outcome?: string;       // single-line outcome — only fill when REAL
  link?: { label: string; href: string };
};

const PROJECTS: Project[] = [
  {
    year: "2026",
    title: "Distributed lock service",
    role: "Tech lead",
    employer: "Cmd",
    description:
      "A coordination primitive used by four internal teams. Replaces an in-house Redis-based shim that wedged twice a quarter.",
    stack: ["Rust", "etcd", "Raft", "OpenTelemetry"],
    outcome: "p99 lock acquisition 340ms → 180ms",
    link: { label: "Read the design doc", href: "#" },
  },
  {
    year: "2024 — 2025",
    title: "Payments reconciliation pipeline",
    role: "Staff engineer",
    employer: "Stripe",
    description:
      "Streaming pipeline reconciling ledger entries across 14 acquiring banks. Replaced a batch system that lost an hour every European morning.",
    stack: ["Go", "Kafka", "Postgres", "dbt"],
    link: { label: "Engineering blog post", href: "#" },
  },
  {
    year: "2023",
    title: "Code search ranking",
    role: "Senior engineer",
    employer: "GitHub",
    description:
      "Replaced the legacy lexical ranker with a hybrid scorer. Took a quarter; shipped behind a flag for two more.",
    stack: ["Ruby", "Rust", "Elasticsearch"],
  },
  {
    year: "2022",
    title: "Observability for a 200-engineer org",
    role: "Independent consultant",
    employer: "—",
    description:
      "An honest tracing rollout. Took three months. Killed two of the company's four dashboards because nobody read them.",
    stack: ["OpenTelemetry", "Grafana", "Tempo"],
  },
  {
    year: "2020 — 2021",
    title: "Open-source: limiter",
    role: "Maintainer",
    employer: "—",
    description:
      "A small, well-tested rate limiter library. The good kind of project — narrow, finished, and used by people I respect.",
    stack: ["Go"],
    link: { label: "github.com/eli/limiter", href: "#" },
  },
];

export default function Work() {
  const { theme } = usePortfolioTheme();
  const portfolioTokens = getPortfolioTokens(theme);
  return (
    <section
      id="work"
      style={{
        position: "relative",
        padding: "6rem 0 4rem",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 2rem",
        }}
      >
        {/* Section head — kicker + serif heading, stacked vertical (Hallmark gate 66) */}
        <div style={{ marginBottom: "3.5rem", maxWidth: "60ch" }}>
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
            Selected work · 2020 — present
          </p>
          <h2
            style={{
              fontFamily: portfolioFonts.display,
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "clamp(1.85rem, 3.8vw, 2.8rem)",
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              color: portfolioTokens.ink,
              margin: 0,
            }}
          >
            Five projects worth talking about.
          </h2>
          <p
            style={{
              marginTop: "1rem",
              color: portfolioTokens.inkSoft,
              fontSize: "1rem",
              lineHeight: 1.6,
              maxWidth: "52ch",
            }}
          >
            Listed in reverse chronological order. Hover any entry for the technical detail —
            stacks, links, and the one number worth remembering.
          </p>
        </div>

        {/* Project rows */}
        <ol
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            borderTop: `1px solid ${portfolioTokens.paperRule}`,
          }}
        >
          {PROJECTS.map((p, i) => (
            <ProjectRow key={p.title} index={i} project={p} />
          ))}
        </ol>

        {/* Mobile — collapse to single column, year/number above title */}
        <style>{`
          @media (max-width: 640px) {
            .project-row-grid {
              grid-template-columns: 1fr !important;
              row-gap: 0.55rem;
            }
          }
        `}</style>
      </div>
    </section>
  );
}

function ProjectRow({ project, index }: { project: Project; index: number }) {
  const { theme } = usePortfolioTheme();
  const portfolioTokens = getPortfolioTokens(theme);
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);
  const num = String(index + 1).padStart(2, "0");

  return (
    <motion.li
      initial={reduce ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: index * 0.05 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocusCapture={() => setHover(true)}
      onBlurCapture={(e) => {
        // Keep the reveal open if focus moves between the row's own children
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHover(false);
      }}
      className="project-row"
      style={{
        borderBottom: `1px solid ${portfolioTokens.paperRule}`,
        padding: "2.25rem 0",
        // No cursor:pointer — the <li> itself isn't clickable; only the
        // hover-revealed link is. Pointer-on-row was a misleading affordance.
        position: "relative",
      }}
    >
      <div
        className="project-row-grid"
        style={{
          display: "grid",
          // Fixed-width left column so all rows align vertically regardless
          // of year-string length ("2024 — 2025" vs "2026").
          gridTemplateColumns: "11rem minmax(0, 1fr)",
          columnGap: "2.5rem",
          alignItems: "baseline",
        }}
      >
        {/* Numeric prefix + year — mono, brass on hover */}
        <div
          style={{
            fontFamily: portfolioFonts.mono,
            fontSize: "0.78rem",
            color: hover ? portfolioTokens.brass : portfolioTokens.inkMute,
            letterSpacing: "0.04em",
            transition: "color 240ms ease",
            whiteSpace: "nowrap",
          }}
        >
          {num} · {project.year}
        </div>

        {/* Title + meta + (hover-revealed) detail */}
        <div style={{ minWidth: 0 }}>
          <h3
            style={{
              fontFamily: portfolioFonts.display,
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "clamp(1.5rem, 3vw, 2.1rem)",
              lineHeight: 1.15,
              letterSpacing: "-0.015em",
              color: portfolioTokens.ink,
              margin: 0,
              marginBottom: "0.45rem",
              position: "relative",
              display: "inline-block",
              maxWidth: "100%",
              overflowWrap: "anywhere" as const,
            }}
          >
            {project.title}
            {/* Brass underscore drawing in on hover — left to right */}
            <span
              aria-hidden
              style={{
                position: "absolute",
                left: 0,
                bottom: -3,
                height: 1,
                width: hover ? "100%" : "0%",
                background: portfolioTokens.brass,
                transition: "width 380ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            />
          </h3>

          <p
            style={{
              fontFamily: portfolioFonts.mono,
              fontSize: "0.78rem",
              color: portfolioTokens.inkMute,
              letterSpacing: "0.02em",
              margin: 0,
              marginBottom: "0.85rem",
            }}
          >
            {project.role} · {project.employer}
          </p>

          <p
            style={{
              color: portfolioTokens.inkSoft,
              fontSize: "1rem",
              lineHeight: 1.6,
              margin: 0,
              marginBottom: "1rem",
              maxWidth: "58ch",
            }}
          >
            {project.description}
          </p>

          {/* Hover-reveal detail strip — height transition + brass hairline */}
          <motion.div
            initial={false}
            animate={{
              height: hover ? "auto" : 0,
              opacity: hover ? 1 : 0,
            }}
            transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                paddingTop: "0.75rem",
                paddingBottom: "0.25rem",
                borderTop: `1px solid ${portfolioTokens.paperRule}`,
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1.25rem",
                fontFamily: portfolioFonts.mono,
                fontSize: "0.76rem",
                color: portfolioTokens.inkSoft,
                letterSpacing: "0.02em",
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {project.stack.map((s) => (
                  <span
                    key={s}
                    style={{
                      padding: "3px 9px",
                      border: `1px solid ${portfolioTokens.paperRule}`,
                      borderRadius: 3,
                      color: portfolioTokens.inkSoft,
                      background: portfolioTokens.paperRaise,
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>

              {project.outcome ? (
                <span style={{ color: portfolioTokens.brass }}>
                  → {project.outcome}
                </span>
              ) : null}

              {project.link ? (
                <a
                  href={project.link.href}
                  onClick={(e) => e.preventDefault()}
                  style={{
                    marginLeft: "auto",
                    color: portfolioTokens.ink,
                    textDecoration: "none",
                    borderBottom: `1px solid ${portfolioTokens.brass}`,
                    paddingBottom: 1,
                  }}
                >
                  {project.link.label} →
                </a>
              ) : null}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.li>
  );
}
