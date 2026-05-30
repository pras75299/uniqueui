#!/usr/bin/env node
// One-shot codemod (ADR 0003): merge the five global metadata sidecars into
// each `registry/components/<slug>.json` manifest, then delete the sidecars.
//
// Run once: `node scripts/migrate-sidecars-to-slug.mjs`
// Verify:    `pnpm build:registry` → empty diff on registry.json + apps/www/public/*

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const COMPONENTS_DIR = path.join(REPO_ROOT, "registry", "components");

const SIDECAR_FILES = {
    tags: path.join(REPO_ROOT, "registry", "tags.json"),
    peerDependencies: path.join(REPO_ROOT, "registry", "peer-dependencies.json"),
    compatibility: path.join(REPO_ROOT, "registry", "compatibility.json"),
    accessibility: path.join(REPO_ROOT, "registry", "accessibility.json"),
    motion: path.join(REPO_ROOT, "registry", "motion.json"),
};

/** @param {string} file */
function readJson(file) {
    return JSON.parse(fs.readFileSync(file, "utf8"));
}

function main() {
    for (const file of Object.values(SIDECAR_FILES)) {
        if (!fs.existsSync(file)) {
            console.error(`Missing sidecar file: ${path.relative(REPO_ROOT, file)}`);
            process.exit(1);
        }
    }

    const tags = readJson(SIDECAR_FILES.tags);
    const peerDependencies = readJson(SIDECAR_FILES.peerDependencies);
    const compatibility = readJson(SIDECAR_FILES.compatibility);
    const accessibility = readJson(SIDECAR_FILES.accessibility);
    const motion = readJson(SIDECAR_FILES.motion);

    const manifestFiles = fs
        .readdirSync(COMPONENTS_DIR)
        .filter((f) => f.endsWith(".json"))
        .sort();

    let updated = 0;

    for (const file of manifestFiles) {
        const slug = file.replace(/\.json$/, "");
        const manifestPath = path.join(COMPONENTS_DIR, file);
        const manifest = readJson(manifestPath);

        if (manifest.slug !== slug) {
            console.error(`${file}: slug field "${manifest.slug}" does not match filename`);
            process.exit(1);
        }

        const missing = [];
        if (!(slug in tags)) missing.push("tags");
        if (!(slug in peerDependencies)) missing.push("peerDependencies");
        if (!(slug in compatibility)) missing.push("compatibility");
        if (!(slug in accessibility)) missing.push("accessibility");
        if (missing.length > 0) {
            console.error(`${file}: sidecar missing entries for ${missing.join(", ")}`);
            process.exit(1);
        }

        manifest.tags = tags[slug];
        manifest.peerDependencies = peerDependencies[slug];
        manifest.compatibility = compatibility[slug];
        manifest.accessibility = accessibility[slug];
        if (slug in motion) {
            manifest.motion = motion[slug];
        } else {
            delete manifest.motion;
        }

        fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
        updated++;
    }

    console.log(`Migrated metadata into ${updated} manifest(s) under registry/components/.`);
    console.log("Next: delete the five sidecar files and run `pnpm build:registry`.");
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
    main();
}
