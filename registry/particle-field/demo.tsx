// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "particle-field/single": ({ theme = "dark" }) => (
    <div
      className={cn(
        "rounded-xl overflow-hidden border h-[400px] w-full relative",
        theme === "dark"
          ? "border-neutral-800 bg-neutral-950"
          : "border-neutral-200 bg-neutral-800",
      )}
    >
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
        <h3
          className={cn(
            "text-3xl font-bold bg-clip-text text-transparent text-center",
            theme === "dark"
              ? "bg-gradient-to-b from-white to-neutral-500"
              : "bg-gradient-to-b from-neutral-100 to-neutral-400",
          )}
        >
          Interactive
          <br />
          Particle Field
        </h3>
      </div>
      <ParticleField particleCount={120} particleColor="#a855f7" speed={0.5} />
    </div>
  ),
  "particle-field/multi": ({ theme = "dark" }) => (
    <div
      className={cn(
        "rounded-xl overflow-hidden border h-[400px] w-full relative",
        theme === "dark"
          ? "border-neutral-800 bg-neutral-950"
          : "border-neutral-200 bg-neutral-800",
      )}
    >
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
        <h3
          className={cn(
            "text-3xl font-bold bg-clip-text text-transparent text-center",
            theme === "dark"
              ? "bg-gradient-to-b from-white to-neutral-500"
              : "bg-gradient-to-b from-neutral-100 to-neutral-400",
          )}
        >
          Interactive
          <br />
          Particle Field
        </h3>
      </div>
      <ParticleField
        particleCount={120}
        particleColor={["#a855f7", "#06b6d4", "#f472b6"]}
        speed={0.5}
      />
    </div>
  )} as const;
