// Zod schemas + cross-checks for the UniqueUI registry contract.
//
// Single source of truth for the shape of every artifact under
// `registry.json`, `apps/www/public/registry/*`, and
// `apps/www/public/r/*`. Consumed by:
//   - scripts/build-registry.ts  (emits artifacts)
//   - scripts/validate-registry.mjs  (CI gate)
//   - packages/cli  (parses registry responses + drives `update`/`diff`)
//   - third-party registries  (validate their own bundles before publish)
//
// When you change a schema here, run `pnpm build:registry` and
// `pnpm registry:validate` locally — both will surface drift before CI does.

import path from "path";
import { z } from "zod";

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;
// npm package names must be all lowercase (see npm naming rules); no `/i`.
const NPM_DEP_RE = /^(?:@[a-z0-9-][a-z0-9._~-]*\/)?[a-z0-9][a-z0-9._~-]*$/;
// Loose semver: MAJOR.MINOR.PATCH. Component versions don't carry prerelease
// or build metadata today; tighten if/when they do.
const SEMVER_RE = /^\d+\.\d+\.\d+$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const Slug = z
    .string()
    .regex(SLUG_RE, "slug must be kebab-case (a-z0-9-)");
export const NpmDep = z
    .string()
    .regex(NPM_DEP_RE, "invalid npm dependency name");
export const SemverVersion = z
    .string()
    .regex(SEMVER_RE, "version must be MAJOR.MINOR.PATCH");

// Shape-check first, then refine for calendar reality: a regex-pass like
// "2026-13-40" should still fail (month 13 / day 40 don't exist). Round-trip
// the parts through Date.UTC and compare to catch invalid month/day combos
// including leap-year February.
export const IsoDate = z
    .string()
    .regex(ISO_DATE_RE, "date must be YYYY-MM-DD")
    .refine((s) => {
        const [y, m, d] = s.split("-").map(Number);
        const date = new Date(Date.UTC(y, m - 1, d));
        return (
            date.getUTCFullYear() === y &&
            date.getUTCMonth() === m - 1 &&
            date.getUTCDate() === d
        );
    }, "date must be a real calendar date (YYYY-MM-DD)");

export const RegistryFileType = z.enum([
    "registry:ui",
    "registry:util",
    "registry:hook",
    "registry:lib",
]);

// SHA-384 integrity hash (same format as Subresource Integrity).
// Format: "sha384-<base64url>". Computed from the UTF-8 content of each file
// and verified by the CLI before writing to the user's project.
const SHA384_RE = /^sha384-[A-Za-z0-9+/]+=*$/;
export const IntegrityHash = z.string().regex(SHA384_RE, "integrity must be sha384-<base64>");

// Out-of-tree asset (font file, image, etc.) bundled alongside a component.
// No existing component uses this — the field exists so third-party registries
// can declare assets without a schema bump.
export const RegistryAsset = z.object({
    path: z.string().min(1),
    type: z.string().min(1),
    url: z.string().url().optional(),
}).strict();

// Cross-links between components that share concepts or are commonly used together.
// Sparse — not every component needs related slugs. Computed at build time from
// shared tag overlap (see scripts/compute-cross-links.ts).
export const RelatedSlugsMap = z.record(Slug, z.array(Slug).min(1));

// Inverse relationship: which hero-block slugs visually incorporate or were
// inspired by a given component. Computed at build time from manifest tag overlap.
export const UsedByBlocksMap = z.record(Slug, z.array(Slug).min(1));

