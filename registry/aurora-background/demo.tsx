// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "aurora-background/cinematic": ({ theme = "dark" }) => (
    <div
      className={cn(
        "rounded-xl overflow-hidden border h-[400px] w-full relative",
        theme === "dark" ? "border-neutral-800" : "border-neutral-200",
      )}
    >
      <AuroraBackground
        preset="cinematic"
        theme={theme}
        className="min-h-0 h-full rounded-xl"
      >
        <div className="text-center z-10 px-4">
          <h3
            className={cn(
              "text-2xl font-bold mb-2 tracking-tight",
              theme === "dark" ? "text-white" : "text-neutral-900",
            )}
          >
            Background lights
          </h3>
          <p
            className={
              theme === "dark"
                ? "text-neutral-400 text-sm"
                : "text-neutral-600 text-sm"
            }
          >
            Vertical pillars drift right → left; soft overlap
          </p>
        </div>
      </AuroraBackground>
    </div>
  ),
  "aurora-background/stitch": ({ theme = "dark" }) => (
    <div
      className={cn(
        "rounded-xl overflow-hidden border h-[400px] w-full relative",
        theme === "dark" ? "border-neutral-800" : "border-neutral-200",
      )}
    >
      <AuroraBackground
        preset="stitch"
        theme={theme}
        blur={1.05}
        className="min-h-0 h-full rounded-xl"
      >
        <div className="text-center z-10 px-4">
          <h3
            className={cn(
              "text-2xl font-bold mb-2 tracking-tight",
              theme === "dark" ? "text-white" : "text-neutral-900",
            )}
          >
            Stitch DS
          </h3>
          <p
            className={
              theme === "dark"
                ? "text-neutral-400 text-sm"
                : "text-neutral-600 text-sm"
            }
          >
            Showcase tokens — same motion language
          </p>
        </div>
      </AuroraBackground>
    </div>
  )} as const;
