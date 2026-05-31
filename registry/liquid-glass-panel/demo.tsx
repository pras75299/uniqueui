// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "liquid-glass-panel": ({ theme = "dark" }) => (
    <div
      className={cn(
        "relative flex min-h-[440px] w-full items-center justify-center overflow-hidden rounded-xl border bg-cover bg-center px-6 py-10",
        theme === "dark" ? "border-neutral-800" : "border-neutral-200",
      )}
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1500964757637-c85e8a162699?auto=format&fit=crop&w=1600&q=80)",
      }}
    >
      <div className="grid w-full max-w-3xl gap-5 md:grid-cols-2">
        <LiquidGlassPanel className="p-7">
          <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-white/70">
            Solar Winter · 2026
          </span>
          <h3 className="mt-3 text-2xl font-semibold text-white">
            Real glass, not a blur.
          </h3>
          <p className="mt-2 text-sm text-white/80">
            Pixels behind this panel are physically refracted via SVG turbulence
            — text on top stays pixel-crisp.
          </p>
        </LiquidGlassPanel>
        <LiquidGlassPanel
          className="p-7"
          tint="rgba(120,90,255,0.18)"
          displacementScale={32}
          noiseFrequency={0.018}
        >
          <h3 className="text-lg font-semibold text-white">Tinted variant</h3>
          <p className="mt-2 text-sm text-white/80">
            Stronger displacement and a violet tint — useful for modal surfaces
            or CTA flourishes.
          </p>
          <button className="mt-4 rounded-full bg-white/15 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-md transition hover:bg-white/25">
            Action
          </button>
        </LiquidGlassPanel>
      </div>
    </div>
  )} as const;
