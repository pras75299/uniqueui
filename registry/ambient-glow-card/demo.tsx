// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "ambient-glow-card": () => (
    <div className="mx-auto w-full max-w-xl px-4 sm:px-6">
      <AmbientGlowCard
        className="min-h-[15rem]"
        blobColor={["#f9b8c4", "#f897ad", "#fcd1c1"]}
        animationDuration={24}
      >
        <h3 className="text-xl font-semibold sm:text-2xl">
          Software That Actually Scales
        </h3>
        <p>
          Not code. Not prototypes. Real, live systems running in production
          from day one.
        </p>
      </AmbientGlowCard>
    </div>
  )} as const;
