// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "hero-noise-dot-field": () => (
    <NoiseDotFieldHero
      backgroundProps={{
        spacing: 28,
        color: "rgba(255,255,255,0.85)",
        pocketRadius: 180,
      }}
    >
      <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/70 backdrop-blur">
        <span
          aria-hidden
          className="h-1.5 w-1.5 rounded-full bg-cyan-300/90 shadow-[0_0_10px_2px] shadow-cyan-300/40"
        />
        Field · 0x004
      </span>
      <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
        Engineered, down to the pixel.
      </h1>
      <p className="mt-5 max-w-xl text-pretty text-base text-white/65 sm:text-lg">
        A canvas-rendered dot grid that displaces with a sine-wave noise field
        and parts around your cursor. No external animation deps.
      </p>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          className="group inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-medium text-black transition-transform duration-200 hover:-translate-y-px"
        >
          <span>Read the spec</span>
          <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
            →
          </span>
        </button>
        <button
          type="button"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-6 font-mono text-xs uppercase tracking-[0.18em] text-white/85 backdrop-blur transition-colors hover:bg-white/5"
        >
          View source
        </button>
      </div>
    </NoiseDotFieldHero>
  )} as const;
