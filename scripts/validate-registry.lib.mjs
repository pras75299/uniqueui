// Schemas and validator used by `scripts/validate-registry.mjs`.
// Split out so the schemas can be exercised by unit tests without spawning
// the CLI runner.

import { z } from "zod";

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;
const NPM_DEP_RE = /^(?:@[a-z0-9-][a-z0-9._~-]*\/)?[a-z0-9][a-z0-9._~-]*$/i;

export const Slug = z.string().regex(SLUG_RE, "slug must be kebab-case (a-z0-9-)");
export const NpmDep = z.string().regex(NPM_DEP_RE, "invalid npm dependency name");

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

export const RegistryEntry = z.object({
  name: Slug,
  dependencies: z.array(NpmDep),
  files: z.array(RegistryFile).min(1),
  tailwindConfig: TailwindConfig.optional(),
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
