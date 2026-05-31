// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "skeleton-shimmer": ({ theme = "dark" }) => (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 gap-6 p-10 w-full",
        theme === "dark" ? "text-white" : "text-neutral-900",
      )}
    >
      <SkeletonCard theme={theme} />
      <div
        className={cn(
          "space-y-4 p-6 rounded-xl border",
          theme === "dark"
            ? "border-neutral-800 bg-neutral-900/50"
            : "border-neutral-200 bg-neutral-100",
        )}
      >
        <SkeletonShimmer theme={theme} width="80%" height={20} rounded="md" />
        <SkeletonShimmer theme={theme} count={4} height={14} />
        <div className="flex gap-3">
          <SkeletonShimmer theme={theme} width={100} height={36} rounded="lg" />
          <SkeletonShimmer theme={theme} width={100} height={36} rounded="lg" />
        </div>
      </div>
    </div>
  )} as const;
