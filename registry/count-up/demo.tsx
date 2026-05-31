// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {

  "count-up": ({ theme = "dark" }) => (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-12 p-10",
        theme === "dark" ? "text-white" : "text-neutral-900",
      )}
    >
      {[
        { to: 12400, suffix: "+", label: "GitHub Stars", prefix: "" },
        { to: 99.9, suffix: "%", label: "Uptime SLA", prefix: "", decimals: 1 },
        { to: 68, suffix: " components", label: "Ready to use", prefix: "" },
        { to: 4200, suffix: "+", label: "Developers", prefix: "" },
      ].map(({ to, suffix, label, prefix, decimals }) => (
        <div key={label} className="text-center space-y-1">
          <p
            className={cn(
              "text-4xl font-black",
              theme === "dark" ? "text-white" : "text-neutral-900",
            )}
          >
            <CountUp
              to={to}
              suffix={suffix}
              prefix={prefix}
              decimals={decimals ?? 0}
              duration={2.2}
              theme={theme}
            />
          </p>
          <p
            className={cn(
              "text-sm",
              theme === "dark" ? "text-neutral-500" : "text-neutral-500",
            )}
          >
            {label}
          </p>
        </div>
      ))}
    </div>
  )} as const;
