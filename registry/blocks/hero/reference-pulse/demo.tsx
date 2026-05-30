// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  // Main hero demos — render the same inline JSX shown in each block's
  // `docs.usageCode` (registry/components/<slug>.json) so the Preview and Usage produce byte-
  // identical DOM. The plain-JSX form (no motion.* wrappers) trades the
  // staggered entrance polish for full code transparency — every <span>,
  // <h1>, <p>, and <button> the user sees is the exact one they copy.
  "hero-reference-pulse": () => (
    <ReferencePulseHero
      className="bg-[#08080a] text-white"
      backgroundProps={{
        speed: 7,
        baseColor: "#08080a",
        conicPalette: [
          "hsla(268, 95%, 62%, 0.55)",
          "hsla(328, 95%, 60%, 0.35)",
          "hsla(228, 95%, 60%, 0.55)",
          "hsla(268, 95%, 62%, 0.55)",
        ],
        pulseColor: "hsla(268, 95%, 70%, 0.45)",
      }}
    >
      <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/70 backdrop-blur">
        <span className="h-1.5 w-1.5 rounded-full bg-white/80" aria-hidden />
        Hero block
      </span>
      <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
        Build with light, not boxes.
      </h1>
      <p className="mt-5 max-w-xl text-pretty text-base text-white/65 sm:text-lg">
        A reference hero block. Drop in your own children to override the
        default composition — the background lives on its own as well.
      </p>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          className="group relative inline-flex h-11 items-center gap-2 overflow-hidden rounded-full bg-white px-6 text-sm font-medium text-black transition-transform duration-200 hover:-translate-y-px"
        >
          <span>Get started</span>
          <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
            →
          </span>
        </button>
        <button
          type="button"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-6 text-sm font-medium text-white/85 backdrop-blur transition-colors hover:bg-white/5"
        >
          Read docs
        </button>
      </div>
    </ReferencePulseHero>
  )} as const;
