// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "gradient-text-reveal": ({ theme = "dark" }) => (
    <div
      className={cn(
        "space-y-8 text-center p-10",
        theme === "dark" ? "text-white" : "text-neutral-900",
      )}
    >
      <GradientTextReveal
        text="Build stunning interfaces with UniqueUI"
        as="h3"
        className={cn(
          "text-3xl font-bold justify-center",
          theme === "dark" ? "text-white" : "text-neutral-900",
        )}
      />
      <GradientTextReveal
        text="Beautiful animated components for modern web apps"
        gradientFrom="#6366f1"
        gradientTo="#06b6d4"
        className={cn(
          "text-lg justify-center",
          theme === "dark" ? "text-neutral-300" : "text-neutral-600",
        )}
      />
    </div>
  )} as const;
