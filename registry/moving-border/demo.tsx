// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "moving-border": ({ theme = "dark" }) => (
    <div className="flex flex-wrap gap-6 items-center justify-center p-10">
      <Button
        theme={theme}
        borderRadius="1.75rem"
        className="bg-zinc-950 text-white border-neutral-200 dark:border-slate-800"
      >
        Click me
      </Button>
      <Button
        theme={theme}
        borderRadius="1rem"
        className="bg-zinc-950 text-white border-neutral-200 dark:border-slate-800"
        containerClassName="h-12 w-48"
      >
        Rounded Button
      </Button>
    </div>
  )} as const;
