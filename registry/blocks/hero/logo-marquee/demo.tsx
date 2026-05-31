// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "hero-logo-marquee": () => (
    <LogoMarqueeHero
      logos={[...LOGO_MARQUEE_DEMO_LOGOS]}
      secondaryLogos={[...LOGO_MARQUEE_DEMO_SECONDARY_LOGOS]}
      speed={32}
    >
      <LogoMarqueeDemoHeadline />
    </LogoMarqueeHero>
  )} as const;
