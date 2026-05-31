#!/usr/bin/env node
// One-shot codemod (ADR 0006): merge `registry/changelogs.json` into each
// `registry/components/<slug>.json` manifest, then delete the global file.
//
// Run once: `node scripts/migrate-changelogs-to-slug.mjs`
// Verify:    `pnpm build:registry` → empty diff on registry.json + apps/www/public/*

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const COMPONENTS_DIR = path.join(REPO_ROOT, "registry", "components");
const CHANGELOGS_FILE = path.join(REPO_ROOT, "registry", "changelogs.json");

/** @param {string} file */
function readJson(file) {
    return JSON.parse(fs.readFileSync(file, "utf8"));
}

function main() {
    if (!fs.existsSync(CHANGELOGS_FILE)) {
        console.error("Missing registry/changelogs.json — already migrated?");
        process.exit(1);
    }

    const changelogs = readJson(CHANGELOGS_FILE);
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

        if (!(slug in changelogs)) {
            console.error(`changelogs.json: missing entry for "${slug}"`);
            process.exit(1);
        }

        const { motion, ...rest } = manifest;
        const next = {
            ...rest,
            changelog: changelogs[slug],
            ...(motion ? { motion } : {}),
        };

        fs.writeFileSync(manifestPath, `${JSON.stringify(next, null, 2)}\n`);
        updated++;
    }

    const changelogSlugs = new Set(Object.keys(changelogs));
    for (const file of manifestFiles) {
        changelogSlugs.delete(file.replace(/\.json$/, ""));
    }
    if (changelogSlugs.size > 0) {
        console.error(
            `changelogs.json has stray entries: ${[...changelogSlugs].sort().join(", ")}`,
        );
        process.exit(1);
    }

    fs.unlinkSync(CHANGELOGS_FILE);
    console.log(`Migrated changelog into ${updated} manifest(s) under registry/components/.`);
    console.log("Deleted registry/changelogs.json — run `pnpm build:registry` to verify.");
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
    main();
}
