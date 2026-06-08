// Demo fragment — merged into apps/www/config/demos.tsx by `pnpm build:registry`.
// Imports come from registry/demos/shared.tsx.

export const demoEntries = {
  "animated-tooltip": ({ theme = "dark" }) => {
    const isDark = theme === "dark";
    const triggerClass = cn(
      "rounded-md px-4 py-2 text-sm font-medium transition-colors",
      isDark
        ? "bg-neutral-800 text-neutral-100 hover:bg-neutral-700"
        : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200",
    );

    return (
      <div className="flex flex-col items-center gap-10 p-12">
        {/* Placement on every side */}
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <AnimatedTooltip content="Appears on top" side="top">
            <button type="button" className={triggerClass}>
              Top
            </button>
          </AnimatedTooltip>
          <AnimatedTooltip content="Appears on the right" side="right">
            <button type="button" className={triggerClass}>
              Right
            </button>
          </AnimatedTooltip>
          <AnimatedTooltip content="Appears at the bottom" side="bottom">
            <button type="button" className={triggerClass}>
              Bottom
            </button>
          </AnimatedTooltip>
          <AnimatedTooltip content="Appears on the left" side="left">
            <button type="button" className={triggerClass}>
              Left
            </button>
          </AnimatedTooltip>
        </div>

        {/* Independent colour control */}
        <div className="flex flex-wrap items-center justify-center gap-6">
          <AnimatedTooltip
            content="Custom themed tooltip"
            background="#7c3aed"
            color="#ffffff"
            arrowColor="#7c3aed"
            side="top"
          >
            <button type="button" className={triggerClass}>
              Violet
            </button>
          </AnimatedTooltip>
          <AnimatedTooltip
            content="Contrasting arrow"
            background="#f59e0b"
            color="#1c1917"
            arrowColor="#ef4444"
            side="bottom"
          >
            <button type="button" className={triggerClass}>
              Mismatched arrow
            </button>
          </AnimatedTooltip>
          <AnimatedTooltip content="No arrow, larger gap" arrow={false} offset={12}>
            <button type="button" className={triggerClass}>
              Arrowless
            </button>
          </AnimatedTooltip>
        </div>

        {/* Rich content + non-button triggers */}
        <div className="flex flex-wrap items-center justify-center gap-8">
          <AnimatedTooltip
            side="top"
            className="max-w-[16rem]"
            background={isDark ? "#0f172a" : "#1e293b"}
            color="#e2e8f0"
            content={
              <div className="space-y-1">
                <p className="font-semibold">Keyboard shortcut</p>
                <p className="text-xs text-slate-400">
                  Press {"⌘"}K to open the command palette from anywhere.
                </p>
              </div>
            }
          >
            <button type="button" className={triggerClass}>
              Rich content
            </button>
          </AnimatedTooltip>

          <AnimatedTooltip content="More information" side="top">
            <button
              type="button"
              aria-label="More information"
              className={cn(
                "grid h-9 w-9 place-items-center rounded-full transition-colors",
                isDark
                  ? "bg-neutral-800 text-neutral-100 hover:bg-neutral-700"
                  : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200",
              )}
            >
              <Info className="h-4 w-4" />
            </button>
          </AnimatedTooltip>

          <AnimatedTooltip content="Opens in a new tab" side="bottom">
            <a
              href="#animated-tooltip"
              className={cn(
                "text-sm font-medium underline underline-offset-4",
                isDark ? "text-violet-400" : "text-violet-600",
              )}
            >
              Link trigger
            </a>
          </AnimatedTooltip>
        </div>
      </div>
    );
  }
} as const;
