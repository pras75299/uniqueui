import type { RegistryChangelogEntry } from "../registry/types";

export type ChangelogsMap = Record<string, RegistryChangelogEntry[]>;

/**
 * Aggregate per-slug changelog arrays in manifest install order.
 * Key order is load-bearing — must match `registry/manifest.json` `order`
 * so `JSON.stringify` parity checks against `public/registry/changelogs.json` pass.
 */
export function changelogsFromManifestOrder(
  slugs: readonly string[],
  changelogBySlug: ReadonlyMap<string, RegistryChangelogEntry[]> | Record<string, RegistryChangelogEntry[]>,
): ChangelogsMap {
  const out: ChangelogsMap = {};
  for (const slug of slugs) {
    let entries: RegistryChangelogEntry[] | undefined;
    if (changelogBySlug instanceof Map) {
      entries = changelogBySlug.get(slug);
    } else {
      entries = (changelogBySlug as Record<string, RegistryChangelogEntry[]>)[slug];
    }
    if (!entries || entries.length === 0) {
      throw new Error(`changelogsFromManifestOrder: missing or empty changelog for "${slug}"`);
    }
    out[slug] = entries;
  }
  return out;
}

/** Convenience wrapper for build-registry's manifest map. */
export function changelogsFromManifests(
  manifests: ReadonlyMap<string, { changelog: RegistryChangelogEntry[] }>,
  slugs: readonly string[],
): ChangelogsMap {
  const bySlug: Record<string, RegistryChangelogEntry[]> = {};
  for (const [slug, manifest] of manifests) {
    bySlug[slug] = manifest.changelog;
  }
  return changelogsFromManifestOrder(slugs, bySlug);
}
