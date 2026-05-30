// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {

  "shooting-stars-grid": ({ theme = "dark" }) => (
    <div
      className={cn(
        "rounded-xl overflow-hidden border h-[400px] w-full relative",
        theme === "dark" ? "border-neutral-800" : "border-neutral-200",
      )}
    >
      <ShootingStarsGrid starCount={18} speed={2.5} gridSize={80}>
        <div className="flex h-full items-center justify-center text-center px-4 pointer-events-none">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/40 font-mono">
              meteor shower
            </p>
            <h3 className="text-3xl font-bold text-white tracking-tight drop-shadow-[0_0_24px_rgba(80,255,180,0.45)]">
              Shooting Stars
            </h3>
            <p className="text-white/40 text-sm max-w-[240px] mx-auto">
              Grid-snapped streaks, emerald vignette.
            </p>
          </div>
        </div>
      </ShootingStarsGrid>
    </div>
  )} as const;
