import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { CountUp } from "@/components/ui/count-up";

const STATS = [
  { to: 2400, suffix: "+",  decimals: 0, label: "Teams using FlowSync" },
  { to: 99.9, suffix: "%",  decimals: 1, label: "Uptime SLA guaranteed" },
  { to: 18,   suffix: "M+", decimals: 0, label: "Workflows run per month" },
  { to: 4.9,  suffix: "/5", decimals: 1, label: "Average G2 rating" },
];

export default function Stats() {
  return (
    <section
      style={{
        padding: "4rem 1.5rem",
        background: "linear-gradient(180deg, rgba(34,211,238,0.04) 0%, transparent 100%)",
        borderTop: "1px solid rgba(34,211,238,0.08)",
        borderBottom: "1px solid rgba(34,211,238,0.08)",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          className="stats-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "2rem", textAlign: "center" }}
        >
          {STATS.map((s, i) => (
            <ScrollReveal key={s.label} animation="fade-up" delay={i * 0.1}>
              <div>
                <div
                  className="fs-syne"
                  style={{ fontSize: "2.8rem", fontWeight: 800, color: "#22D3EE", lineHeight: 1 }}
                >
                  <CountUp to={s.to} suffix={s.suffix} decimals={s.decimals} duration={2} theme="dark" />
                </div>
                <p style={{ color: "#64748B", fontSize: "0.85rem", marginTop: "0.5rem" }}>{s.label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
