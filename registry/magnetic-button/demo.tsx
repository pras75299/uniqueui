// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "magnetic-button": ({ theme = "dark" }) => (
    <div className="flex flex-wrap gap-8 items-center justify-center p-20">
      <MagneticButton theme={theme}>Hover near me</MagneticButton>
      <MagneticButton
        theme={theme}
        magneticStrength={0.5}
        magneticRadius={200}
        className="bg-gradient-to-b from-purple-700 to-purple-900"
      >
        Stronger pull
      </MagneticButton>
    </div>
  )} as const;
