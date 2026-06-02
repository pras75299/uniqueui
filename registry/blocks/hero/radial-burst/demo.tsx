// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.
// `theme` is supplied by ComponentPreview and follows the site theme toggle;
// it seeds the initial time-of-day theme (the in-block switcher takes over).

export const demoEntries = {
  "hero-radial-burst": ({ theme = "dark" }) => (
    <RadialBurstHero defaultTheme={theme === "light" ? "daytime" : "night"} />
  )} as const;
