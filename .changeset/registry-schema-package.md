---
"@uniqueui/registry-schema": minor
---

Initial release of `@uniqueui/registry-schema` — extracted Zod schemas, validators, and inferred TypeScript types for the UniqueUI registry contract.

This package is now the single source of truth for the shape of every artifact under `registry.json`, `apps/www/public/registry/*`, and `apps/www/public/r/*`. It is consumed by the build script (`scripts/build-registry.ts`), the CI validator (`scripts/validate-registry.mjs`), and — in a follow-up phase — the `uniqueui` CLI's `update` / `diff` / `registry validate` commands and third-party registries that want to validate their own bundles before publish.

**Exports**

- Schemas: `Slug`, `NpmDep`, `SemverVersion`, `IsoDate`, `RegistryFile`, `RegistryFileType`, `TailwindConfig`, `ChangelogEntry`, `Changelogs`, `RegistryMeta`, `RegistryEntry`, `RegistryArray`, `SplitIndex`, `ShadcnFile`, `ShadcnItem`, `ShadcnManifest`.
- Helpers: `validate(schema, data)`, `crossCheckSlugs(...)`, `crossCheckChangelogs(...)`, `resolvePathUnderDir(...)`, `compareSemver(a, b)`.
- Inferred TypeScript types for every schema (e.g. `RegistryEntryT`, `ChangelogsT`, `ShadcnManifestT`).

**Repo-side migration**

- `scripts/validate-registry.lib.mjs` is removed; both the build script and the validator now import from `@uniqueui/registry-schema`.
- `scripts/validate-registry.test.ts` moves to `packages/registry-schema/src/index.test.ts` (32 tests, unchanged intent).
- Root scripts gain `prebuild:registry` and `preregistry:validate` hooks that rebuild the package automatically, so a stale `dist/` cannot poison generated artifacts.

The CLI's local `packages/cli/src/validators/registry-schema.ts` keeps its trimmed copy for now to avoid adding a workspace dep before the CLI moves to full consumption in the next phase; the file's comment now points back to `@uniqueui/registry-schema` as the source of truth.
