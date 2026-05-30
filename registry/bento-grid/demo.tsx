// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  // ─── Bento Grid per-variant demos ───────────────────────────────────────────
  // These keys exactly match the demoKey in each ComponentVariant in components.ts
  "bento-grid/features": ({ theme = "dark" }) => (
    <div className="p-6 w-full">
      <BentoGrid theme={theme}>
        <BentoCard
          theme={theme}
          icon={<Sparkles className="w-5 h-5" />}
          title="Beautiful animations"
          description="Every interaction is crafted with spring-physics Motion.dev animations for a premium feel."
          cta="Explore components"
          href="#"
          className="col-span-2"
          spinBorder
          spinBorderColors={["#E2CBFF", "#393BB2"]}
        />
        <BentoCard
          theme={theme}
          icon={<Zap className="w-5 h-5" />}
          title="Lightning fast"
          description="Copy-paste components with zero runtime overhead."
          spinBorder
          spinBorderColors={["#a3e635", "#065f46"]}
        />
        <BentoCard
          theme={theme}
          icon={<Shield className="w-5 h-5" />}
          title="Type-safe props"
          description="Fully typed with TypeScript for confidence at scale."
          spinBorder
          spinBorderColors={["#67e8f9", "#1e3a5f"]}
        />
        <BentoCard
          theme={theme}
          icon={<Globe className="w-5 h-5" />}
          title="Zero lock-in"
          description="You own the code. No external runtime dependency."
          cta="Get started"
          href="#"
          className="col-span-2"
          spinBorder
          spinBorderColors={["#fda4af", "#9f1239"]}
        />
      </BentoGrid>
    </div>
  ),
  "bento-grid/showcase": ({ theme = "dark" }) => (
    <div className="p-6 w-full">
      <BentoGrid theme={theme}>
        <BentoCard
          theme={theme}
          title="Aurora vibes"
          description="Layered animated gradients that feel alive."
          background={
            <div className="absolute inset-0 bg-gradient-to-br from-violet-700/30 via-fuchsia-600/15 to-cyan-600/20 animate-pulse motion-reduce:animate-none" />
          }
          cta="View component"
          href="#"
          className="col-span-2"
        />
        <BentoCard
          theme={theme}
          title="Magnetic pull"
          description="Spring-physics cursor attraction."
          background={
            <div className="absolute inset-0 bg-gradient-to-br from-rose-700/25 to-orange-600/20" />
          }
        />
        <BentoCard
          theme={theme}
          title="Spotlight effect"
          description="Radial light that follows your mouse."
          background={
            <div className="absolute inset-0 bg-gradient-to-br from-sky-700/25 to-indigo-700/20" />
          }
        />
        <BentoCard
          theme={theme}
          title="Meteor storm"
          description="Shooting star particles raining through cards."
          background={
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-700/25 to-teal-600/20" />
          }
          cta="Try it"
          href="#"
          className="col-span-2"
        />
      </BentoGrid>
    </div>
  ),
  "bento-grid/stats": ({ theme = "dark" }) => (
    <div className="p-6 w-full">
      <BentoGrid theme={theme} className="auto-rows-[160px]">
        <BentoCard
          theme={theme}
          title="Components"
          description="Production-ready animated components"
          background={
            <div
              className={cn(
                "absolute top-4 right-4 text-6xl font-black select-none",
                theme === "dark" ? "text-white/[0.06]" : "text-neutral-900/10",
              )}
            >
              24
            </div>
          }
          icon={<span className="text-2xl font-black text-violet-400">24</span>}
        />
        <BentoCard
          theme={theme}
          title="Zero dependencies"
          description="No UniqueUI runtime in your bundle"
          background={
            <div
              className={cn(
                "absolute top-4 right-4 text-6xl font-black select-none",
                theme === "dark" ? "text-white/[0.06]" : "text-neutral-900/10",
              )}
            >
              0
            </div>
          }
          icon={<span className="text-2xl font-black text-emerald-400">0</span>}
        />
        <BentoCard
          theme={theme}
          title="Install time"
          description="Seconds from CLI to working component"
          icon={<span className="text-2xl font-black text-sky-400">~3s</span>}
        />
        <BentoCard
          theme={theme}
          title="MIT License"
          description="Open source forever. Fork it, extend it, ship it."
          cta="View on GitHub"
          href="https://github.com"
          className="col-span-2"
        />
        <BentoCard
          theme={theme}
          title="Tailwind compatible"
          description="v3 and v4 supported"
          icon={<span className="text-2xl font-black text-cyan-400">✓</span>}
        />
      </BentoGrid>
    </div>
  ),
  "bento-grid/team": ({ theme = "dark" }) => (
    <div className="p-6 w-full">
      <BentoGrid theme={theme} className="auto-rows-[180px]">
        {[
          {
            name: "Alex Kim",
            role: "Lead Engineer",
            tag: "Motion",
            color: "#a855f7",
          },
          {
            name: "Sara Chen",
            role: "Design Systems",
            tag: "Tailwind",
            color: "#6366f1",
          },
          {
            name: "Jordan Lee",
            role: "DX Engineer",
            tag: "CLI",
            color: "#ec4899",
          },
          {
            name: "Maya Patel",
            role: "Animations Lead",
            tag: "Motion.dev",
            color: "#10b981",
          },
          {
            name: "Ryan Wu",
            role: "Accessibility",
            tag: "ARIA",
            color: "#f59e0b",
          },
          {
            name: "Priya Shah",
            role: "TypeScript Infra",
            tag: "TS 5.x",
            color: "#3b82f6",
          },
        ].map((m) => (
          <BentoCard
            key={m.name}
            theme={theme}
            title={m.name}
            description={m.role}
            cta={m.tag}
            background={
              <div
                className="absolute bottom-0 right-0 w-24 h-24 rounded-tl-full opacity-10"
                style={{ backgroundColor: m.color }}
              />
            }
            icon={
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{
                  backgroundColor: m.color + "33",
                  border: `1.5px solid ${m.color}66`,
                }}
              >
                {m.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
            }
          />
        ))}
      </BentoGrid>
    </div>
  )} as const;
