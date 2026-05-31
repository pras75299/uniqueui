// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "limelight-nav/default": ({ theme = "dark" }) => (
    <div
      className={cn(
        "flex items-center justify-center p-12 h-[300px] w-full rounded-xl",
        theme === "dark" ? "bg-neutral-950" : "bg-neutral-100",
      )}
    >
      <LimelightNav
        theme={theme}
        limelightColor="#a855f7"
        items={[
          { id: "1", icon: <HomeIcon />, label: "Home" },
          { id: "2", icon: <Compass />, label: "Explore" },
          { id: "3", icon: <Bell />, label: "Notifications" },
        ]}
      />
    </div>
  ),
  "limelight-nav/custom": ({ theme = "dark" }) => (
    <div
      className={cn(
        "flex items-center justify-center p-12 h-[300px] w-full rounded-xl",
        theme === "dark" ? "bg-neutral-950" : "bg-neutral-100",
      )}
    >
      <LimelightNav
        theme={theme}
        limelightColor="#06b6d4"
        className={theme === "dark" ? "bg-neutral-900/50" : "bg-white/60"}
        items={[
          { id: "1", icon: <HomeIcon />, label: "Home" },
          { id: "2", icon: <Bookmark />, label: "Bookmarks" },
          { id: "3", icon: <PlusCircle />, label: "Add" },
          { id: "4", icon: <User />, label: "Profile" },
          { id: "5", icon: <Settings />, label: "Settings" },
        ]}
      />
    </div>
  )} as const;
