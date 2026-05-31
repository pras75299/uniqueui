# ADR 0006: Fold changelogs into per-slug manifests

## Status

Accepted (2026-05-30)

## Context

After ADR 0003 (metadata sidecars) and ADR 0005 (demos split), `registry/changelogs.json`
(~654 lines) remained the last global merge-conflict file keyed by slug. Version history
for each component already maps 1:1 to `registry/components/{slug}.json`.

## Decision

1. Add a required `changelog` array to `ComponentManifest` (same shape as `RegistryEntry.changelog`).
2. Migrate all entries from `registry/changelogs.json` into each slug manifest via
   `scripts/migrate-changelogs-to-slug.mjs`, then delete the global file.
3. `scripts/build-registry.ts` reads `manifest.changelog` and still emits:
   - `meta.version` from `changelog[0].version`
   - `changelog` on each `RegistryEntry`
   - aggregated `apps/www/public/registry/changelogs.json` for the docs changelog page and CLI fetch
4. `pnpm new:component` writes the initial `1.0.0` stub on the manifest, not a sidecar.

## Consequences

- **Positive:** One file per slug for all contributor edits; no dual-file version bumps.
- **Positive:** Zod validation on manifests covers changelog ordering (newest-first is load-bearing).
- **Neutral:** Public `changelogs.json` remains a build artifact for aggregate fetch — not hand-edited.
- **Migration:** One-shot codemod; verify with empty diff on `registry.json` after rebuild.

## Still global

- `registry/manifest.json` — install/docs order only
- `registry/demos/demo-key-order.json` — demo assembly order (ADR 0005)
