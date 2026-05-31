// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "mini-mac-keyboard": () => (
    <div className="flex min-h-[280px] w-full items-center justify-center overflow-visible px-4 py-8">
      <MiniMacKeyboard wrapperClassName="translate-x-0 translate-y-0 md:translate-y-0 scale-[2.35] sm:scale-[2.75] md:scale-[3.2]" />
    </div>
  )} as const;
