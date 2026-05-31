// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "multi-step-auth-card": ({ theme = "dark" }) => (
    <div
      className={cn(
        "flex items-center justify-center p-10 min-h-[420px] w-full rounded-xl border",
        theme === "dark"
          ? "bg-neutral-950 border-neutral-800"
          : "bg-neutral-100 border-neutral-200",
      )}
    >
      <MultiStepAuthCard />
    </div>
  )} as const;
