import { defineConfig } from "tsup";

// uniqueui-cli is published as a single bundled bin. `@uniqueui/cli-core` is
// workspace-only (private), so we must inline it; everything else in
// package.json#dependencies stays external and is installed via npm on the
// consumer's machine.
export default defineConfig({
    entry: ["src/index.ts"],
    outDir: "dist",
    format: ["cjs"],
    target: "node18",
    platform: "node",
    clean: true,
    sourcemap: true,
    splitting: false,
    bundle: true,
    dts: false,
    // Bundle every @uniqueui/* workspace package; treat the rest of node_modules
    // as external (defined in package.json#dependencies).
    noExternal: [/^@uniqueui\//],
    // Node subpath builtins esbuild can't auto-detect without the `node:`
    // prefix. cli-core imports `readline/promises`; add new subpaths here if
    // future commands reach for them (or migrate source to `node:` prefix).
    external: ["readline/promises"],
    banner: { js: "#!/usr/bin/env node" },
});
