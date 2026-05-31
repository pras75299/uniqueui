// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {

  "border-beam": ({ theme = "dark" }) => (
    <div className="flex flex-wrap items-center justify-center gap-6 p-10">
      <BorderBeam
        colorFrom="#a855f7"
        colorTo="#ec4899"
        duration={5}
        size={180}
        theme={theme}
        className="w-64"
      >
        <div
          className={cn(
            "p-6 rounded-[10px]",
            theme === "dark" ? "bg-neutral-950" : "bg-white",
          )}
        >
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-3">
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <h3
            className={cn(
              "text-sm font-semibold mb-1",
              theme === "dark" ? "text-white" : "text-neutral-900",
            )}
          >
            Animated border
          </h3>
          <p
            className={cn(
              "text-xs",
              theme === "dark" ? "text-neutral-500" : "text-neutral-500",
            )}
          >
            A comet orbits continuously.
          </p>
        </div>
      </BorderBeam>

      <BorderBeam
        colorFrom="#06b6d4"
        colorTo="#3b82f6"
        duration={7}
        size={150}
        theme={theme}
        className="w-64"
      >
        <div
          className={cn(
            "p-6 rounded-[10px]",
            theme === "dark" ? "bg-neutral-950" : "bg-white",
          )}
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mb-3">
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <h3
            className={cn(
              "text-sm font-semibold mb-1",
              theme === "dark" ? "text-white" : "text-neutral-900",
            )}
          >
            Custom colours
          </h3>
          <p
            className={cn(
              "text-xs",
              theme === "dark" ? "text-neutral-500" : "text-neutral-500",
            )}
          >
            Any gradient, any speed.
          </p>
        </div>
      </BorderBeam>
    </div>
  )} as const;
