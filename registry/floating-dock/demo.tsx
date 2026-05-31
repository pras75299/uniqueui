// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "floating-dock": ({ theme = "dark" }) => (
    <div
      className={cn(
        "flex items-center justify-center p-20",
        theme === "dark" ? "text-white" : "text-neutral-900",
      )}
    >
      <FloatingDock
        theme={theme}
        items={[
          {
            id: "home",
            icon: <span className="text-xl">🏠</span>,
            label: "Home",
          },
          {
            id: "search",
            icon: <span className="text-xl">✨</span>,
            label: "Search",
          },
          {
            id: "layers",
            icon: <span className="text-xl">📚</span>,
            label: "Layers",
          },
          {
            id: "scroll",
            icon: <span className="text-xl">📜</span>,
            label: "Scroll",
          },
          {
            id: "terminal",
            icon: <span className="text-xl">💻</span>,
            label: "Terminal",
          },
        ]}
      />
    </div>
  )} as const;
