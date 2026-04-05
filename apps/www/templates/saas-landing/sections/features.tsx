import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import IsoIcon from "../components/iso-icon";

export default function Features() {
  return (
    <section style={{ padding: "6rem 1.5rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <ScrollReveal animation="fade-up">
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div className="section-divider" style={{ margin: "0 auto 1rem" }} />
            <span className="feat-tag" style={{ marginBottom: "0.75rem", display: "inline-block" }}>
              Features
            </span>
            <h2
              className="fs-syne"
              style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 700, marginBottom: "0.75rem" }}
            >
              Everything your team needs
            </h2>
            <p style={{ color: "#94A3B8", maxWidth: 520, margin: "0 auto" }}>
              From simple trigger-action rules to complex multi-step pipelines — FlowSync handles it all without a
              single line of code.
            </p>
          </div>
        </ScrollReveal>

        <BentoGrid className="lg:grid-cols-3 auto-rows-[240px]" theme="dark">
          <BentoCard
            icon={<IsoIcon color="cyan" />}
            title="Visual Pipeline Builder"
            description="Drag-and-drop nodes connect your apps in minutes. 200+ integrations available out of the box with no-code and pro-code modes."
            cta="Explore builder"
            className="lg:col-span-2"
            spinBorder
            spinBorderColors={["#22D3EE", "#0E7490"]}
            theme="dark"
          />
          <BentoCard
            icon={<IsoIcon color="indigo" />}
            title="AI Suggestions"
            description="Our AI analyzes workflow patterns and proactively suggests optimizations and automation opportunities."
            cta="See AI features"
            spinBorder
            spinBorderColors={["#818CF8", "#4338CA"]}
            theme="dark"
          />
          <BentoCard
            icon={<IsoIcon color="emerald" />}
            title="Real-time Monitoring"
            description="Watch your pipelines run live. Instant alerts, detailed logs, and one-click debugging for every step."
            cta="View monitoring"
            spinBorder
            spinBorderColors={["#34D399", "#059669"]}
            theme="dark"
          />
          <BentoCard
            icon={
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5"
                fill="none"
                stroke="#22D3EE"
                strokeWidth="1.5"
                aria-hidden
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            }
            title="Enterprise Security"
            description="SOC 2 Type II certified. SSO, SAML, audit logs, and role-based access out of the box."
            cta="Security docs"
            className="lg:col-span-2"
            spinBorder
            spinBorderColors={["#F97316", "#EA580C"]}
            theme="dark"
          />
        </BentoGrid>
      </div>
    </section>
  );
}
