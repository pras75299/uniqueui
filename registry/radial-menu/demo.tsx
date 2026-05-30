// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "radial-menu": ({ theme = "dark" }) => (
    <div
      className={cn(
        "h-[400px] w-full flex items-center justify-center p-12 rounded-xl overflow-hidden shadow-inner border",
        theme === "dark"
          ? "bg-neutral-950 border-neutral-800"
          : "bg-neutral-100 border-neutral-200",
      )}
    >
      <RadialMenu
        theme={theme}
        radius={110}
        startAngle={-180}
        endAngle={0}
        staggerDelay={0.06}
        items={[
          { id: "1", label: "Settings", icon: <Layers className="w-5 h-5" /> },
          { id: "2", label: "Search", icon: <Ghost className="w-5 h-5" /> },
          { id: "3", label: "Apps", icon: <Terminal className="w-5 h-5" /> },
          { id: "4", label: "Docs", icon: <ScrollText className="w-5 h-5" /> },
          { id: "5", label: "Theme", icon: <Sparkles className="w-5 h-5" /> },
        ]}
      />
    </div>
  )} as const;
