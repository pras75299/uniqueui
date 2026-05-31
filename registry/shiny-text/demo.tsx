// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {

  // ─── Phase 4 — Hero & Text Effects ───────────────────────────────────────

  "shiny-text": ({ theme = "dark" }) => (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-8 p-10 text-center",
        theme === "dark" ? "text-white" : "text-neutral-900",
      )}
    >
      <ShinyText
        text="The future of UI is here."
        speed={3}
        shimmerWidth={40}
        theme={theme}
        className="text-4xl font-black tracking-tight"
      />
      <ShinyText
        text="Ship faster. Look better."
        speed={4}
        shimmerWidth={50}
        theme={theme}
        className="text-2xl font-semibold"
      />
      <ShinyText
        text="Designed for builders who care."
        speed={5}
        shimmerWidth={35}
        theme={theme}
        className="text-lg font-medium"
      />
    </div>
  )} as const;
