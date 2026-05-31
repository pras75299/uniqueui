// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "infinite-marquee": ({ theme = "dark" }) => (
    <div className="space-y-6 w-full p-10 overflow-hidden">
      <InfiniteMarquee theme={theme} speed={30}>
        {[
          "React",
          "Next.js",
          "TypeScript",
          "Tailwind",
          "Motion",
          "UniqueUI",
          "Vercel",
          "Node.js",
        ].map((item) => (
          <MarqueeItem key={item}>
            <span
              className={cn(
                "text-sm font-medium",
                theme === "dark" ? "text-neutral-300" : "text-neutral-600",
              )}
            >
              {item}
            </span>
          </MarqueeItem>
        ))}
      </InfiniteMarquee>
      <InfiniteMarquee theme={theme} speed={20} direction="right">
        {[
          "⚡ Fast",
          "🎨 Beautiful",
          "♿ Accessible",
          "📱 Responsive",
          "🔧 Customizable",
          "🚀 Production Ready",
        ].map((item) => (
          <MarqueeItem
            key={item}
            className={
              theme === "dark"
                ? "bg-purple-950/30 border-purple-800/50"
                : "bg-purple-100 border-purple-200/50"
            }
          >
            <span
              className={cn(
                "text-sm font-medium",
                theme === "dark" ? "text-purple-300" : "text-purple-700",
              )}
            >
              {item}
            </span>
          </MarqueeItem>
        ))}
      </InfiniteMarquee>
    </div>
  )} as const;
