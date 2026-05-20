// Schemas and validator used by `scripts/validate-registry.mjs`.
// Split out so the schemas can be exercised by unit tests without spawning
// the CLI runner.

import { z } from "zod";

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;
const NPM_DEP_RE = /^(?:@[a-z0-9-][a-z0-9._~-]*\/)?[a-z0-9][a-z0-9._~-]*$/i;
// Loose semver: MAJOR.MINOR.PATCH. Component versions don't carry prerelease
// or build metadata today; tighten if/when they do.
const SEMVER_RE = /^\d+\.\d+\.\d+$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const Slug = z.string().regex(SLUG_RE, "slug must be kebab-case (a-z0-9-)");
export const NpmDep = z.string().regex(NPM_DEP_RE, "invalid npm dependency name");
export const SemverVersion = z.string().regex(SEMVER_RE, "version must be MAJOR.MINOR.PATCH");
export const IsoDate = z.string().regex(ISO_DATE_RE, "date must be YYYY-MM-DD");

export const RegistryFileType = z.enum([
  "registry:ui",
  "registry:util",
  "registry:hook",
  "registry:lib",
]);

export const RegistryFile = z.object({
  path: z.string().min(1),
  content: z.string(),
  type: RegistryFileType,
});

export const TailwindConfig = z
  .object({
    theme: z
      .object({
        extend: z.record(z.unknown()).optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export const ChangelogEntry = z.object({
  version: SemverVersion,
  date: IsoDate,
  changes: z
    .array(
      z
        .string()
        .refine((s) => s.trim().length > 0, "change entry must not be blank"),
    )
    .min(1),
});

/**
 * Compare two MAJOR.MINOR.PATCH strings. Returns >0 if `a > b`, <0 if `a < b`,
 * 0 if equal. Assumes both strings already match SEMVER_RE.
 */
export function compareSemver(a, b) {
  const [aMaj, aMin, aPat] = a.split(".").map(Number);
  const [bMaj, bMin, bPat] = b.split(".").map(Number);
  if (aMaj !== bMaj) return aMaj - bMaj;
  if (aMin !== bMin) return aMin - bMin;
  return aPat - bPat;
}

// Newest-first ordering is load-bearing: the build script reads `entries[0]`
// as the current `meta.version`. Out-of-order entries would silently demote.
const changelogArray = z
  .array(ChangelogEntry)
  .min(1)
  .refine(
    (entries) => {
      for (let i = 1; i < entries.length; i++) {
        if (compareSemver(entries[i - 1].version, entries[i].version) <= 0) {
          return false;
        }
      }
      return true;
    },
    {
      message:
        "changelog entries must be strictly newest-first (descending semver, no duplicates)",
    },
  );

export const Changelogs = z.record(Slug, changelogArray);

export const RegistryMeta = z.object({
  version: SemverVersion,
});

export const RegistryEntry = z.object({
  name: Slug,
  dependencies: z.array(NpmDep),
  files: z.array(RegistryFile).min(1),
  tailwindConfig: TailwindConfig.optional(),
  tailwindCss: z.string().min(1).optional(),
  meta: RegistryMeta,
  changelog: changelogArray,
});

export const RegistryArray = z.array(RegistryEntry).min(1);

export const SplitIndex = z.object({
  components: z.array(Slug).min(1),
});

export const ShadcnFile = z.object({
  path: z.string().min(1),
  type: z.enum([
    "registry:component",
    "registry:ui",
    "registry:util",
    "registry:hook",
    "registry:lib",
  ]),
  target: z.string().min(1),
  content: z.string().optional(),
});

export const ShadcnItem = z.object({
  $schema: z.string().optional(),
  name: Slug,
  type: z.literal("registry:ui"),
  title: z.string().optional(),
  description: z.string().optional(),
  dependencies: z.array(NpmDep),
  files: z.array(ShadcnFile).min(1),
  tailwind: z.object({ config: TailwindConfig }).optional(),
});

export const ShadcnManifest = z.object({
  $schema: z.string(),
  name: z.string().min(1),
  homepage: z.string().url(),
  items: z.array(ShadcnItem.omit({ $schema: true })).min(1),
});

/**
 * Validate a parsed JSON value against a Zod schema. Returns
 * `{ ok: true, data }` or `{ ok: false, errors: string[] }`.
 */
export function validate(schema, data) {
  const result = schema.safeParse(data);
  if (result.success) return { ok: true, data: result.data };
  const errors = result.error.issues.map((i) => {
    const where = i.path.length ? i.path.join(".") : "(root)";
    return `${where}: ${i.message}`;
  });
  return { ok: false, errors };
}

/**
 * Cross-check that the split index, monolithic copy, and shadcn manifest
 * cover the same slug set as the root registry. Returns an array of
 * human-readable mismatch strings (empty on success).
 */
export function crossCheckSlugs({ root, splitIndex, publicMono, shadcnManifest }) {
  const mismatches = [];
  if (root && splitIndex) {
    const rootSlugs = new Set(root.map((e) => e.name));
    const indexSlugs = new Set(splitIndex.components);
    for (const slug of rootSlugs) {
      if (!indexSlugs.has(slug)) mismatches.push(`split index missing "${slug}"`);
    }
    for (const slug of indexSlugs) {
      if (!rootSlugs.has(slug)) mismatches.push(`split index has stray "${slug}"`);
    }
  }
  if (root && publicMono) {
    const a = root.map((e) => e.name).sort();
    const b = publicMono.map((e) => e.name).sort();
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      mismatches.push(`public/registry.json slug set diverges from registry.json (${b.length} vs ${a.length})`);
    }
  }
  if (root && shadcnManifest) {
    const rootSlugs = new Set(root.map((e) => e.name));
    const shadcnSlugs = new Set(shadcnManifest.items.map((i) => i.name));
    for (const slug of rootSlugs) {
      if (!shadcnSlugs.has(slug)) mismatches.push(`shadcn manifest missing "${slug}"`);
    }
  }
  return mismatches;
}

/**
 * Cross-check that every registry entry's `meta.version` matches the
 * first (newest) entry in the published changelogs map, and that the
 * changelogs map has exactly one entry per registry slug. Returns an
 * array of human-readable mismatch strings (empty on success).
 */
export function crossCheckChangelogs({ root, changelogs }) {
  const mismatches = [];
  if (!root || !changelogs) return mismatches;

  const rootSlugs = new Set(root.map((e) => e.name));
  const changelogSlugs = new Set(Object.keys(changelogs));

  for (const slug of rootSlugs) {
    if (!changelogSlugs.has(slug)) {
      mismatches.push(`changelogs missing "${slug}"`);
      continue;
    }
    const entries = changelogs[slug];
    if (!Array.isArray(entries) || entries.length === 0) {
      mismatches.push(`changelogs for "${slug}" is empty`);
      continue;
    }
    const latest = entries[0];
    const entry = root.find((e) => e.name === slug);
    if (entry && entry.meta && entry.meta.version !== latest.version) {
      mismatches.push(
        `meta.version mismatch for "${slug}": registry=${entry.meta.version}, changelog head=${latest.version}`,
      );
    }
  }
  for (const slug of changelogSlugs) {
    if (!rootSlugs.has(slug)) {
      mismatches.push(`changelogs has stray "${slug}" (not in registry)`);
    }
  }
  return mismatches;
}
