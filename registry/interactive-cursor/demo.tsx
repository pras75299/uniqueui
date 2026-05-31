// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "interactive-cursor": ({ theme = "dark" }) => (
    <InteractiveCursorDemo theme={theme} />
  )} as const;
