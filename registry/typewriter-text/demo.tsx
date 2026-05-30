// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "typewriter-text": ({ theme = "dark" }) => (
    <div
      className={cn(
        "space-y-6 text-center p-10",
        theme === "dark" ? "text-white" : "text-neutral-900",
      )}
    >
      <div
        className={cn(
          "text-3xl font-bold",
          theme === "dark" ? "text-white" : "text-neutral-900",
        )}
      >
        I love{" "}
        <TypewriterText
          theme={theme}
          words={["React", "TypeScript", "Motion", "Tailwind", "UniqueUI"]}
          className="text-purple-400"
          typingSpeed={100}
          deletingSpeed={60}
        />
      </div>
      <div
        className={cn(
          "text-lg",
          theme === "dark" ? "text-neutral-400" : "text-neutral-600",
        )}
      >
        <TypewriterText
          theme={theme}
          words={[
            "Building amazing user interfaces...",
            "With beautiful animations...",
            "That stand out from the crowd.",
          ]}
          typingSpeed={50}
          deletingSpeed={30}
          delayBetweenWords={2000}
        />
      </div>
    </div>
  )} as const;
