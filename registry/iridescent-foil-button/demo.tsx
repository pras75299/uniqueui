// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "iridescent-foil-button": ({ theme = "dark" }) => (
    <div className="relative flex h-[300px] w-full items-center justify-center">
      <IridescentFoilButton
        variant={theme === "dark" ? "vivid" : "default"}
        className="min-w-[240px] px-8 py-3 text-base"
      >
        Start Free Trial
      </IridescentFoilButton>
    </div>
  )} as const;
