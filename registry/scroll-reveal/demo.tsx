// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "scroll-reveal": ({ theme = "dark" }) => (
    <div
      className={cn(
        "p-10",
        theme === "dark" ? "text-white" : "text-neutral-900",
      )}
    >
      <ScrollRevealGroup
        theme={theme}
        animation="fade-up"
        staggerDelay={0.15}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {["fade-up", "scale", "blur"].map((preset) => (
          <div
            key={preset}
            className={cn(
              "p-6 rounded-lg text-center",
              theme === "dark"
                ? "bg-neutral-900/50 border border-neutral-800"
                : "bg-neutral-100 border border-neutral-200",
            )}
          >
            <div
              className={cn(
                "text-lg font-semibold mb-1",
                theme === "dark" ? "text-neutral-200" : "text-neutral-800",
              )}
            >
              {preset}
            </div>
            <p
              className={cn(
                "text-xs",
                theme === "dark" ? "text-neutral-500" : "text-neutral-600",
              )}
            >
              Scroll to reveal
            </p>
          </div>
        ))}
      </ScrollRevealGroup>
    </div>
  )} as const;
