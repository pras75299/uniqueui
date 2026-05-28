// Shared registry source types. The registry source of truth is now the set
// of per-slug manifests under `registry/components/<slug>.json`, aggregated by
// `scripts/build-registry.ts` (ordering + demos config in `registry/manifest.json`).

export type RegistryComponent = {
    name: string;
    dependencies: string[];
    files: Array<{ path: string; type: string; content?: string }>;
    // Tailwind v3 path: merged into the user's tailwind.config.* by the CLI.
    tailwindConfig?: Record<string, any>;
    // Tailwind v4 path: appended (wrapped in uniqueui markers) to the user's
    // globals.css by the CLI. Should be self-contained CSS — typically a
    // single @theme block with --animate-* tokens and embedded @keyframes.
    tailwindCss?: string;
};

export type Registry = RegistryComponent[];

// Shape of a single changelog entry as emitted into built artifacts.
// Source of truth lives in `registry/changelogs.json`; the build script
// injects `meta.version` and `changelog` onto every entry from there so
// component versions can be bumped without touching the manifests.
export type RegistryChangelogEntry = {
    version: string;
    date: string;
    changes: string[];
};
