"use client";

import { motion } from "motion/react";
import { ShinyText } from "@/components/ui/shiny-text";
import { Button as MovingBorderButton } from "@/components/ui/moving-border";
import IsoHero from "../components/iso-hero";

export default function Hero() {
  return (
    <section style={{ position: "relative", overflow: "hidden", paddingTop: "5rem", paddingBottom: "4rem" }}>
      {/* Grid background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage:
            "linear-gradient(rgba(34,211,238,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,0.04) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Radial glow */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 800,
          height: 500,
          pointerEvents: "none",
          background: "radial-gradient(ellipse at center, rgba(34,211,238,0.1) 0%, transparent 65%)",
        }}
      />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem" }}>
        <div
          className="hero-grid"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}
        >
          {/* ── Copy ── */}
          <div>
            {/* Badge with pulsing dot */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.3rem 0.85rem 0.3rem 0.6rem",
                  borderRadius: "999px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  background: "rgba(34,211,238,0.08)",
                  border: "1px solid rgba(34,211,238,0.3)",
                  color: "#22D3EE",
                  backdropFilter: "blur(8px)",
                }}
              >
                {/* Pulsing dot */}
                <span style={{ position: "relative", width: 8, height: 8, display: "inline-flex", flexShrink: 0 }}>
                  <span className="badge-dot-ping" style={{ opacity: 0.6 }} />
                  <span
                    style={{
                      position: "relative",
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#22D3EE",
                      display: "inline-block",
                    }}
                  />
                </span>
                Now in public beta — free forever plan
              </span>
            </motion.div>

            <motion.h1
              className="fs-syne"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              style={{
                fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                marginTop: "1.5rem",
                marginBottom: "1.25rem",
              }}
            >
              Ship workflows{" "}
              <ShinyText text="10× faster." className="fs-syne grad-text" />
              <br />
              Break the bottleneck.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16 }}
              style={{ color: "#94A3B8", fontSize: "1.1rem", maxWidth: 480, marginBottom: "2.25rem" }}
            >
              FlowSync connects your team&apos;s tools into seamless automated pipelines. No-code builder, AI
              suggestions, real-time monitoring — all in one place.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24 }}
              style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}
            >
              <MovingBorderButton
                as="a"
                href="#"
                onClick={(e: React.MouseEvent) => e.preventDefault()}
                borderRadius="0.75rem"
                duration={2500}
                containerClassName="h-12 w-[230px] cursor-pointer"
                borderClassName="bg-[radial-gradient(#F97316_40%,transparent_60%)] opacity-90"
                className="bg-[#090F26] border-[rgba(249,115,22,0.25)] text-white font-semibold text-sm tracking-wide gap-2"
                theme="dark"
              >
                Start free — no card needed
              </MovingBorderButton>

              {/* Watch demo – ghost button with animated play ring */}
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  color: "#94A3B8",
                  fontSize: "0.92rem",
                  fontWeight: 500,
                  textDecoration: "none",
                  padding: "0.65rem 1.4rem 0.65rem 0.9rem",
                  borderRadius: "0.75rem",
                  border: "1px solid rgba(34,211,238,0.18)",
                  background: "rgba(34,211,238,0.03)",
                  cursor: "pointer",
                  transition: "color 0.18s, border-color 0.18s, background 0.18s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#22D3EE";
                  e.currentTarget.style.borderColor = "rgba(34,211,238,0.45)";
                  e.currentTarget.style.background = "rgba(34,211,238,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#94A3B8";
                  e.currentTarget.style.borderColor = "rgba(34,211,238,0.18)";
                  e.currentTarget.style.background = "rgba(34,211,238,0.03)";
                }}
              >
                {/* Play icon with ring */}
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    border: "1.5px solid rgba(34,211,238,0.35)",
                    background: "rgba(34,211,238,0.08)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden>
                    <polygon points="2,1 9,5 2,9" />
                  </svg>
                </span>
                Watch demo
              </a>
            </motion.div>

            {/* Social proof avatars */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginTop: "2rem",
                color: "#64748B",
                fontSize: "0.82rem",
              }}
            >
              <div style={{ display: "flex" }}>
                {["#22D3EE", "#818CF8", "#34D399", "#F97316", "#7DD3FC"].map((c, i) => (
                  <div
                    key={i}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: c,
                      border: "2px solid #060A1F",
                      marginLeft: i > 0 ? -8 : 0,
                      opacity: 0.85,
                    }}
                  />
                ))}
              </div>
              <span>
                <strong style={{ color: "#F0F9FF" }}>2,400+</strong> teams already using FlowSync
              </span>
            </motion.div>
          </div>

          {/* Isometric illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <IsoHero />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
