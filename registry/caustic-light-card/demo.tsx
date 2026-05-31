// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "caustic-light-card": ({ theme = "dark" }) => (
    <div
      className={cn(
        "relative h-[460px] w-full overflow-hidden rounded-xl border",
        theme === "dark"
          ? "border-neutral-800 bg-[#050a14]"
          : "border-neutral-200 bg-[#eff4ff]",
      )}
    >
      <CausticLightCard
        className={cn(
          "h-full w-full rounded-none border-0",
          theme === "dark"
            ? "from-[#091327] via-[#0d1d36] to-[#071124]"
            : "from-[#dbe8ff] via-[#f5f8ff] to-[#d6e5ff]",
        )}
        causticColor={theme === "dark" ? "#fff7e0" : "#fff2cf"}
        intensity={0.64}
        speed={0.56}
        coverage={0.56}
      >
        <div className="flex h-full w-full items-center justify-center px-10 py-12 text-center">
          <div className="max-w-lg">
            <span
              className={cn(
                "text-[11px] font-mono uppercase tracking-[0.32em]",
                theme === "dark" ? "text-[#c2d4ff]/85" : "text-[#2f4b76]/70",
              )}
            >
              Caustics · shader canvas overlay
            </span>
            <h2
              className={cn(
                "mt-3 text-4xl font-semibold tracking-tight",
                theme === "dark" ? "text-white" : "text-[#102849]",
              )}
            >
              Pool-light shimmer on glass cards.
            </h2>
            <p
              className={cn(
                "mt-4 text-base leading-relaxed",
                theme === "dark" ? "text-[#d6e4ff]/90" : "text-[#35577f]/85",
              )}
            >
              Hover the card: caustics brighten and flow faster while text stays
              cleanly readable.
            </p>
          </div>
        </div>
      </CausticLightCard>
    </div>
  )} as const;
