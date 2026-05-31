// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "notification-stack": ({ theme = "dark" }) => (
    <NotificationDemo theme={theme} />
  )} as const;
