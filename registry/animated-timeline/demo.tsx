// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  // ─── Animated Timeline per-variant demos ─────────────────────────────────────
  "animated-timeline/vertical": ({ theme = "dark" }) => (
    <div className="p-10 w-full max-w-sm mx-auto">
      <AnimatedTimeline
        theme={theme}
        variant="vertical"
        lineColor="#3f3f46"
        items={[
          {
            id: "1",
            title: "Project Kickoff",
            description: "Scope defined and team assembled.",
            color: "#a855f7",
            date: "Jan 2026",
          },
          {
            id: "2",
            title: "Design Phase",
            description: "Wireframes and component system finalised.",
            color: "#6366f1",
            date: "Jan 2026",
          },
          {
            id: "3",
            title: "Dev Sprint",
            description: "Core components built and tested end-to-end.",
            color: "#ec4899",
            date: "Feb 2026",
          },
          {
            id: "4",
            title: "Public Launch",
            description: "CLI published and registry live.",
            color: "#10b981",
            date: "Feb 2026",
          },
        ]}
      />
    </div>
  ),
  "animated-timeline/horizontal": ({ theme = "dark" }) => (
    <div className="p-10 w-full overflow-x-auto">
      <AnimatedTimeline
        theme={theme}
        variant="horizontal"
        lineColor="#3f3f46"
        items={[
          {
            id: "1",
            title: "Kickoff",
            description: "Scope agreed.",
            color: "#a855f7",
            date: "Jan",
          },
          {
            id: "2",
            title: "Design",
            description: "Wireframes done.",
            color: "#6366f1",
            date: "Jan",
          },
          {
            id: "3",
            title: "Build",
            description: "Components shipped.",
            color: "#ec4899",
            date: "Feb",
          },
          {
            id: "4",
            title: "Launch",
            description: "Registry live.",
            color: "#10b981",
            date: "Feb",
          },
        ]}
      />
    </div>
  ),
  "animated-timeline/cards": ({ theme = "dark" }) => (
    <div className="p-8 w-full max-w-lg mx-auto">
      <AnimatedTimeline
        theme={theme}
        variant="cards"
        lineColor="#3f3f46"
        items={[
          {
            id: "1",
            title: "Project Kickoff",
            description: "Scope defined and team assembled.",
            color: "#a855f7",
            date: "Jan 2026",
          },
          {
            id: "2",
            title: "Design Phase",
            description: "Wireframes and component system finalised.",
            color: "#6366f1",
            date: "Jan 2026",
          },
          {
            id: "3",
            title: "Dev Sprint",
            description: "Core components built and tested end-to-end.",
            color: "#ec4899",
            date: "Feb 2026",
          },
          {
            id: "4",
            title: "Public Launch",
            description: "CLI published and registry live.",
            color: "#10b981",
            date: "Feb 2026",
          },
        ]}
      />
    </div>
  ),
  "animated-timeline/steps": ({ theme = "dark" }) => (
    <div className="p-10 w-full max-w-sm mx-auto">
      <AnimatedTimeline
        theme={theme}
        variant="steps"
        items={[
          {
            id: "1",
            title: "Install the CLI",
            description: "Run npx uniqueui init in your project.",
            color: "#a855f7",
          },
          {
            id: "2",
            title: "Add a component",
            description: "Run npx uniqueui add animated-timeline.",
            color: "#6366f1",
          },
          {
            id: "3",
            title: "Import and customise",
            description: "Use variant, color, and date props as needed.",
            color: "#ec4899",
          },
          {
            id: "4",
            title: "Ship to production",
            description: "Zero runtime dependency — fully your code.",
            color: "#10b981",
          },
        ]}
      />
    </div>
  )} as const;
