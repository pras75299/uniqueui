// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {

  "dynamic-info": ({ theme = "dark" }) => (
    <div
      className={cn(
        "rounded-xl overflow-hidden h-[300px] w-full relative",
        theme === "dark" ? "bg-neutral-900" : "bg-neutral-200",
      )}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2">
        <DynamicInfo
          theme={theme}
          name="James Doe"
          role="Designer"
          avatar="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&h=160&fit=crop"
          defaultExpanded
          position="static"
          mergeEdge="top"
          socials={[
            {
              id: "x",
              icon: <Share2 size={14} />,
              label: "X",
              href: "https://x.com",
            },
            {
              id: "in",
              icon: <Link2 size={14} />,
              label: "LinkedIn",
              href: "https://linkedin.com",
            },
            {
              id: "gh",
              icon: <Globe size={14} />,
              label: "GitHub",
              href: "https://github.com",
            },
          ]}
          status={{ label: "Available", color: "#22c55e" }}
        />
      </div>
    </div>
  )} as const;
