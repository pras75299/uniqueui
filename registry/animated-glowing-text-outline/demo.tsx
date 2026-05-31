// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "animated-glowing-text-outline": () => (
    <div className="flex flex-col items-center justify-center p-10 min-h-[400px] w-full bg-background gap-16 border border-border rounded-xl overflow-hidden relative">
      <GlowingTextOutline
        text="Hello World"
        fontSize={80}
        colors={["#ffaa40", "#9c40ff", "#ffaa40"]}
        animationDuration={5}
      />
    </div>
  )} as const;
