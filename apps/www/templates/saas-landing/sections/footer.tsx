"use client";

const FOOTER_COLS = [
  { heading: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
  { heading: "Company", links: ["About", "Blog", "Careers", "Press"] },
  { heading: "Legal",   links: ["Privacy", "Terms", "Security", "Cookies"] },
];

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "3rem 1.5rem 2rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "2rem",
            marginBottom: "2.5rem",
          }}
        >
          {/* Brand blurb */}
          <div style={{ maxWidth: 260 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <svg width="22" height="19" viewBox="0 0 28 24" aria-hidden>
                <polygon points="14,0 27,7 14,14 1,7" fill="#22D3EE" />
                <polygon points="27,7 14,14 14,24 27,17" fill="#0E7490" />
                <polygon points="1,7 14,14 14,24 1,17" fill="#155E75" />
              </svg>
              <span className="fs-syne" style={{ fontWeight: 700, fontSize: "1rem" }}>
                FlowSync
              </span>
            </div>
            <p style={{ color: "#475569", fontSize: "0.82rem", lineHeight: 1.7 }}>
              Workflow automation for modern engineering teams. Built with care in San Francisco.
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_COLS.map((col) => (
            <div key={col.heading}>
              <p
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#94A3B8",
                  marginBottom: "1rem",
                }}
              >
                {col.heading}
              </p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.6rem",
                }}
              >
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      className="nav-link"
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      style={{ fontSize: "0.85rem" }}
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: "1.5rem",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <p style={{ color: "#334155", fontSize: "0.8rem" }}>© 2025 FlowSync, Inc. All rights reserved.</p>
          <p style={{ color: "#1E293B", fontSize: "0.8rem" }}>
            Built with{" "}
            <a
              href="https://uniqueui.com"
              style={{ color: "#22D3EE", textDecoration: "none" }}
              onClick={(e) => e.preventDefault()}
            >
              UniqueUI
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
