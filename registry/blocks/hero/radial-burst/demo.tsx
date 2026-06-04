// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.
// Renders the same composition shown in this block's `docs.usageCode`
// (registry/components/hero-radial-burst.json) so Preview and Usage match.
// `theme` is supplied by ComponentPreview and follows the site theme toggle;
// it seeds the initial time-of-day theme (the in-block switcher takes over).

export const demoEntries = {
  "hero-radial-burst": ({ theme = "dark" }) => (
    <RadialBurstHero
      defaultTheme={theme === "light" ? "daytime" : "night"}
      title={
        <>
          The backbone
          <br />
          of global commerce
        </>
      }
    />
  )} as const;
