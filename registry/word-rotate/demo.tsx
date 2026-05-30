// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {

  "word-rotate": ({ theme = "dark" }) => (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-10 p-10 text-center",
        theme === "dark" ? "text-white" : "text-neutral-900",
      )}
    >
      <h2
        className={cn(
          "text-3xl font-black tracking-tight",
          theme === "dark" ? "text-white" : "text-neutral-900",
        )}
      >
        Build interfaces that are{" "}
        <WordRotate
          words={["faster", "smarter", "bolder", "yours"]}
          animation="slide-up"
          interval={2000}
          theme={theme}
          className="text-purple-400"
        />
      </h2>

      <div className="flex flex-wrap justify-center gap-6 text-sm">
        {(["slide-up", "slide-down", "flip", "fade"] as const).map((anim) => (
          <div key={anim} className="text-center space-y-1">
            <p
              className={cn(
                "text-xs font-mono mb-2",
                theme === "dark" ? "text-neutral-500" : "text-neutral-400",
              )}
            >
              {anim}
            </p>
            <WordRotate
              words={["React", "Motion", "Tailwind"]}
              animation={anim}
              interval={1800}
              theme={theme}
              className={cn(
                "text-lg font-semibold",
                theme === "dark" ? "text-neutral-200" : "text-neutral-800",
              )}
            />
          </div>
        ))}
      </div>
    </div>
  )} as const;
