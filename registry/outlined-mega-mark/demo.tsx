// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {

  "outlined-mega-mark": () => (
    <OutlinedMegaMark
      containerClassName="flex w-full max-w-full flex-col items-center justify-center px-3 py-2 md:py-4"
      fontSize="clamp(7rem, 26vw, 14rem)"
      letterSpacing="-0.02em"
      strokeWidth={1}
      lightStrokeColor="var(--color-neutral-400, #a3a3a3)"
      darkStrokeColor="var(--color-neutral-200, #e5e5e5)"
      gradientOnHover
      outlineGradient={{
        stops: ["#fde68a", "#f97316", "#ec4899"],
        x1: "0%",
        y1: "0%",
        x2: "100%",
        y2: "0%",
      }}
    >
      UniqueUI
    </OutlinedMegaMark>
  )} as const;
