"use client";

/**
 * Career timeline. Hairline brass thread on the left draws in proportional
 * to scroll progress through this section. Each event is anchored to the
 * thread by a small filled brass dot. Year on the left, title + line on
 * the right.
 *
 * Why a thread-draw and not bouncing cards: thread-draw is the editorial
 * version of a "timeline animation." It signals "this is a story with a
 * direction" instead of "look at our cool entrance animations."
 */

import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { usePortfolioTheme, getPortfolioTokens, portfolioFonts } from "../components/theme";

type Milestone = {
  year: string;
  title: string;
  body: string;
  badge?: string;   // optional pill — "talk", "release", "promotion", "left"
};

const TIMELINE: Milestone[] = [
  {
    year: "2026",
    title: "Joined Cmd as tech lead",
    body: "Coordination team. Distributed locks, leases, and the rare service that benefits from being boring.",
  },
  {
    year: "2025",
    title: "Talk at StrangeLoop",
    body: "“Async at the edge.” Recording on YouTube, slides on the site.",
    badge: "talk",
  },
  {
    year: "2024",
    title: "Promoted to Staff at Stripe",
    body: "Recognition for the reconciliation rewrite and three quarters of incident reviews.",
    badge: "promotion",
  },
  {
    year: "2023",
    title: "Open-sourced limiter",
    body: "Two thousand stars in the first month. Most of the issues were thoughtful.",
    badge: "release",
  },
  {
    year: "2021",
    title: "Joined Stripe",
    body: "Acquiring bank integrations team. The work I'm most proud of in this list.",
  },
  {
    year: "2019",
    title: "Left GitHub",
    body: "After five years on search and code intelligence. Knew it was time before HR did.",
    badge: "left",
  },
  {
    year: "2014",
    title: "First commercial Go",
    body: "Two engineers, one repo, four customers. The good kind of small.",
  },
];

export default function Timeline() {
  const { theme } = usePortfolioTheme();
  const portfolioTokens = getPortfolioTokens(theme);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.2"],
  });
  const threadHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      id="timeline"
      style={{
        position: "relative",
        padding: "6rem 0 5rem",
        borderTop: `1px solid ${portfolioTokens.paperRule}`,
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
            Timeline
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
            Twelve years, condensed.
          </h2>
        </div>

        {/* Thread + events
            Geometry:
              container paddingLeft = 9rem   (where the event content starts)
              thread left = 6.5rem,  width 1px   → visual center at 6.5rem + 0.5px
              dot width = 9px  → for dot center to land on thread center,
                                  dot.left (from event edge) must be
                                  6.5rem + 0.5px − 9rem − 4.5px = −2.5rem − 4px
              year x position chosen so it ends ~1rem before the dot. */}
        <div ref={ref} style={{ position: "relative", paddingLeft: "9rem" }} className="timeline-stage">
          {/* Background thread — paper-rule colored */}
          <div
            aria-hidden
            className="timeline-thread"
            style={{
              position: "absolute",
              left: "6.5rem",
              top: 6,
              bottom: 6,
              width: 1,
              background: portfolioTokens.paperRule,
            }}
          />
          {/* Drawn-in thread — brass, length tied to scroll progress */}
          <motion.div
            aria-hidden
            className="timeline-thread"
            style={{
              position: "absolute",
              left: "6.5rem",
              top: 6,
              width: 1,
              height: reduce ? "100%" : threadHeight,
              background: `linear-gradient(180deg, ${portfolioTokens.brass} 0%, ${portfolioTokens.brassDeep} 100%)`,
              boxShadow: `0 0 8px ${portfolioTokens.brass}50`,
            }}
          />

          {TIMELINE.map((m, i) => (
            <motion.div
              key={m.year + m.title}
              initial={reduce ? false : { opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: i * 0.04 }}
              className="timeline-event"
              style={{
                position: "relative",
                paddingBottom: i === TIMELINE.length - 1 ? 0 : "2.5rem",
              }}
            >
              {/* Year — left of the thread, aligned vertically with the title */}
              <span
                className="timeline-year"
                style={{
                  position: "absolute",
                  left: "-7.25rem",
                  top: 0,
                  fontFamily: portfolioFonts.mono,
                  fontSize: "0.8rem",
                  color: portfolioTokens.brass,
                  letterSpacing: "0.04em",
                }}
              >
                {m.year}
              </span>
              {/* Dot — centered exactly on the thread line. See geometry above. */}
              <span
                aria-hidden
                className="timeline-dot"
                style={{
                  position: "absolute",
                  left: "calc(-2.5rem - 4px)",
                  top: 8,
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: portfolioTokens.brass,
                  boxShadow: `0 0 0 4px ${portfolioTokens.paper}, 0 0 12px ${portfolioTokens.brass}60`,
                }}
              />
              <h3
                style={{
                  fontFamily: portfolioFonts.display,
                  fontStyle: "italic",
                  fontWeight: 300,
                  fontSize: "1.35rem",
                  lineHeight: 1.2,
                  letterSpacing: "-0.012em",
                  color: portfolioTokens.ink,
                  margin: 0,
                  display: "inline",
                }}
              >
                {m.title}
              </h3>
              {m.badge ? (
                <span
                  style={{
                    marginLeft: "0.75rem",
                    display: "inline-block",
                    padding: "2px 8px",
                    fontFamily: portfolioFonts.mono,
                    fontSize: "0.66rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: portfolioTokens.brass,
                    border: `1px solid ${portfolioTokens.brassDeep}`,
                    borderRadius: 999,
                    verticalAlign: "0.18em",
                  }}
                >
                  {m.badge}
                </span>
              ) : null}
              <p
                style={{
                  marginTop: "0.55rem",
                  color: portfolioTokens.inkSoft,
                  fontSize: "0.98rem",
                  lineHeight: 1.6,
                  maxWidth: "56ch",
                }}
              >
                {m.body}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Mobile collapse — thread hugs the left edge, year stacks above title.
            On mobile we keep the dot centered on the thread using the same
            geometry: thread at left:0 (1px wide, center at 0.5px), event
            paddingLeft = 1.75rem (28px), so dot.left = 0.5 − 28 − 4.5 = −32px → calc(−1.75rem − 4px). */}
        <style>{`
          @media (max-width: 640px) {
            .timeline-stage { padding-left: 1.75rem !important; }
            .timeline-stage .timeline-thread { left: 0 !important; }
            .timeline-stage .timeline-year {
              position: static !important;
              display: block;
              margin-bottom: 0.4rem;
            }
            .timeline-stage .timeline-dot {
              left: calc(-1.75rem - 4px) !important;
            }
          }
        `}</style>
      </div>
    </section>
  );
}
