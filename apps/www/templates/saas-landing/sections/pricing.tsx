"use client";

import { useState } from "react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { BorderBeam } from "@/components/ui/border-beam";
import { Button as MovingBorderButton } from "@/components/ui/moving-border";

type Plan = {
  name: string;
  price: number | null;
  desc: string;
  highlight: boolean;
  features: string[];
  cta: string;
};

function getPlans(annual: boolean): Plan[] {
  return [
    {
      name: "Starter",
      price: 0,
      desc: "Perfect for solo builders and small experiments.",
      highlight: false,
      features: ["5 active workflows", "500 workflow runs/mo", "3 integrations", "Community support", "7-day run history"],
      cta: "Get started free",
    },
    {
      name: "Pro",
      price: annual ? 39 : 49,
      desc: "For growing teams that need power and reliability.",
      highlight: true,
      features: [
        "Unlimited workflows",
        "50,000 runs/mo",
        "200+ integrations",
        "Priority support",
        "90-day history",
        "AI suggestions",
        "Custom webhooks",
      ],
      cta: "Start Pro trial",
    },
    {
      name: "Enterprise",
      price: null,
      desc: "Dedicated infrastructure, SLAs, and white-glove onboarding.",
      highlight: false,
      features: [
        "Unlimited everything",
        "SSO & SAML",
        "Audit logs",
        "99.99% uptime SLA",
        "Custom integrations",
        "Dedicated CSM",
        "On-premise option",
      ],
      cta: "Contact sales",
    },
  ];
}

function PriceDisplay({ price }: { price: number | null }) {
  if (price === null) return <span style={{ fontSize: "1.6rem" }}>Custom</span>;
  if (price === 0) return <>Free</>;
  return (
    <>
      <span
        style={{ fontSize: "1rem", fontWeight: 500, verticalAlign: "top", marginTop: "0.6rem", display: "inline-block" }}
      >
        $
      </span>
      {price}
      <span style={{ fontSize: "0.9rem", fontWeight: 400, color: "#64748B" }}>/mo</span>
    </>
  );
}

function FeatureList({ features }: { features: string[] }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
      {features.map((f) => (
        <li key={f} style={{ fontSize: "0.875rem", color: "#94A3B8", display: "flex", alignItems: "center" }}>
          <span className="check">✓</span>
          {f}
        </li>
      ))}
    </ul>
  );
}

export default function Pricing() {
  const [annual, setAnnual] = useState(true);
  const plans = getPlans(annual);

  return (
    <section style={{ padding: "6rem 1.5rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <ScrollReveal animation="fade-up">
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div className="section-divider" style={{ margin: "0 auto 1rem" }} />
            <span className="feat-tag" style={{ display: "inline-block", marginBottom: "0.75rem" }}>
              Pricing
            </span>
            <h2
              className="fs-syne"
              style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 700, marginBottom: "1rem" }}
            >
              Simple, transparent pricing
            </h2>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div className="toggle-pill" role="group" aria-label="Billing interval">
                <button
                  type="button"
                  className={`toggle-option${!annual ? " active" : ""}`}
                  aria-pressed={!annual}
                  onClick={() => setAnnual(false)}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  className={`toggle-option${annual ? " active" : ""}`}
                  aria-pressed={annual}
                  onClick={() => setAnnual(true)}
                >
                  Annual
                  <span
                    style={{
                      marginLeft: "0.4rem",
                      fontSize: "0.7rem",
                      background: "rgba(34,211,238,0.15)",
                      color: "#22D3EE",
                      padding: "0.1rem 0.4rem",
                      borderRadius: "0.3rem",
                    }}
                  >
                    Save 20%
                  </span>
                </button>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <div
          className="pricing-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.25rem", alignItems: "start" }}
        >
          {plans.map((plan, i) => (
            <ScrollReveal key={plan.name} animation="fade-up" delay={i * 0.1}>
              {plan.highlight ? (
                <BorderBeam
                  colorFrom="#22D3EE"
                  colorTo="#818CF8"
                  duration={4}
                  theme="dark"
                  className="rounded-2xl bg-[#0E1E45]"
                >
                  <div style={{ padding: "1.75rem", position: "relative" }}>
                    {/* Most popular badge */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "linear-gradient(90deg, #22D3EE, #818CF8)",
                        color: "#060A1F",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        padding: "0.25rem 1rem",
                        borderRadius: "0 0 0.6rem 0.6rem",
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                      }}
                    >
                      Most popular
                    </div>
                    <p
                      style={{
                        color: "#94A3B8",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        marginBottom: "0.5rem",
                        marginTop: "0.75rem",
                      }}
                    >
                      {plan.name}
                    </p>
                    <div
                      className="fs-syne"
                      style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "0.25rem" }}
                    >
                      <PriceDisplay price={plan.price} />
                    </div>
                    <p style={{ color: "#64748B", fontSize: "0.875rem", marginBottom: "1.5rem", lineHeight: 1.6 }}>
                      {plan.desc}
                    </p>
                    <div style={{ marginBottom: "1.5rem" }}>
                      <MovingBorderButton
                        as="a"
                        href="#"
                        onClick={(e: React.MouseEvent) => e.preventDefault()}
                        borderRadius="0.75rem"
                        duration={2200}
                        containerClassName="block h-11 w-full cursor-pointer"
                        borderClassName="bg-[radial-gradient(#F97316_40%,transparent_60%)] opacity-90"
                        className="bg-[#0A1428] border-[rgba(249,115,22,0.28)] text-white font-semibold text-sm tracking-wide"
                        theme="dark"
                      >
                        {plan.cta}
                      </MovingBorderButton>
                    </div>
                    <FeatureList features={plan.features} />
                  </div>
                </BorderBeam>
              ) : (
                <div
                  style={{
                    background: "#0D1634",
                    border: "1px solid rgba(34,211,238,0.12)",
                    borderRadius: "1rem",
                    padding: "1.75rem",
                  }}
                >
                  <p
                    style={{
                      color: "#94A3B8",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {plan.name}
                  </p>
                  <div
                    className="fs-syne"
                    style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "0.25rem" }}
                  >
                    <PriceDisplay price={plan.price} />
                  </div>
                  <p style={{ color: "#64748B", fontSize: "0.875rem", marginBottom: "1.5rem", lineHeight: 1.6 }}>
                    {plan.desc}
                  </p>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <MovingBorderButton
                      as="a"
                      href="#"
                      onClick={(e: React.MouseEvent) => e.preventDefault()}
                      borderRadius="0.75rem"
                      duration={2800}
                      containerClassName="block h-11 w-full cursor-pointer"
                      borderClassName="bg-[radial-gradient(#22D3EE_40%,transparent_60%)] opacity-60"
                      className="bg-[#090F26] border-[rgba(34,211,238,0.18)] text-white font-semibold text-sm tracking-wide"
                      theme="dark"
                    >
                      {plan.cta}
                    </MovingBorderButton>
                  </div>
                  <FeatureList features={plan.features} />
                </div>
              )}
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
