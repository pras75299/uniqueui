// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "chromatic-aberration-reveal": ({ theme = "dark" }) => (
    <div
      className={cn(
        "relative h-[460px] w-full overflow-hidden rounded-xl border",
        theme === "dark"
          ? "border-neutral-800 bg-black"
          : "border-neutral-200 bg-black",
      )}
    >
      <ChromaticAberrationReveal
        className="h-full w-full rounded-none"
        src="https://images.unsplash.com/photo-1500964757637-c85e8a162699?auto=format&fit=crop&w=1600&q=80"
        alt="Mountain lake at dusk"
        splitDistance={16}
        staggerMs={90}
        trigger="mount"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-6">
        <p className="text-xs font-mono uppercase tracking-[0.3em] text-white/75">
          Chromatic converge reveal
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-white">
          RGB split, then perfect convergence.
        </h3>
      </div>
    </div>
  )} as const;
