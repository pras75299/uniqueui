// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "glow-hero-section/default": ({ theme = "dark" }) => (
    <GlowHeroSection theme={theme} height="h-[520px]" />
  ),
  "glow-hero-section/dark": ({ theme = "dark" }) => (
    <GlowHeroSection
      theme={theme}
      height="h-[520px]"
      backgroundColor="#0a0a0f"
      meshColorStart="rgba(139, 92, 246, 0.5)"
      meshColorEnd="rgba(6, 182, 212, 0.5)"
      badge="Next-Gen · Web · Components"
      heading="UniqueUI"
      description="Premium animated React components, copy-paste ready."
      gridSize={40}
      mouseRadius={200}
    />
  ),
  "glow-hero-section/no-badge": ({ theme = "dark" }) => (
    <GlowHeroSection
      theme={theme}
      height="h-[520px]"
      badge={null}
      heading="Build Interfaces That Stand Out"
      description="Drop-in animated components powered by Motion.dev and Tailwind CSS."
    />
  )} as const;
