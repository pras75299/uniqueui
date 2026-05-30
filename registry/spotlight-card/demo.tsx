// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "spotlight-card": ({ theme = "dark" }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-10">
      <SpotlightCard theme={theme}>
        <h3
          className={cn(
            "text-xl font-bold mb-2",
            theme === "dark" ? "text-white" : "text-neutral-900",
          )}
        >
          Hover for spotlight
        </h3>
        <p
          className={cn(
            "text-sm",
            theme === "dark" ? "text-neutral-400" : "text-neutral-600",
          )}
        >
          Move your mouse over the card to reveal a tracking spotlight effect.
        </p>
      </SpotlightCard>
      <SpotlightCard
        theme={theme}
        spotlightColor="rgba(232, 121, 249, 0.1)"
        spotlightSize={300}
      >
        <h3
          className={cn(
            "text-xl font-bold mb-2",
            theme === "dark" ? "text-white" : "text-neutral-900",
          )}
        >
          Custom spotlight
        </h3>
        <p
          className={cn(
            "text-sm",
            theme === "dark" ? "text-neutral-400" : "text-neutral-600",
          )}
        >
          Different color and size for the spotlight effect.
        </p>
      </SpotlightCard>
    </div>
  )} as const;
