// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "magnetic-text": ({ theme = "dark" }) => (
    <div
      className={cn(
        "flex min-h-[40vh] flex-col items-center justify-center gap-8 px-8 py-12 text-center",
        theme === "dark" ? "bg-[#0a0a0a]" : "bg-neutral-50",
      )}
    >
      <MagneticText
        as="h2"
        text="Motion, where it matters."
        animateEntry
        disableGlow={theme === "light"}
        className={cn(
          "text-4xl font-semibold tracking-tight sm:text-6xl",
          theme === "dark" ? "text-white" : "text-neutral-900",
        )}
      />
      <MagneticText
        text="Hover the headline above."
        radius={120}
        strength={10}
        disableGlow={theme === "light"}
        className={cn(
          "font-mono text-xs uppercase tracking-[0.18em]",
          theme === "dark" ? "text-white/55" : "text-neutral-500",
        )}
      />
    </div>
  )} as const;
