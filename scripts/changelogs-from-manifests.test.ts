import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { changelogsFromManifestOrder } from "./changelogs-from-manifests";

const REPO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const COMPONENTS_DIR = path.join(REPO_ROOT, "registry", "components");
const PUBLIC_CHANGELOGS = path.join(REPO_ROOT, "apps/www/public/registry/changelogs.json");

function loadManifestChangelogsBySlug(): Record<string, { version: string; date: string; changes: string[] }[]> {
  const bySlug: Record<string, { version: string; date: string; changes: string[] }[]> = {};
  for (const file of fs.readdirSync(COMPONENTS_DIR)) {
    if (!file.endsWith(".json")) continue;
    const slug = file.replace(/\.json$/, "");
    const manifest = JSON.parse(fs.readFileSync(path.join(COMPONENTS_DIR, file), "utf8"));
    bySlug[slug] = manifest.changelog;
  }
  return bySlug;
}

describe("changelogsFromManifestOrder", () => {
  it("throws when a slug in order has no changelog", () => {
    expect(() =>
      changelogsFromManifestOrder(["a"], { a: [{ version: "1.0.0", date: "2026-01-01", changes: ["x"] }] }),
    ).not.toThrow();
    expect(() => changelogsFromManifestOrder(["missing"], {})).toThrow(/missing or empty changelog/);
  });

  it("preserves manifest.order key sequence (not filesystem sort order)", () => {
    const aggregated = changelogsFromManifestOrder(
      ["z-slug", "a-slug"],
      {
        "z-slug": [{ version: "1.0.0", date: "2026-01-01", changes: ["z"] }],
        "a-slug": [{ version: "1.0.0", date: "2026-01-01", changes: ["a"] }],
      },
    );
    expect(Object.keys(aggregated)).toEqual(["z-slug", "a-slug"]);
  });

  it("matches the published changelogs aggregate after build:registry", () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(REPO_ROOT, "registry/manifest.json"), "utf8"),
    ) as { order: string[] };
    const bySlug = loadManifestChangelogsBySlug();
    const aggregated = changelogsFromManifestOrder(manifest.order, bySlug);
    const published = JSON.parse(fs.readFileSync(PUBLIC_CHANGELOGS, "utf8"));
    expect(JSON.stringify(aggregated)).toBe(JSON.stringify(published));
  });
});
