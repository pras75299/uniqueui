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
    // Node subpath builtins (e.g. readline/promises, fs/promises) must use the
    // `node:` prefix in cli-core source so esbuild recognizes them as builtins
    // without a hand-maintained external allowlist.
    banner: { js: "#!/usr/bin/env node" },
});
