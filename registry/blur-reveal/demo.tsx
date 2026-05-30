// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {

  "blur-reveal": ({ theme = "dark" }) => (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-8 p-10 text-center",
        theme === "dark" ? "text-white" : "text-neutral-900",
      )}
    >
      <BlurReveal
        text="Build stunning interfaces."
        animateBy="characters"
        delay={0}
        theme={theme}
        className="text-3xl font-black tracking-tight"
      />
      <BlurReveal
        text="Animated components that make users stop and stare."
        animateBy="words"
        delay={0.2}
        theme={theme}
        className={cn(
          "text-base max-w-sm leading-relaxed",
          theme === "dark" ? "text-neutral-400" : "text-neutral-600",
        )}
      />
    </div>
  )} as const;
