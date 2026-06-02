// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.
// `theme` is supplied by ComponentPreview and follows the site theme toggle.

export const demoEntries = {
  "hero-flow-field": ({ theme = "dark" }) => (
    <FlowFieldHero theme={theme as "light" | "dark"} />
  )} as const;
