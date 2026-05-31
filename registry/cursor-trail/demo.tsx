// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "cursor-trail": ({ theme = "dark" }) => (
    <div
      className={cn(
        "h-[400px] w-full flex items-center justify-center p-12 rounded-xl overflow-hidden shadow-inner border",
        theme === "dark"
          ? "bg-neutral-950 border-neutral-800"
          : "bg-neutral-100 border-neutral-200",
      )}
    >
      <div className="text-center relative z-10 pointer-events-none">
        <h3
          className={cn(
            "text-3xl font-bold bg-clip-text text-transparent mb-4",
            theme === "dark"
              ? "bg-gradient-to-br from-white to-neutral-500"
              : "bg-gradient-to-br from-neutral-900 to-neutral-600",
          )}
        >
          Interactive Cursor Trail
        </h3>
        <p
          className={theme === "dark" ? "text-neutral-400" : "text-neutral-600"}
        >
          Move your mouse inside this block to see the effect.
        </p>
      </div>
      <CursorTrail
        theme={theme}
        color="#a855f7"
        trailLength={30}
        size={15}
        decayDuration={0.8}
      />
    </div>
  )} as const;
