"use client";

import { ScrollReveal } from "@/components/ui/scroll-reveal";

const TESTIMONIALS = [
  {
    quote:
      "FlowSync cut our deployment pipeline setup from a week to an afternoon. The visual builder is genuinely addictive.",
    name: "Priya Mehta",
    role: "Staff Engineer · Stripe",
    color: "#22D3EE",
  },
  {
    quote:
      "We replaced four separate automation tools with FlowSync. The AI suggestions alone have saved our team 20+ hours per sprint.",
    name: "Marcus Chen",
    role: "Head of Platform · Vercel",
    color: "#818CF8",
  },
  {
    quote:
      "The observability features are best-in-class. When something breaks, we know in seconds exactly where and why.",
    name: "Sara Lindqvist",
    role: "DevOps Lead · Linear",
    color: "#34D399",
  },
];

export default function Testimonials() {
  return (
    <section
      style={{
        padding: "6rem 1.5rem",
        background: "linear-gradient(180deg, transparent 0%, rgba(13,22,52,0.6) 100%)",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <ScrollReveal animation="fade-up">
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div
              style={{
                width: 48,
                height: 3,
                background: "linear-gradient(90deg, #22D3EE, transparent)",
                borderRadius: 2,
                margin: "0 auto 1rem",
              }}
            />
            <span
              style={{
                display: "inline-block",
                padding: "0.2rem 0.6rem",
                background: "rgba(34,211,238,0.1)",
                color: "#22D3EE",
                fontSize: "0.7rem",
                fontWeight: 600,
                borderRadius: "0.35rem",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: "0.75rem",
              }}
            >
              Testimonials
            </span>
            <h2
              className="fs-syne"
              style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 700 }}
            >
              Loved by engineering teams
            </h2>
          </div>
        </ScrollReveal>

        <div
          className="testimonials-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.25rem" }}
        >
          {TESTIMONIALS.map((t, i) => (
            <ScrollReveal key={t.name} animation="fade-up" delay={i * 0.12}>
              <div
                style={{
                  position: "relative",
                  background: "linear-gradient(145deg, #0D1634 0%, #0A1228 100%)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderTop: `2px solid ${t.color}`,
                  borderRadius: "1rem",
                  padding: "1.75rem 1.5rem 1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.1rem",
                  overflow: "hidden",
                }}
              >
                {/* Subtle corner glow */}
                <div
                  style={{
                    position: "absolute",
                    top: -40,
                    right: -40,
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${t.color}18 0%, transparent 70%)`,
                    pointerEvents: "none",
                  }}
                />

                {/* Stars */}
                <div style={{ display: "flex", gap: "0.25rem" }}>
                  {[...Array(5)].map((_, si) => (
                    <svg key={si} width="13" height="13" viewBox="0 0 24 24" fill={t.color} aria-hidden>
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <div style={{ position: "relative" }}>
                  {/* Decorative large quote mark */}
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      top: -8,
                      left: -4,
                      fontSize: "3.5rem",
                      lineHeight: 1,
                      color: t.color,
                      opacity: 0.15,
                      fontFamily: "Georgia, 'Times New Roman', serif",
                      userSelect: "none",
                    }}
                  >
                    &ldquo;
                  </span>
                  <p
                    style={{
                      color: "#CBD5E1",
                      fontSize: "0.88rem",
                      lineHeight: 1.8,
                      fontStyle: "italic",
                      paddingLeft: "0.5rem",
                      position: "relative",
                    }}
                  >
                    {t.quote}
                  </p>
                </div>

                {/* Divider */}
                <div
                  style={{
                    height: 1,
                    background: `linear-gradient(90deg, ${t.color}30, transparent)`,
                  }}
                />

                {/* Author */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                  {/* Avatar */}
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${t.color}30, ${t.color}10)`,
                      border: `1.5px solid ${t.color}50`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      color: t.color,
                      flexShrink: 0,
                    }}
                  >
                    {t.name[0]}
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "#F0F9FF",
                        marginBottom: "0.15rem",
                        lineHeight: 1,
                      }}
                    >
                      {t.name}
                    </p>
                    <p style={{ fontSize: "0.72rem", color: "#64748B", lineHeight: 1 }}>{t.role}</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
