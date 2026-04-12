/* ─────────────────────────────────────────────────────────────────────────────
   FLOWSYNC – SaaS Landing Page Template
   ─────────────────────────────────────────────────────────────────────────────
   Sections
   ├── sections/nav.tsx           Sticky nav with MovingBorderButton CTA
   ├── sections/hero.tsx          Isometric hero + ShinyText headline
   ├── sections/trusted-by.tsx   InfiniteMarquee logo strip
   ├── sections/features.tsx     BentoGrid feature cards with spinBorder
   ├── sections/stats.tsx        CountUp stats row
   ├── sections/pricing.tsx      Toggle pricing table with BorderBeam Pro card
   ├── sections/testimonials.tsx  3-column testimonial grid
   ├── sections/cta.tsx           Final CTA banner
   └── sections/footer.tsx        Footer with link columns

   Shared components
   ├── components/iso-hero.tsx    Animated isometric SVG illustration
   └── components/iso-icon.tsx    Isometric cube icon for BentoCards

   Fonts:   Syne (display) · DM Sans (body) — resolved via CSS font variables in layout/globals
   Palette: Deep navy (#060A1F) · Electric cyan (#22D3EE) · Orange accent (#F97316)
   ───────────────────────────────────────────────────────────────────────────── */

import Nav          from "./sections/nav";
import Hero         from "./sections/hero";
import TrustedBy    from "./sections/trusted-by";
import Features     from "./sections/features";
import Stats        from "./sections/stats";
import Pricing      from "./sections/pricing";
import Testimonials from "./sections/testimonials";
import Cta          from "./sections/cta";
import Footer       from "./sections/footer";

export default function SaasLanding() {
  return (
    <div
      style={{
        fontFamily: "var(--font-dm-sans, 'DM Sans', system-ui, sans-serif)",
        backgroundColor: "#060A1F",
        color: "#F0F9FF",
        lineHeight: 1.6,
      }}
    >
      <Nav />
      <Hero />
      <TrustedBy />
      <Features />
      <Stats />
      <Pricing />
      <Testimonials />
      <Cta />
      <Footer />
    </div>
  );
}
