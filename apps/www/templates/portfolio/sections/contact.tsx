"use client";

/**
 * Contact — the closing CTA. Editorial restraint: a 2-sentence paragraph,
 * the email rendered as a large interactive element (mailto link styled
 * like a serif headline), and two tiny social links underneath.
 *
 * Not a contact form. Not a Calendly embed. Not a "let's chat" button.
 * The page has earned the right by section 7 to just say what the email is.
 */

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { usePortfolioTheme, getPortfolioTokens, portfolioFonts } from "../components/theme";

const EMAIL = "hello@inkline.dev";
const SOCIALS = [
  { label: "github", href: "https://github.com" },
  { label: "bluesky", href: "https://bsky.app" },
];

export default function Contact() {
  const { theme } = usePortfolioTheme();
  const portfolioTokens = getPortfolioTokens(theme);
  const reduce = useReducedMotion();
  // `active` = hover OR keyboard focus, same pattern as Nav + Writing rows
  const [active, setActive] = useState(false);
  const on  = () => setActive(true);
  const off = () => setActive(false);

  return (
    <section
      style={{
        position: "relative",
        padding: "6rem 0 7rem",
        borderTop: `1px solid ${portfolioTokens.paperRule}`,
        background: `radial-gradient(ellipse 60% 40% at 50% 100%, ${portfolioTokens.brassGlow} 0%, transparent 70%)`,
      }}
    >
      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "0 2rem",
          textAlign: "left",
        }}
      >
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: portfolioFonts.mono,
            fontSize: "0.72rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: portfolioTokens.inkMute,
            margin: 0,
            marginBottom: "1.25rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.6rem",
          }}
        >
          <span style={{ width: 16, height: 1, background: portfolioTokens.brass }} />
          Get in touch
        </motion.p>

        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
          style={{
            fontFamily: portfolioFonts.display,
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: "clamp(2rem, 4.4vw, 3.4rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.022em",
            color: portfolioTokens.ink,
            margin: 0,
            marginBottom: "1.5rem",
            maxWidth: "16ch",
            // Browsers balance the two lines; no hardcoded <br> that
            // creates orphans at tablet widths.
            textWrap: "balance",
            overflowWrap: "anywhere",
            minWidth: 0,
          }}
        >
          I read every message I get.
        </motion.h2>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
          style={{
            color: portfolioTokens.inkSoft,
            fontSize: "1.075rem",
            lineHeight: 1.65,
            maxWidth: "52ch",
            margin: 0,
            marginBottom: "2.5rem",
          }}
        >
          Cold notes about distributed systems or developer tooling, requests to talk over
          something you&apos;re stuck on, or — best of all — links to things you&apos;ve built. I&apos;m bad
          at replying within the same day, but I do reply.
        </motion.p>

        {/* Email — sized like a sub-headline, hover draws a brass rule underneath */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
          style={{ marginBottom: "2rem" }}
        >
          <a
            href={`mailto:${EMAIL}`}
            onMouseEnter={on}
            onMouseLeave={off}
            onFocus={on}
            onBlur={off}
            className="contact-email-link"
            style={{
              display: "inline-block",
              fontFamily: portfolioFonts.display,
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "clamp(1.4rem, 3.2vw, 2.4rem)",
              letterSpacing: "-0.018em",
              color: portfolioTokens.ink,
              textDecoration: "none",
              position: "relative",
              maxWidth: "100%",
              overflowWrap: "anywhere",
              outline: "none",
            }}
          >
            {EMAIL}
            <span
              aria-hidden
              style={{
                position: "absolute",
                left: 0,
                bottom: -4,
                height: 2,
                width: active ? "100%" : "16%",
                background: portfolioTokens.brass,
                transition: "width 420ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            />
          </a>
          <style>{`
            .contact-email-link:focus-visible {
              outline: 2px solid ${portfolioTokens.brassDeep};
              outline-offset: 6px;
              border-radius: 3px;
            }
          `}</style>
        </motion.div>

        {/* Socials — tiny, mono, brass-hovered */}
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.26 }}
          style={{
            display: "flex",
            gap: "1.5rem",
            fontFamily: portfolioFonts.mono,
            fontSize: "0.8rem",
            color: portfolioTokens.inkSoft,
            letterSpacing: "0.01em",
          }}
        >
          {SOCIALS.map((s, i) => (
            <span
              key={s.label}
              style={{ display: "inline-flex", alignItems: "center", gap: "1.5rem" }}
            >
              <a
                href={s.href}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: portfolioTokens.inkSoft,
                  textDecoration: "none",
                  borderBottom: `1px solid ${portfolioTokens.paperRule}`,
                  paddingBottom: 1,
                  transition: "color 240ms ease, border-color 240ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = portfolioTokens.brass;
                  e.currentTarget.style.borderBottomColor = portfolioTokens.brass;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = portfolioTokens.inkSoft;
                  e.currentTarget.style.borderBottomColor = portfolioTokens.paperRule;
                }}
              >
                {s.label} ↗
              </a>
              {i < SOCIALS.length - 1 ? (
                <span aria-hidden style={{ color: portfolioTokens.inkMute }}>·</span>
              ) : null}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
