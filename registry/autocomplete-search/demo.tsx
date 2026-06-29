// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "autocomplete-search/basic": ({ theme = "dark" }) => {
    const frameworks: AutocompleteOption[] = [
      { value: "next", label: "Next.js" },
      { value: "remix", label: "Remix" },
      { value: "astro", label: "Astro" },
      { value: "svelte", label: "SvelteKit" },
      { value: "nuxt", label: "Nuxt" },
      { value: "solid", label: "SolidStart" },
      { value: "vite", label: "Vite" },
      { value: "gatsby", label: "Gatsby" },
    ];
    return (
      <div className="flex h-[440px] w-full justify-center px-6 pt-10">
        <AutocompleteSearch
          theme={theme}
          options={frameworks}
          placeholder="Search frameworks…"
        />
      </div>
    );
  },
  "autocomplete-search/grouped": ({ theme = "dark" }) => {
    const commands: AutocompleteOption[] = [
      { value: "new-file", label: "New File", group: "Actions" },
      { value: "new-folder", label: "New Folder", group: "Actions" },
      { value: "save-all", label: "Save All", group: "Actions" },
      { value: "profile", label: "Profile", group: "Account" },
      { value: "billing", label: "Billing", group: "Account" },
      { value: "logout", label: "Log out", group: "Account" },
      { value: "docs", label: "Documentation", group: "Help" },
      { value: "shortcuts", label: "Keyboard Shortcuts", group: "Help" },
    ];
    return (
      <div className="flex h-[440px] w-full justify-center px-6 pt-10">
        <AutocompleteSearch
          theme={theme}
          options={commands}
          placeholder="Type a command…"
        />
      </div>
    );
  },
  "autocomplete-search/async": ({ theme = "dark" }) => {
    const countries: AutocompleteOption[] = [
      { value: "us", label: "United States", description: "North America" },
      { value: "ca", label: "Canada", description: "North America" },
      { value: "mx", label: "Mexico", description: "North America" },
      { value: "br", label: "Brazil", description: "South America" },
      { value: "ar", label: "Argentina", description: "South America" },
      { value: "gb", label: "United Kingdom", description: "Europe" },
      { value: "de", label: "Germany", description: "Europe" },
      { value: "fr", label: "France", description: "Europe" },
      { value: "jp", label: "Japan", description: "Asia" },
      { value: "in", label: "India", description: "Asia" },
      { value: "au", label: "Australia", description: "Oceania" },
    ];
    const search = (q: string) =>
      new Promise<AutocompleteOption[]>((resolve) => {
        const needle = q.toLowerCase();
        setTimeout(() => {
          resolve(
            countries.filter((c) => c.label.toLowerCase().includes(needle)),
          );
        }, 600);
      });
    return (
      <div className="flex h-[440px] w-full justify-center px-6 pt-10">
        <AutocompleteSearch
          theme={theme}
          onSearch={search}
          minChars={1}
          placeholder="Search countries…"
          hintMessage="Type to search countries"
          loadingMessage="Searching countries…"
        />
      </div>
    );
  }
};
