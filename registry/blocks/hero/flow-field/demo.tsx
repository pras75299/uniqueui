// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "hero-flow-field": () => (
    <FlowFieldHero
      backgroundProps={{
        spacing: 56,
        color: "rgba(125,211,252,0.45)",
        scrollStrength: 1,
      }}
    >
      <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/70 backdrop-blur">
        <span
          aria-hidden
          className="h-1.5 w-1.5 rounded-full bg-sky-300/90 shadow-[0_0_10px_2px] shadow-sky-300/40"
        />
        Field · scroll to flow
      </span>
      <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
        Momentum you can see.
      </h1>
      <p className="mt-5 max-w-xl text-pretty text-base text-white/65 sm:text-lg">
        A canvas flow field of streamlines that bend and wave with the page
        scroll position. Scroll-driven, not cursor-driven — no external deps.
      </p>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          className="group inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-medium text-black transition-transform duration-200 hover:-translate-y-px"
        >
          <span>Get started</span>
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
    </FlowFieldHero>
  )} as const;
