// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "scramble-text": ({ theme = "dark" }) => (
    <div className="space-y-6 text-center p-10">
      <ScrambleText
        theme={theme}
        text="UNIQUEUI COMPONENTS"
        className={cn(
          "text-3xl font-bold tracking-wider",
          theme === "dark" ? "text-white" : "text-neutral-900",
        )}
      />
      <ScrambleText
        theme={theme}
        text="Hover to scramble again"
        triggerOnView={false}
        className={cn(
          "text-lg cursor-pointer",
          theme === "dark" ? "text-neutral-400" : "text-neutral-600",
        )}
      />
    </div>
  )} as const;
