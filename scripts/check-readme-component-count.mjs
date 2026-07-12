#!/usr/bin/env node
// Verify the component count advertised in the root README matches the number
// of registry manifests. Strict: fails on mismatch or if the pattern is gone.
//
// Why: the README is the first thing visitors read; it previously claimed
// "30 animated components" while the registry shipped 68 — underselling the
// library by half. This makes the count CI-fatal the same way CLI/README
// command drift is.
//
// What it checks
//   1. Count registry/components/*.json (the per-slug manifests — the
//      registry's source of truth, includes hero blocks).
//   2. Find the `**<N> animated components**` marker in README.md.
//   3. Fail when N differs from the manifest count, or the marker is missing.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const DEFAULT_README = path.join(REPO_ROOT, "README.md");
const DEFAULT_COMPONENTS_DIR = path.join(REPO_ROOT, "registry", "components");

const COUNT_MARKER = /\*\*(\d+) animated components\*\*/;

/**
 * Extract the advertised count from the README. Returns `null` when the
 * marker is absent — the caller treats that as drift too, so rewording the
 * bullet can't silently disable the check.
 */
export function parseReadmeComponentCount(md) {
    const m = COUNT_MARKER.exec(md);
    return m ? Number(m[1]) : null;
}

export function countRegistryManifests(componentsDir) {
    return fs.readdirSync(componentsDir).filter((f) => f.endsWith(".json")).length;
}

function main() {
    const readmePath = process.env.UNIQUEUI_ROOT_README ?? DEFAULT_README;
    const componentsDir = process.env.UNIQUEUI_COMPONENTS_DIR ?? DEFAULT_COMPONENTS_DIR;

    const actual = countRegistryManifests(componentsDir);
    const advertised = parseReadmeComponentCount(fs.readFileSync(readmePath, "utf8"));

    if (advertised === null) {
        console.error(
            `ERROR: README component-count marker not found in ${readmePath}.\n` +
                `  Expected a \`**<N> animated components**\` bullet; keep that exact phrase so this check can verify it.`,
        );
        process.exit(1);
    }

    if (advertised !== actual) {
        console.error(
            `README component count drift: README says ${advertised}, registry has ${actual} manifests.\n` +
                `  → Update the \`**${advertised} animated components**\` bullet in README.md to ${actual}.`,
        );
        process.exit(1);
    }

    console.log(`README component count OK — ${actual} components advertised and shipped.`);
}

function sameFile(a, b) {
    if (!a || !b) return false;
    const norm = (p) => path.resolve(p).toLowerCase();
    return norm(a) === norm(b);
}

if (sameFile(process.argv[1], __filename)) {
    main();
}
