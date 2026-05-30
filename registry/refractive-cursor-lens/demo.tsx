// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "refractive-cursor-lens": ({ theme = "dark" }) => (
    <div
      className={cn(
        "relative h-[460px] w-full overflow-hidden rounded-xl border",
        theme === "dark"
          ? "border-neutral-800 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950"
          : "border-neutral-200 bg-gradient-to-br from-neutral-100 via-white to-neutral-100",
      )}
    >
      <RefractiveCursorLens className="h-full w-full">
        <div className="flex h-full w-full items-center justify-center px-10 py-12">
          <article className="max-w-xl">
            <span
              className={cn(
                "text-[11px] font-mono uppercase tracking-[0.32em]",
                theme === "dark" ? "text-neutral-400" : "text-neutral-500",
              )}
            >
              iOS 26 magnifier · liquid glass
            </span>
            <h2
              className={cn(
                "mt-3 text-4xl font-semibold leading-tight tracking-tight",
                theme === "dark" ? "text-white" : "text-neutral-900",
              )}
            >
              Move your cursor anywhere here.
            </h2>
            <p
              className={cn(
                "mt-4 text-base leading-relaxed",
                theme === "dark" ? "text-neutral-300" : "text-neutral-700",
              )}
            >
              The lens follows you with a slight spring lag and refracts
              whatever sits underneath — type, gradients, images. Clicks pass
              straight through. Hidden on touch and reduced-motion.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["SVG", "backdrop-filter", "spring", "pointer:fine"].map(
                (tag) => (
                  <span
                    key={tag}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium",
                      theme === "dark"
                        ? "bg-white/5 text-neutral-300 ring-1 ring-white/10"
                        : "bg-black/5 text-neutral-700 ring-1 ring-black/10",
                    )}
                  >
                    {tag}
                  </span>
                ),
              )}
            </div>
          </article>
        </div>
      </RefractiveCursorLens>
    </div>
  )} as const;
