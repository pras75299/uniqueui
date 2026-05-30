// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "meteors-card": ({ theme = "dark" }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-10">
      <MeteorsCard theme={theme}>
        <h3
          className={cn(
            "text-xl font-bold mb-2",
            theme === "dark" ? "text-white" : "text-neutral-900",
          )}
        >
          Meteors Effect
        </h3>
        <p
          className={cn(
            "text-sm",
            theme === "dark" ? "text-neutral-400" : "text-neutral-600",
          )}
        >
          Watch the shooting stars fall through this card&apos;s background.
        </p>
      </MeteorsCard>
      <MeteorsCard theme={theme} meteorColor="#a855f7" meteorCount={30}>
        <h3
          className={cn(
            "text-xl font-bold mb-2",
            theme === "dark" ? "text-purple-200" : "text-purple-800",
          )}
        >
          Purple Meteors
        </h3>
        <p
          className={cn(
            "text-sm",
            theme === "dark" ? "text-purple-300/60" : "text-purple-700/80",
          )}
        >
          Custom colored meteors with extra density.
        </p>
      </MeteorsCard>
    </div>
  )} as const;
