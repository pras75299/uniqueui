# @uniqueui/registry-schema

Zod schemas, validators, and TypeScript types for the [UniqueUI](https://uniqueui-platform.vercel.app) registry contract.

This package is the source of truth for the shape of every artifact UniqueUI publishes — the root `registry.json`, the split per-slug files under `/registry/<slug>.json`, and the shadcn-compatible registry items under `/r/<slug>.json`. It is consumed by:

- the registry build script
- the CI artifact validator
- the `uniqueui` CLI
- third-party registries that want to validate their own bundles before publish

## Install

```bash
npm install @uniqueui/registry-schema zod
```

`zod` is a peer of this package's runtime dependency; install it explicitly so you stay on a known version.

## Usage

```ts
import {
  RegistryEntry,
  validate,
  crossCheckChangelogs,
  type RegistryEntryT,
} from "@uniqueui/registry-schema";

const raw = JSON.parse(await fs.readFile("registry.json", "utf8"));
const result = validate(RegistryEntry, raw[0]);
if (!result.ok) {
  console.error(result.errors);
  process.exit(1);
}

const entry: RegistryEntryT = result.data;
```

## Exports

**Schemas:** `Slug`, `NpmDep`, `SemverVersion`, `IsoDate`, `RegistryFile`, `RegistryFileType`, `TailwindConfig`, `ChangelogEntry`, `Changelogs`, `RegistryMeta`, `RegistryEntry`, `RegistryArray`, `SplitIndex`, `ShadcnFile`, `ShadcnItem`, `ShadcnManifest`.

**Helpers:** `validate(schema, data)`, `crossCheckSlugs(...)`, `crossCheckChangelogs(...)`, `resolvePathUnderDir(...)`, `compareSemver(a, b)`.

**Types:** every schema has an inferred type export suffixed with `T` (e.g. `RegistryEntryT`, `ChangelogsT`, `ShadcnManifestT`).

## License

MIT
