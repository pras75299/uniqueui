// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "confetti-burst": ({ theme = "dark" }) => (
    <div className="flex items-center justify-center p-20">
      <ConfettiBurst
        theme={theme}
        className={cn(
          "rounded-xl p-12 border transition-colors cursor-pointer",
          theme === "dark"
            ? "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700"
            : "border-neutral-200 bg-neutral-100 hover:border-neutral-300",
        )}
      >
        <div className="text-center">
          <h3
            className={cn(
              "text-xl font-bold mb-2",
              theme === "dark" ? "text-white" : "text-neutral-900",
            )}
          >
            🎉 Click me!
          </h3>
          <p
            className={cn(
              "text-sm",
              theme === "dark" ? "text-neutral-400" : "text-neutral-600",
            )}
          >
            Click anywhere on this card for confetti
          </p>
        </div>
      </ConfettiBurst>
    </div>
  )} as const;
