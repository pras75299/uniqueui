// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "animated-tabs": ({ theme = "dark" }) => (
    <div className="max-w-md mx-auto p-10">
      <AnimatedTabs
        theme={theme}
        tabs={[
          {
            id: "design",
            label: "Design",
            content: (
              <div
                className={cn(
                  "p-4 rounded-lg text-sm",
                  theme === "dark"
                    ? "bg-neutral-900/50 border border-neutral-800 text-neutral-300"
                    : "bg-neutral-100 border border-neutral-200 text-neutral-700",
                )}
              >
                Build stunning interfaces with our design system. Every
                component is crafted with attention to detail.
              </div>
            ),
          },
          {
            id: "animate",
            label: "Animate",
            content: (
              <div
                className={cn(
                  "p-4 rounded-lg text-sm",
                  theme === "dark"
                    ? "bg-neutral-900/50 border border-neutral-800 text-neutral-300"
                    : "bg-neutral-100 border border-neutral-200 text-neutral-700",
                )}
              >
                Add life to your UI with spring-physics animations powered by
                Motion.dev.
              </div>
            ),
          },
          {
            id: "ship",
            label: "Ship",
            content: (
              <div
                className={cn(
                  "p-4 rounded-lg text-sm",
                  theme === "dark"
                    ? "bg-neutral-900/50 border border-neutral-800 text-neutral-300"
                    : "bg-neutral-100 border border-neutral-200 text-neutral-700",
                )}
              >
                Deploy with confidence. All components are production-ready and
                accessible.
              </div>
            ),
          },
        ]}
      />
    </div>
  )} as const;
