"use client";

/**
 * Hallmark · hero · genre: editorial
 * Motion language: magazine page-load + ambient drift
 *
 * Four primitives (1 over Hallmark's recommended cap of 3 — deliberate;
 * three are entrance, one is continuous ambient motion):
 *
 *   1. HAIRLINE DRAW — top rule and brass eyebrow rule scale 0→1 from center.
 *   2. TYPE SETTLE — eyebrow + headline + body + status fade with Y drift +
 *      letter-spacing tightening (-0.012em → -0.025em). Linotype settling feel.
 *   3. ITALIC ACCENT BEAT — "every day." arrives 240ms after the rest of the
 *      headline with its own opacity + 2px lift. Editorial pause before punch.
 *   4. ORBITING GLOW (continuous) — one large blurred orb travels a circular
 *      path around the hero's center over 50s, linear, repeat:infinity. The
 *      orb is positioned off-center inside a rotating container; as the
 *      container spins, the orb traces a circle. Reads as a slow searchlight
 *      sweeping a magazine spread. In dark mode it's brass (warm); in light
 *      mode it shifts to deep ink-blue — cool contrast against cream paper.
 *      This is the single design-system place where the accent diverges by
 *      mode (controlled via the `orbAccent` token in theme.tsx).
 *
 * Z-stack inside <section>:
 *   0 — orbiting glow
 *   2 — top hairline rule
 *   3 — content (eyebrow, headline, paragraphs, status)
 *
 * Reduced motion: orb locks to its starting position (still visible as a
 * static glow); all entrance primitives collapse to ≤150ms opacity-only.
 */

import { motion, useReducedMotion } from "motion/react";
import type { Variants } from "motion/react";
import { usePortfolioTheme, getPortfolioTokens, portfolioFonts } from "../components/theme";
import { cn } from "@/lib/utils";

const STATUS_LINE = "building a distributed lock service · reading G. Bertrand";
const EASE = [0.22, 1, 0.36, 1] as const;

