// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "shader-mesh-gradient": ({ theme = "dark" }) => (
    <div
      className={cn(
        "relative h-[460px] w-full overflow-hidden rounded-xl border",
        theme === "dark" ? "border-neutral-800" : "border-neutral-200",
      )}
    >
      <ShaderMeshGradient
        className="h-full w-full"
        colors={[
          "oklch(0.78 0.16 30)",
          "oklch(0.72 0.17 295)",
          "oklch(0.70 0.16 220)",
          "oklch(0.82 0.14 150)",
        ]}
        speed={1.1}
        pointerInfluence={0.6}
        grain={0.04}
      >
        <div className="flex h-full w-full items-center justify-center px-6 text-center">
          <div className="max-w-md">
            <span className="text-[11px] font-mono uppercase tracking-[0.32em] text-white/85 [text-shadow:0_1px_8px_rgba(0,0,0,0.45)]">
              Fragment shader · WebGL2
            </span>
            <h3 className="mt-3 text-3xl font-semibold text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.5)]">
              GPU mesh gradient.
            </h3>
            <p className="mt-2 text-sm text-white/90 [text-shadow:0_1px_10px_rgba(0,0,0,0.45)]">
              Move your cursor — the nearest blob leans in.
            </p>
          </div>
        </div>
      </ShaderMeshGradient>
    </div>
  )} as const;
