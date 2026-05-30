# ADR 0003: Fold per-component metadata into slug manifests

## Status

Accepted — 2026-05-30. Follows [ADR 0002](0002-per-slug-registry-manifests.md).

## Context

ADR 0002 moved build config and docs metadata into `registry/components/<slug>.json`,
eliminating `registry/config.ts` and `registry/docs.json`. Phases 11–12 then added
five global slug-keyed sidecar files:

- `registry/tags.json`
- `registry/peer-dependencies.json`
- `registry/compatibility.json`
- `registry/accessibility.json`
- `registry/motion.json` (sparse)

Adding one component required edits across those monoliths plus the manifest,
reintroducing the merge-conflict surface ADR 0002 was written to remove.

## Decision

Extend each per-slug manifest with the metadata fields above. The build script
reads them from the manifest Zod schema (`ComponentManifest` in
`@uniqueui/registry-schema`) instead of loading global maps.

Migration: `scripts/migrate-sidecars-to-slug.mjs` (one-shot codemod). Acceptance:
`pnpm build:registry` produces a byte-identical `registry.json` and
`apps/www/public/r/*` before the five sidecar files are deleted.

Scaffolding: `pnpm new:component <slug>` → `scripts/scaffold-component.mjs`
stamps directory, manifest (with defaults), order-array inserts, and changelog stub.
Judgment-bearing steps live in `.claude/skills/add-component/SKILL.md`.

## Consequences

- **One component = one directory + one manifest** (+ two one-line order inserts in
  `registry/manifest.json` and a changelog entry).
- **Stronger validation** — metadata is validated by `ComponentManifest` at build time.
- **Reduced-motion gate** reads `motion` from manifests, not `motion.json`.
- **Still global (pre-A5):** `registry/changelogs.json`, per-slug demos under
  `registry/**/demo.tsx` + `registry/demos/shared.tsx` (assembled at build).
- A4 and A5 shipped in follow-up PRs (cross-links at build; demos split).
- Fold `changelog` into the manifest (optional future shrink)
