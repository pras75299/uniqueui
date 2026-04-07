"use client";

import { Button as MovingBorderButton } from "@/components/ui/moving-border";

export default function Nav() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        borderBottom: "1px solid rgba(34,211,238,0.1)",
        backdropFilter: "blur(16px)",
        background: "rgba(6,10,31,0.85)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 1.5rem",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <svg width="28" height="24" viewBox="0 0 28 24" aria-hidden>
            <polygon points="14,0 27,7 14,14 1,7" fill="#22D3EE" />
            <polygon points="27,7 14,14 14,24 27,17" fill="#0E7490" />
            <polygon points="1,7 14,14 14,24 1,17" fill="#155E75" />
          </svg>
          <span className="fs-syne" style={{ fontSize: "1.15rem", fontWeight: 700, color: "#F0F9FF" }}>
            FlowSync
          </span>
        </div>

        {/* Nav links */}
        <nav style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          {["Product", "Pricing", "Docs", "Blog"].map((n) => (
            <a key={n} className="nav-link" href="#" onClick={(e) => e.preventDefault()}>
              {n}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <a className="nav-link" href="#" onClick={(e) => e.preventDefault()}>
            Sign in
          </a>
          <MovingBorderButton
            as="a"
            href="#"
            onClick={(e: React.MouseEvent) => e.preventDefault()}
            borderRadius="0.75rem"
            duration={2800}
            containerClassName="h-9 w-36 cursor-pointer"
            borderClassName="bg-[radial-gradient(#F97316_40%,transparent_60%)] opacity-90"
            className="bg-[#090F26] border-[rgba(249,115,22,0.22)] text-white font-semibold text-xs tracking-wide"
            theme="dark"
          >
            Start free trial
          </MovingBorderButton>
        </div>
      </div>
    </header>
  );
}
