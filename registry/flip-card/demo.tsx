// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "flip-card": ({ theme = "dark" }) => (
    <div className="flex flex-wrap gap-8 items-center justify-center p-10">
      <FlipCard
        theme={theme}
        className="w-60 h-40"
        front={
          <div
            className={cn(
              "flex items-center justify-center h-full rounded-xl border",
              theme === "dark"
                ? "bg-zinc-900 border-zinc-800"
                : "bg-zinc-100 border-zinc-300",
            )}
          >
            <p
              className={cn(
                "text-lg font-bold",
                theme === "dark" ? "text-white" : "text-neutral-900",
              )}
            >
              Hover to flip →
            </p>
          </div>
        }
        back={
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl">
            <p className="text-lg font-bold text-purple-200">Back side! ✨</p>
          </div>
        }
      />
      <FlipCard
        theme={theme}
        className="w-60 h-40"
        trigger="click"
        front={
          <div
            className={cn(
              "flex items-center justify-center h-full rounded-xl border",
              theme === "dark"
                ? "bg-zinc-900 border-zinc-800"
                : "bg-zinc-100 border-zinc-300",
            )}
          >
            <p
              className={cn(
                "text-lg font-bold",
                theme === "dark" ? "text-white" : "text-neutral-900",
              )}
            >
              Click to flip
            </p>
          </div>
        }
        back={
          <div
            className={cn(
              "flex items-center justify-center h-full rounded-xl border",
              theme === "dark"
                ? "bg-zinc-800 border-zinc-700"
                : "bg-zinc-200 border-zinc-400",
            )}
          >
            <p
              className={cn(
                "text-lg font-bold",
                theme === "dark" ? "text-green-400" : "text-green-700",
              )}
            >
              Click again!
            </p>
          </div>
        }
      />
    </div>
  )} as const;