export const RegistryFile = z.object({
    path: z.string().min(1),
    content: z.string(),
    type: RegistryFileType,
    integrity: IntegrityHash.optional(),
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
export function compareSemver(a: string, b: string): number {
    const [aMaj, aMin, aPat] = a.split(".").map(Number);
    const [bMaj, bMin, bPat] = b.split(".").map(Number);
    if (aMaj !== bMaj) return aMaj - bMaj;
    if (aMin !== bMin) return aMin - bMin;
    return aPat - bPat;
}

/**
 * Resolve `relativePath` under `rootDir` and reject path traversal (`..`,
 * absolute segments). Used by `build-registry.ts` when reading component
 * sources so a malicious or buggy registry entry can't escape the registry
 * root.
 */
export function resolvePathUnderDir(
    rootDir: string,
    relativePath: string,
): string {
    if (typeof relativePath !== "string" || relativePath.length === 0) {
        throw new Error("Registry file path must be a non-empty string");
    }
    if (path.isAbsolute(relativePath)) {
        throw new Error(`Registry file path must be relative: ${relativePath}`);
    }
    const normalized = path.normalize(relativePath);
    if (
        normalized === ".." ||
        normalized.startsWith(`..${path.sep}`) ||
        path.isAbsolute(normalized)
    ) {
        throw new Error(
            `Registry file path escapes registry root: ${relativePath}`,
        );
    }
    const rootResolved = path.resolve(rootDir);
    const resolved = path.resolve(rootResolved, normalized);
    if (
        resolved !== rootResolved &&
        !resolved.startsWith(`${rootResolved}${path.sep}`)
    ) {
        throw new Error(
            `Registry file path escapes registry root: ${relativePath}`,
        );
    }
    return resolved;
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

// Reduced-motion stance for a component. Read by the
// `scripts/check-reduced-motion.mjs` gate and surfaced to the docs UI so
// users can filter out components that ignore `prefers-reduced-motion`.
//
//   "full"    — component honors the OS pref (e.g. via `useReducedMotion`
//               or a `prefers-reduced-motion` CSS query). Static fallback
//               is provided where animation would otherwise be continuous.
//   "partial" — some animations are guarded, some are not. Acceptable
//               on rich/ambient blocks where a full static fallback would
//               degrade meaning; the gaps should be documented in
//               `performanceNotes`.
//   "none"    — explicit opt-out. The component ignores the OS pref.
//               Use sparingly and document why in `performanceNotes`;
//               this is the technical-debt bucket the gate surfaces.
export const MotionMeta = z.object({
    reducedMotion: z.enum(["full", "partial", "none"]),
    performanceNotes: z.string().min(1).optional(),
});

// Slug-keyed map of motion stances. Source of truth is the optional `motion`
// field on each `registry/components/<slug>.json` manifest (ADR 0003).
// Components with no motion APIs in source omit the field.
export const MotionMap = z.record(Slug, MotionMeta);

// Free-form taxonomy strings (e.g. "card", "hero", "background", "text").
// Lowercased + hyphenated to keep search/filter logic simple and case-insensitive.
const TAG_RE = /^[a-z0-9][a-z0-9-]*$/;
export const Tag = z.string().regex(TAG_RE, "tag must be lowercase kebab-case (a-z0-9-)");
export const Tags = z.array(Tag).min(1);
export const TagsMap = z.record(Slug, Tags);

// Compatibility envelope. Each axis is an opaque short string ("18+",
// "14+", "3+|4+", true/false) — keeping it free-form rather than enum
// avoids the schema becoming a Next.js release calendar. Validation is
// "must be a non-empty string when set"; the docs surface decides how
// to render it.
export const CompatibilityMeta = z.object({
    react: z.string().min(1).optional(),
    next: z.string().min(1).optional(),
    tailwind: z.string().min(1).optional(),
    // `rsc` and `ssr` are true/false: does the component work in a React
    // Server Component / Server-Side rendered context? Most animated
    // components are `"use client"` so default-false applies.
    rsc: z.boolean().optional(),
    ssr: z.boolean().optional(),
}).strict();
export const CompatibilityMap = z.record(Slug, CompatibilityMeta);

// Accessibility audit metadata.
//   status — "audited" means we have an actual a11y review on file;
//            "unaudited" is the honest default for the bulk of the
//            registry; "n/a" is for purely-decorative components where
//            no a11y surface exists (e.g. a background field).
export const AccessibilityMeta = z.object({
    status: z.enum(["audited", "unaudited", "n/a"]),
    keyboard: z.boolean().optional(),
    screenReaderNotes: z.string().min(1).optional(),
}).strict();
export const AccessibilityMap = z.record(Slug, AccessibilityMeta);

// Peer dependency list. Split from the existing `dependencies` array so the
// CLI can warn when a user's project is missing the right React/Next/
// Tailwind versions without trying to install them automatically.
export const PeerDependenciesMap = z.record(Slug, z.array(NpmDep));

// CSS custom property exported by a component (`--animate-foo`, `--ui-bar`).
// `defaultValue` is the value as it appears in the source `@theme` block
// or `:root`; consumers like `uniqueui theme` can override these without
// editing the component file.
export const CssVariable = z.object({
    name: z.string().regex(/^--[a-z0-9][a-z0-9-]*$/, "CSS variable name must start with -- and be kebab-case"),
    defaultValue: z.string().min(1),
    description: z.string().min(1).optional(),
}).strict();
export const CssVariablesMap = z.record(Slug, z.array(CssVariable).min(1));

// Per-slug source manifest at `registry/components/<slug>.json` (ADR 0002/0003).
// Metadata fields (`tags`, `compatibility`, etc.) live on the manifest after
// ADR 0003; they were formerly split across global sidecar JSON files.
export const ComponentManifestRegistry = z.object({
    dependencies: z.array(NpmDep),
    files: z
        .array(
            z.object({
                path: z.string().min(1),
                type: RegistryFileType,
            }),
        )
        .min(1),
    tailwindConfig: TailwindConfig.optional(),
    tailwindCss: z.string().min(1).optional(),
});

export const ComponentManifest = z.object({
    slug: Slug,
    registry: ComponentManifestRegistry,
    docs: z
        .object({
            name: z.string().min(1),
            description: z.string().min(1),
            icon: z.string().min(1),
        })
        .passthrough(),
    tags: Tags,
    peerDependencies: z.array(NpmDep).min(1),
    compatibility: CompatibilityMeta,
    accessibility: AccessibilityMeta,
    motion: MotionMeta.optional(),
});

export const RegistryEntry = z.object({
    name: Slug,
    dependencies: z.array(NpmDep),
    peerDependencies: z.array(NpmDep).min(1).optional(),
    files: z.array(RegistryFile).min(1),
    tailwindConfig: TailwindConfig.optional(),
    tailwindCss: z.string().min(1).optional(),
    cssVariables: z.array(CssVariable).min(1).optional(),
    tags: Tags.optional(),
    motion: MotionMeta.optional(),
    compatibility: CompatibilityMeta.optional(),
    accessibility: AccessibilityMeta.optional(),
    relatedSlugs: z.array(Slug).min(1).optional(),
    usedByBlocks: z.array(Slug).min(1).optional(),
    assets: z.array(RegistryAsset).min(1).optional(),
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

// Inferred TypeScript types. Exporting these is the headline reason this
// package exists: every consumer (CLI commands, build script, third-party
// tooling) gets the same types without re-deriving them.
export type RegistryFileTypeT = z.infer<typeof RegistryFileType>;
export type RegistryFileT = z.infer<typeof RegistryFile>;
export type TailwindConfigT = z.infer<typeof TailwindConfig>;
export type ChangelogEntryT = z.infer<typeof ChangelogEntry>;
export type ChangelogsT = z.infer<typeof Changelogs>;
export type RegistryMetaT = z.infer<typeof RegistryMeta>;
export type MotionMetaT = z.infer<typeof MotionMeta>;
export type MotionMapT = z.infer<typeof MotionMap>;
export type TagT = z.infer<typeof Tag>;
export type TagsT = z.infer<typeof Tags>;
export type TagsMapT = z.infer<typeof TagsMap>;
export type CompatibilityMetaT = z.infer<typeof CompatibilityMeta>;
export type CompatibilityMapT = z.infer<typeof CompatibilityMap>;
export type AccessibilityMetaT = z.infer<typeof AccessibilityMeta>;
export type AccessibilityMapT = z.infer<typeof AccessibilityMap>;
export type PeerDependenciesMapT = z.infer<typeof PeerDependenciesMap>;
export type CssVariableT = z.infer<typeof CssVariable>;
export type CssVariablesMapT = z.infer<typeof CssVariablesMap>;
export type ComponentManifestRegistryT = z.infer<typeof ComponentManifestRegistry>;
export type ComponentManifestT = z.infer<typeof ComponentManifest>;
export type IntegrityHashT = z.infer<typeof IntegrityHash>;
export type RegistryAssetT = z.infer<typeof RegistryAsset>;
export type RelatedSlugsMapT = z.infer<typeof RelatedSlugsMap>;
export type UsedByBlocksMapT = z.infer<typeof UsedByBlocksMap>;
export type RegistryEntryT = z.infer<typeof RegistryEntry>;
export type RegistryArrayT = z.infer<typeof RegistryArray>;
export type SplitIndexT = z.infer<typeof SplitIndex>;
export type ShadcnFileT = z.infer<typeof ShadcnFile>;
export type ShadcnItemT = z.infer<typeof ShadcnItem>;
export type ShadcnManifestT = z.infer<typeof ShadcnManifest>;

export type ValidateResult<T> =
    | { ok: true; data: T }
    | { ok: false; errors: string[] };

/**
 * Validate a parsed JSON value against a Zod schema. Returns
 * `{ ok: true, data }` or `{ ok: false, errors: string[] }`.
 */
export function validate<T extends z.ZodTypeAny>(
    schema: T,
    data: unknown,
): ValidateResult<z.infer<T>> {
    const result = schema.safeParse(data);
    if (result.success) return { ok: true, data: result.data };
    const errors = result.error.issues.map((i) => {
        const where = i.path.length ? i.path.join(".") : "(root)";
        return `${where}: ${i.message}`;
    });
    return { ok: false, errors };
}

export interface CrossCheckSlugsInput {
    root?: Array<{ name: string }> | null;
    splitIndex?: { components: string[] } | null;
    publicMono?: Array<{ name: string }> | null;
    shadcnManifest?: { items: Array<{ name: string }> } | null;
}

/**
 * Cross-check that the split index, monolithic copy, and shadcn manifest
 * cover the same slug set as the root registry. Returns an array of
 * human-readable mismatch strings (empty on success).
 */
export function crossCheckSlugs({
    root,
    splitIndex,
    publicMono,
    shadcnManifest,
}: CrossCheckSlugsInput): string[] {
    const mismatches: string[] = [];
    if (root && splitIndex) {
        const rootSlugs = new Set(root.map((e) => e.name));
        const indexSlugs = new Set(splitIndex.components);
        for (const slug of rootSlugs) {
            if (!indexSlugs.has(slug))
                mismatches.push(`split index missing "${slug}"`);
        }
        for (const slug of indexSlugs) {
            if (!rootSlugs.has(slug))
                mismatches.push(`split index has stray "${slug}"`);
        }
    }
    if (root && publicMono) {
        const a = root.map((e) => e.name).sort();
        const b = publicMono.map((e) => e.name).sort();
        if (JSON.stringify(a) !== JSON.stringify(b)) {
            mismatches.push(
                `public/registry.json slug set diverges from registry.json (${b.length} vs ${a.length})`,
            );
        }
    }
    if (root && shadcnManifest) {
        const rootSlugs = new Set(root.map((e) => e.name));
        const shadcnSlugs = new Set(shadcnManifest.items.map((i) => i.name));
        for (const slug of rootSlugs) {
            if (!shadcnSlugs.has(slug))
                mismatches.push(`shadcn manifest missing "${slug}"`);
        }
        for (const slug of shadcnSlugs) {
            if (!rootSlugs.has(slug))
                mismatches.push(`shadcn manifest has stray "${slug}"`);
        }
    }
    return mismatches;
}

export interface CrossCheckChangelogsInput {
    root?: Array<{ name: string; meta?: { version: string } }> | null;
    changelogs?: Record<string, Array<{ version: string }>> | null;
}

/**
 * Cross-check that every registry entry's `meta.version` matches the
 * first (newest) entry in the published changelogs map, and that the
 * changelogs map has exactly one entry per registry slug. Returns an
 * array of human-readable mismatch strings (empty on success).
 */
export function crossCheckChangelogs({
    root,
    changelogs,
}: CrossCheckChangelogsInput): string[] {
    const mismatches: string[] = [];
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
