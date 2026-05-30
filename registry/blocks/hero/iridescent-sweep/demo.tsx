// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "hero-iridescent-sweep": () => (
    <IridescentSweepHero
      className="bg-[#0e0a14] text-white"
      backgroundProps={{
        hue: 0,
        speed: 22,
        grain: 0.35,
        baseColor: "#0e0a14",
        palette: ["#ff9bd1", "#ffd66b", "#9bffd6", "#6bb5ff", "#c89bff", "#ff9bd1"],
      }}
    >
      <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/85 backdrop-blur">
        <span
          aria-hidden
          className="h-1.5 w-1.5 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, #ff9bd1, #ffd66b, #9bffd6, #6bb5ff, #c89bff, #ff9bd1)",
            boxShadow: "0 0 12px 2px rgba(255,255,255,0.4)",
          }}
        />
        Edition · MMXXVI
      </span>
      <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
        <span
          className="bg-clip-text text-transparent"
          style={{
            backgroundImage:
              "linear-gradient(120deg, #ffffff 0%, #f5e6ff 28%, #ffe9c2 50%, #c8f1ff 72%, #ffffff 100%)",
          }}
        >
          Pressed in light.
        </span>
      </h1>
      <p className="mt-5 max-w-xl text-pretty text-base text-white/75 sm:text-lg">
        Conic foil under a turbulence grain, with a sheen that sweeps across
        the type on a slow cadence. Editorial energy, zero plug-ins.
      </p>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          className="group inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-medium text-neutral-900 transition-transform duration-200 hover:-translate-y-px"
        >
          <span>Reserve a copy</span>
          <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
            →
          </span>
        </button>
        <button
          type="button"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-white/25 px-6 text-sm font-medium text-white/90 backdrop-blur transition-colors hover:bg-white/10"
        >
          Read the editorial
        </button>
      </div>
    </IridescentSweepHero>
  )} as const;
