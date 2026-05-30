// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "macbook-mock": ({ theme = "dark" }) => (
    <div
      className={cn(
        "flex min-h-[320px] w-full items-center justify-center px-6 py-10",
        theme === "dark" ? "bg-neutral-950" : "bg-neutral-100",
      )}
    >
      <MacbookMock
        size="md"
        tint={theme === "dark" ? "spaceGray" : "silver"}
        screenIdleClassName={
          theme === "dark" ? "bg-[#121212]" : "bg-neutral-200"
        }
      />
    </div>
  )} as const;
