"use client";

import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Button as MovingBorderButton } from "@/components/ui/moving-border";

export default function Cta() {
  return (
    <section style={{ padding: "6rem 1.5rem" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <ScrollReveal animation="scale">
          <div
            style={{
              background: "linear-gradient(135deg, #0D1E45 0%, #0A1530 100%)",
              border: "1px solid rgba(34,211,238,0.2)",
              borderRadius: "1.5rem",
              padding: "4rem 3rem",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative isometric cubes */}
            <svg
              width="120"
              height="100"
              viewBox="0 0 120 100"
              style={{ position: "absolute", top: -20, right: -20, opacity: 0.18 }}
              aria-hidden
            >
              <polygon points="60,5 115,32 60,59 5,32" fill="#22D3EE" />
              <polygon points="115,32 60,59 60,95 115,68" fill="#0E7490" />
              <polygon points="5,32 60,59 60,95 5,68" fill="#155E75" />
            </svg>
            <svg
              width="80"
              height="66"
              viewBox="0 0 80 66"
              style={{ position: "absolute", bottom: -10, left: 20, opacity: 0.12 }}
              aria-hidden
            >
              <polygon points="40,3 77,22 40,41 3,22" fill="#818CF8" />
              <polygon points="77,22 40,41 40,63 77,44" fill="#4338CA" />
              <polygon points="3,22 40,41 40,63 3,44" fill="#312E81" />
            </svg>

            <span className="badge" style={{ marginBottom: "1.5rem", display: "inline-flex" }}>
              No credit card required
            </span>
            <h2
              className="fs-syne"
              style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 800, marginBottom: "1rem" }}
            >
              Start automating today.
              <br />
              <span className="grad-text">Your first workflow is free.</span>
            </h2>
            <p style={{ color: "#94A3B8", fontSize: "1rem", maxWidth: 440, margin: "0 auto 2rem" }}>
              Join thousands of teams who&apos;ve already eliminated manual work with FlowSync.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <MovingBorderButton
                as="a"
                href="#"
                onClick={(e: React.MouseEvent) => e.preventDefault()}
                borderRadius="0.75rem"
                duration={2200}
                containerClassName="h-11 w-[220px] cursor-pointer"
                borderClassName="bg-[radial-gradient(#F97316_40%,transparent_60%)] opacity-90"
                className="bg-[#090F26] border-[rgba(249,115,22,0.28)] text-white font-semibold text-sm tracking-wide"
                theme="dark"
              >
                Get started — it&apos;s free
              </MovingBorderButton>
              <a className="btn-outline" href="#" onClick={(e) => e.preventDefault()}>
                Talk to sales
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
