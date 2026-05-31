// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "3d-tilt-card": ({ theme = "dark" }) => (
    <div className="flex flex-wrap gap-8 items-center justify-center p-10">
      <TiltCard
        theme={theme}
        className={cn(
          "w-72 rounded-xl p-6",
          theme === "dark"
            ? "bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700"
            : "bg-gradient-to-br from-neutral-100 to-neutral-200 border border-neutral-300",
        )}
      >
        <h3
          className={cn(
            "text-xl font-bold mb-2",
            theme === "dark" ? "text-white" : "text-neutral-900",
          )}
        >
          Hover me
        </h3>
        <p
          className={cn(
            "text-sm",
            theme === "dark" ? "text-neutral-400" : "text-neutral-600",
          )}
        >
          Move your cursor over this card to see the 3D tilt effect with glare.
        </p>
        <div
          className={cn(
            "mt-4 h-24 rounded-lg",
            theme === "dark"
              ? "bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-neutral-700/50"
              : "bg-gradient-to-br from-purple-200/40 to-pink-200/40 border border-neutral-300",
          )}
        />
      </TiltCard>
      <TiltCard
        theme={theme}
        tiltMaxDeg={25}
        glare={true}
        className={cn(
          "w-72 rounded-xl p-6",
          theme === "dark"
            ? "bg-gradient-to-br from-purple-950 to-indigo-950 border border-purple-800/50"
            : "bg-gradient-to-br from-purple-100 to-indigo-100 border border-purple-300/50",
        )}
      >
        <h3
          className={cn(
            "text-xl font-bold mb-2",
            theme === "dark" ? "text-purple-200" : "text-purple-800",
          )}
        >
          Extra Tilt
        </h3>
        <p
          className={cn(
            "text-sm",
            theme === "dark" ? "text-purple-300/60" : "text-purple-700/80",
          )}
        >
          This card has a stronger tilt angle for a more dramatic effect.
        </p>
        <div className="mt-4 flex gap-2">
          <div className="h-12 w-12 rounded-lg bg-purple-500/20 border border-purple-500/30" />
          <div className="h-12 w-12 rounded-lg bg-pink-500/20 border border-pink-500/30" />
          <div className="h-12 w-12 rounded-lg bg-indigo-500/20 border border-indigo-500/30" />
        </div>
      </TiltCard>
    </div>
  )} as const;
