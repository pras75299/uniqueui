#!/usr/bin/env node
// Validates generated registry artifacts against the shape the docs site
// and CLI rely on. Run after `pnpm build:registry`, before the drift gate.
//
// Artifacts validated:
//   - registry.json                              (root)
//   - apps/www/public/registry.json              (legacy monolithic copy)
//   - apps/www/public/registry/index.json        (split index)
//   - apps/www/public/registry/<slug>.json       (split per-slug)
//   - apps/www/public/r/registry.json            (shadcn manifest)
//   - apps/www/public/r/<slug>.json              (shadcn registry-item)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  Changelogs,
  ComponentManifest,
  MotionMap,
  RegistryArray,
  RegistryEntry,
  ShadcnItem,
  ShadcnManifest,
  SplitIndex,
  crossCheckChangelogs,
  crossCheckSlugs,
  validate,
} from "@uniqueui/registry-schema";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const failures = [];

function readJson(rel) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) {
    failures.push(`${rel}: file not found (run \`pnpm build:registry\` first)`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (err) {
    failures.push(`${rel}: invalid JSON — ${err.message}`);
    return null;
  }
}

function check(rel, schema, data) {
  if (data == null) return null;
  const result = validate(schema, data);
  if (!result.ok) {
    const shown = result.errors.slice(0, 5).map((m) => `    at ${m}`);
    const more = result.errors.length > 5 ? `\n    …and ${result.errors.length - 5} more issue(s)` : "";
    failures.push(`${rel}: schema validation failed\n${shown.join("\n")}${more}`);
    return null;
  }
  return result.data;
}

const rootRegistry = check("registry.json", RegistryArray, readJson("registry.json"));

const publicMono = check(
  "apps/www/public/registry.json",
  RegistryArray,
  readJson("apps/www/public/registry.json"),
);

const splitIndex = check(
  "apps/www/public/registry/index.json",
  SplitIndex,
  readJson("apps/www/public/registry/index.json"),
);

if (splitIndex) {
  for (const slug of splitIndex.components) {
    check(
      `apps/www/public/registry/${slug}.json`,
      RegistryEntry,
      readJson(`apps/www/public/registry/${slug}.json`),
    );
  }
}

const shadcnManifest = check(
  "apps/www/public/r/registry.json",
  ShadcnManifest,
  readJson("apps/www/public/r/registry.json"),
);

if (shadcnManifest) {
  for (const item of shadcnManifest.items) {
    check(`apps/www/public/r/${item.name}.json`, ShadcnItem, readJson(`apps/www/public/r/${item.name}.json`));
  }
}

const mismatches = crossCheckSlugs({
  root: rootRegistry,
  splitIndex,
  publicMono,
  shadcnManifest,
});
for (const m of mismatches) failures.push(`cross-check: ${m}`);

const sourceChangelogs = (() => {
  const componentsDir = path.join(ROOT, "registry", "components");
  const manifest = readJson("registry/manifest.json");
  if (!fs.existsSync(componentsDir) || !manifest?.order) return null;
  const map = {};
  for (const slug of manifest.order) {
    const rel = `registry/components/${slug}.json`;
    const raw = readJson(rel);
    if (!raw) continue;
    const parsed = check(rel, ComponentManifest, raw);
    if (parsed) map[parsed.slug] = parsed.changelog;
  }
  return check("registry/components (changelog fields)", Changelogs, map);
})();
const publicChangelogs = check(
  "apps/www/public/registry/changelogs.json",
  Changelogs,
  readJson("apps/www/public/registry/changelogs.json"),
);

// Cross-check both maps independently — a single fallback would let one of
// them silently disagree with the registry while still passing schema.
for (const [label, changelogs] of [
  ["source", sourceChangelogs],
  ["public", publicChangelogs],
]) {
  if (!changelogs) continue;
  const mismatches = crossCheckChangelogs({ root: rootRegistry, changelogs });
  for (const m of mismatches) failures.push(`cross-check (${label}): ${m}`);
}

// Per-slug source manifests (ADR 0003 + ADR 0006): metadata and changelog on each manifest.
const componentsDir = path.join(ROOT, "registry", "components");
const registryManifest = readJson("registry/manifest.json");
const motionFromManifests = {};
if (fs.existsSync(componentsDir)) {
  const onDiskSlugs = fs
    .readdirSync(componentsDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""))
    .sort();
  if (registryManifest?.order) {
    const orderSet = new Set(registryManifest.order);
    for (const slug of onDiskSlugs) {
      if (!orderSet.has(slug)) {
        failures.push(
          `cross-check: registry/components/${slug}.json exists but slug is missing from registry/manifest.json order`,
        );
      }
    }
  }
  for (const file of fs.readdirSync(componentsDir)) {
    if (!file.endsWith(".json")) continue;
    const rel = `registry/components/${file}`;
    const raw = readJson(rel);
    const parsed = check(rel, ComponentManifest, raw);
    if (parsed?.motion) {
      motionFromManifests[parsed.slug] = parsed.motion;
    }
  }
}
const sourceMotion = check(
  "registry/components (motion fields)",
  MotionMap,
  Object.keys(motionFromManifests).length > 0 ? motionFromManifests : null,
);
if (sourceMotion && rootRegistry) {
  const rootSlugs = new Set(rootRegistry.map((e) => e.name));
  for (const slug of Object.keys(sourceMotion)) {
    if (!rootSlugs.has(slug)) {
      failures.push(`cross-check: manifest motion field has stray "${slug}" (not in registry)`);
    }
  }
}

// relatedSlugs and usedByBlocks are computed at build time from manifest tags
// (scripts/compute-cross-links.ts) — no hand-maintained sidecars.

// Direct parity: source is the authored truth, public is the published copy.
// Drift between them means the build script didn't run or the public file
// was hand-edited — both bug-risk states.
if (sourceChangelogs && publicChangelogs) {
  const a = JSON.stringify(sourceChangelogs);
  const b = JSON.stringify(publicChangelogs);
  if (a !== b) {
    failures.push(
      "cross-check: manifest changelog aggregate and apps/www/public/registry/changelogs.json diverge — run `pnpm build:registry`",
    );
  }
}

if (failures.length > 0) {
  console.error("Registry validation failed:\n");
  for (const f of failures) console.error(`  ✗ ${f}`);
  console.error("\nRun `pnpm build:registry` to regenerate; if the failure persists, fix the source in `registry/`.");
  process.exit(1);
}

console.log(
  `Registry validation OK — ${rootRegistry?.length ?? 0} entries in registry.json, ${shadcnManifest?.items.length ?? 0} shadcn items.`,
);
