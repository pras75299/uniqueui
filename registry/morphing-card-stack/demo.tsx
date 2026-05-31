// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "morphing-card-stack/default": ({ theme = "dark" }) => (
    <div
      className={cn(
        "flex items-center justify-center p-12 min-h-[500px] w-full rounded-xl border",
        theme === "dark"
          ? "bg-neutral-950 border-neutral-800"
          : "bg-neutral-100 border-neutral-200",
      )}
    >
      <MorphingCardStack
        theme={theme}
        cards={[
          {
            id: "1",
            title: "Magnetic Dock",
            description:
              "Cursor-responsive scaling with smooth spring animations",
            icon: <Layers className="h-5 w-5" />,
          },
          {
            id: "2",
            title: "Gradient Mesh",
            description:
              "Dynamic animated gradient backgrounds that follow your cursor",
            icon: <Palette className="h-5 w-5" />,
          },
          {
            id: "3",
            title: "Pulse Timeline",
            description: "Interactive timeline with animated pulse nodes",
            icon: <Clock className="h-5 w-5" />,
          },
          {
            id: "4",
            title: "Command Palette",
            description: "Radial command menu with keyboard navigation",
            icon: <Sparkles className="h-5 w-5" />,
          },
        ]}
      />
    </div>
  )} as const;
