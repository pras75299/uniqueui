// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "dropdown/single": ({ theme = "dark" }) => {
    return (
      <div className="flex h-[440px] w-full justify-center px-6 pt-10">
        <Dropdown
          theme={theme}
          placeholder="Select a role"
          clearable
          options={[
            {
              value: "admin",
              label: "Administrator",
              icon: <Shield className="h-4 w-4 text-purple-400" />,
              description: "Full access to everything",
            },
            {
              value: "editor",
              label: "Editor",
              icon: <Settings className="h-4 w-4 text-blue-400" />,
              description: "Can create and edit content",
            },
            {
              value: "viewer",
              label: "Viewer",
              icon: <User className="h-4 w-4 text-green-400" />,
              description: "Read-only access",
            },
            {
              value: "guest",
              label: "Guest",
              icon: <Globe className="h-4 w-4 text-neutral-400" />,
              disabled: true,
            },
          ]}
        />
      </div>
    );
  },
  "dropdown/multi": ({ theme = "dark" }) => {
    return (
      <div className="flex h-[440px] w-full justify-center px-6 pt-10">
        <Dropdown
          theme={theme}
          multiple
          searchable
          clearable
          showSelectAll
          chips
          defaultValue={["react", "ts"]}
          placeholder="Pick technologies"
          searchPlaceholder="Search technologies…"
          options={[
            { value: "react", label: "React", color: "#61dafb" },
            { value: "vue", label: "Vue", color: "#42b883" },
            { value: "svelte", label: "Svelte", color: "#ff3e00" },
            { value: "angular", label: "Angular", color: "#dd0031" },
            { value: "solid", label: "Solid", color: "#2c4f7c" },
            { value: "ts", label: "TypeScript", color: "#3178c6" },
            { value: "tailwind", label: "Tailwind", color: "#38bdf8" },
          ]}
        />
      </div>
    );
  },
  "dropdown/grouped": ({ theme = "dark" }) => {
    return (
      <div className="flex h-[440px] w-full justify-center px-6 pt-10">
        <Dropdown
          theme={theme}
          selectionIndicator="radio"
          placeholder="Choose a plan"
          defaultValue="pro"
          options={[
            { value: "free", label: "Free", description: "$0 / month", group: "Personal" },
            { value: "plus", label: "Plus", description: "$8 / month", group: "Personal" },
            { value: "pro", label: "Pro", description: "$20 / month", group: "Teams" },
            { value: "enterprise", label: "Enterprise", description: "Contact us", group: "Teams" },
          ]}
        />
      </div>
    );
  }
};
