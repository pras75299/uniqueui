import { InfiniteMarquee, MarqueeItem } from "@/components/ui/infinite-marquee";

export default function TrustedBy() {
  return (
    <section
      style={{
        borderTop: "1px solid rgba(255,255,255,0.05)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        padding: "2rem 0",
        overflow: "hidden",
      }}
    >
      <p
        style={{
          textAlign: "center",
          color: "#475569",
          fontSize: "0.78rem",
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "1.25rem",
        }}
      >
        Trusted by teams at
      </p>
      <InfiniteMarquee speed={35} gap={16} theme="dark">
        {["Vercel", "Linear", "Notion", "Stripe", "Figma", "GitHub", "Supabase", "PlanetScale"].map(
          (name) => (
            <MarqueeItem
              key={name}
              className="bg-[#0D1634] border-[rgba(34,211,238,0.12)] text-[#64748B] font-semibold text-sm tracking-widest"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden className="mr-1.5">
                <rect width="14" height="14" rx="3" fill="rgba(34,211,238,0.2)" />
              </svg>
              {name}
            </MarqueeItem>
          )
        )}
      </InfiniteMarquee>
    </section>
  );
}
