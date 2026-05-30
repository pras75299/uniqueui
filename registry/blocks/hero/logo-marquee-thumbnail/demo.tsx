// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  // `/blocks` index thumbnail — headline only (dual marquee rows skew the crop).
  "hero-logo-marquee-thumbnail": () => (
    <LogoMarqueeHero
      logos={LOGO_MARQUEE_DEMO_LOGOS.slice(0, 8)}
      secondaryLogos={null}
      speed={28}
      className="min-h-[100svh] [&_[data-slot=marquee]]:hidden"
    >
      <LogoMarqueeDemoHeadline />
    </LogoMarqueeHero>
  )} as const;
