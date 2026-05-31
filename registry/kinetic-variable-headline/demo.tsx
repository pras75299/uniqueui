// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "kinetic-variable-headline": ({ theme = "dark" }) => (
    <div className="relative flex min-h-[320px] w-full items-center justify-center overflow-hidden px-8 py-12">
      <KineticVariableHeadline
        text="CRAFTED MOTION"
        mode="both"
        as="h1"
        className={cn(
          "text-center text-[clamp(3.5rem,11vw,7.2rem)] uppercase",
          theme === "dark" ? "text-white" : "text-[#0d1f3d]",
        )}
      />
    </div>
  )} as const;