export default function Hero({ className }: { className?: string }) {
  const { theme } = usePortfolioTheme();
  const tokens = getPortfolioTokens(theme);
  const reduce = useReducedMotion();

  // Reduced-motion variants collapse spatial motion to opacity-only ≤150ms,
  // per Hallmark gates. Otherwise we run the full settle.
  const settleY = (delay: number): Variants => ({
    hidden: reduce
      ? { opacity: 0 }
      : { opacity: 0, y: 4, letterSpacing: "-0.012em" },
    visible: reduce
      ? { opacity: 1, transition: { duration: 0.15, ease: EASE } }
      : {
          opacity: 1,
          y: 0,
          letterSpacing: "-0.025em",
          transition: { duration: 0.7, ease: EASE, delay },
        },
  });

  const settle = (delay: number): Variants => ({
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 4 },
    visible: reduce
      ? { opacity: 1, transition: { duration: 0.15, ease: EASE } }
      : { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE, delay } },
  });

  // Hairline draws from center outward — scaleX 0 → 1, transform-origin: center
  const ruleDraw: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 1, scaleX: 0 },
    visible: reduce
      ? { opacity: 1, transition: { duration: 0.15, ease: EASE } }
      : {
          scaleX: 1,
          transition: { duration: 0.7, ease: EASE },
        },
  };

  return (
    <section
      id="top"
      className={cn("portfolio-hero", className)}
      style={{
        position: "relative",
        overflow: "hidden",
        paddingTop: "clamp(4.5rem, 9vw, 8rem)",
        paddingBottom: "clamp(4rem, 8vw, 7rem)",
      }}
    >
      {/* PRIMITIVE 4 — ORBITING GLOW (continuous).
          A single blurred orb that orbits the hero's center. The trick:
          we wrap a static-positioned orb inside a rotating container. The
          container spins 360° over 50s (linear, infinite). The orb sits
          off-center inside the container, so when the container rotates,
          the orb traces a circle around the container's center — which
          is also the section's center.

          Color comes from `tokens.orbAccent` (brass in dark, ink-blue in
          light). Outer opacity is 1 (per request); the gradient itself has
          a moderate alpha at the centre so it reads as warm light, not a
          solid disc. Heavy blur (100px) is what turns this into ambient
          room light instead of "a glowing ball". */}
      <motion.div
        aria-hidden="true"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={
          reduce
            ? undefined
            : {
                duration: 50,
                ease: "linear",
                repeat: Infinity,
                repeatType: "loop",
              }
        }
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          willChange: "transform",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "50%",
            width: "min(55vw, 760px)",
            height: "min(55vw, 760px)",
            transform: "translate(-50%, -50%)",
            // Gradient alpha stops drive visible intensity (outer opacity stays 1
            // per spec). Stepped up from 55/1A → CC/66: center ~80% alpha,
            // mid ~40%, transparent at 65%. Combined with 90px blur the orb
            // reads as a strong but diffused light source, not a sharp disc.
            background: `radial-gradient(circle, ${tokens.orbAccent}CC 0%, ${tokens.orbAccent}66 35%, transparent 65%)`,
            filter: "blur(90px)",
            opacity: 1,
            transition: "background 320ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </motion.div>

      {/* PRIMITIVE 1 — hairline draw at the very top of the hero. z:2 */}
      <motion.div
        aria-hidden
        initial="hidden"
        animate="visible"
        variants={ruleDraw}
        style={{
          position: "absolute",
          top: 0,
          left: "max(2rem, 50% - 550px)",
          right: "max(2rem, 50% - 550px)",
          height: 1,
          background: `linear-gradient(90deg, transparent 0%, ${tokens.paperRule} 20%, ${tokens.paperRule} 80%, transparent 100%)`,
          transformOrigin: "center",
          zIndex: 2,
          willChange: "transform",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 3,
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 2rem",
        }}
      >
        {/* Eyebrow */}
        <motion.p
          initial="hidden"
          animate="visible"
          variants={settle(0.15)}
          style={{
            fontFamily: portfolioFonts.mono,
            fontSize: "0.75rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: tokens.inkMute,
            margin: 0,
            marginBottom: "2.5rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.75rem",
            transition: "color 320ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {/* Tiny brass rule next to the eyebrow — also draws from center */}
          <motion.span
            aria-hidden
            initial="hidden"
            animate="visible"
            variants={ruleDraw}
            style={{
              display: "inline-block",
              width: 24,
              height: 1,
              background: tokens.brass,
              transformOrigin: "center",
              willChange: "transform",
            }}
          />
          A profile · vol. 7
        </motion.p>

        {/* PRIMITIVE 2 — type settle on the headline.
            The whole h1 is wrapped so the letterSpacing tightens in lockstep
            across both lines of roman + the italic punch line below. */}
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={settleY(0.22)}
          style={{
            fontFamily: portfolioFonts.display,
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: "clamp(2.6rem, 6vw, 5.2rem)",
            lineHeight: 1.02,
            color: tokens.ink,
            margin: 0,
            marginBottom: "2.25rem",
            maxWidth: "20ch",
            overflowWrap: "anywhere" as const,
            minWidth: 0,
            transition: "color 320ms cubic-bezier(0.22, 1, 0.36, 1)",
            willChange: "transform, letter-spacing",
          }}
        >
          I build infrastructure
          <br />
          for teams that ship
          <br />
          {/* PRIMITIVE 3 — italic accent beat. Brass-italic phrase animates
              separately, 240ms after the headline begins, giving it a beat. */}
          <motion.span
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 2 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{
              duration: reduce ? 0.15 : 0.6,
              ease: EASE,
              delay: reduce ? 0.1 : 0.46,
            }}
            style={{
              display: "inline-block",
              color: tokens.brass,
              willChange: "transform",
            }}
          >
            every day.
          </motion.span>
        </motion.h1>

        {/* Opening paragraph */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={settle(0.36)}
          style={{
            maxWidth: "52ch",
            color: tokens.inkSoft,
            fontSize: "1.075rem",
            lineHeight: 1.65,
            transition: "color 320ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <p style={{ margin: 0, marginBottom: "1.1rem" }}>
            <span style={{ color: tokens.ink, fontWeight: 500 }}>Eli Kaczmarek</span> — staff
            engineer working on distributed systems and developer tooling. I care about how software
            holds up at 3 a.m., not how it demos.
          </p>
          <p style={{ margin: 0 }}>
            I write about API design, incident postmortems, and the quiet craft of operating
            software in production. The good parts of this job rarely make a screenshot.
          </p>
        </motion.div>

        {/* Status line — fades in last as a single editorial beat.
            (Previously a typewriter; the typewriter is the dev-portfolio AI
            default. Plain fade-in with the same settle keeps it editorial.) */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={settle(0.62)}
          style={{
            marginTop: "3rem",
            display: "inline-flex",
            alignItems: "center",
            flexWrap: "wrap",
            rowGap: "0.35rem",
            gap: "0.65rem 0.85rem",
            maxWidth: "100%",
            fontFamily: portfolioFonts.mono,
            fontSize: "0.82rem",
            color: tokens.inkSoft,
            letterSpacing: "0.01em",
            padding: "0.65rem 1rem 0.65rem 0.85rem",
            border: `1px solid ${tokens.paperRule}`,
            borderRadius: 4,
            background: `${tokens.paperRaise}40`,
            transition: "background 320ms cubic-bezier(0.22, 1, 0.36, 1), border-color 320ms cubic-bezier(0.22, 1, 0.36, 1), color 320ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {/* Brass dot — softly pulses to signal the line is "current" */}
          <motion.span
            aria-hidden
            animate={reduce ? undefined : { opacity: [0.65, 1, 0.65] }}
            transition={reduce ? undefined : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: tokens.brass,
              boxShadow: `0 0 8px ${tokens.brass}`,
              flexShrink: 0,
            }}
          />
          <span style={{ color: tokens.brass, fontWeight: 500 }}>currently</span>
          <span style={{ color: tokens.inkMute }}>—</span>
          <span style={{ minWidth: 0, overflowWrap: "anywhere" }}>{STATUS_LINE}</span>
        </motion.div>
      </div>
    </section>
  );
}
