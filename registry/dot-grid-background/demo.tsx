// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "dot-grid-background": ({ theme = "dark" }) => (
    <DotGridBackground
      theme={theme}
      className="w-full h-[340px] flex items-center justify-center rounded-xl"
    >
      <div className="text-center relative z-10 select-none px-6">
        <p
          className={cn(
            "text-xs font-mono tracking-[0.25em] uppercase mb-4",
            theme === "dark" ? "text-neutral-500" : "text-neutral-400",
          )}
        >
          Move your cursor
        </p>
        <h3
          className={cn(
            "text-4xl font-bold tracking-tight",
            theme === "dark" ? "text-white" : "text-neutral-900",
          )}
        >
          Ripple Field
        </h3>
        <p
          className={cn(
            "mt-3 text-sm",
            theme === "dark" ? "text-neutral-500" : "text-neutral-400",
          )}
        >
          Each movement fires a shockwave through the grid
        </p>
      </div>
    </DotGridBackground>
  )} as const;
