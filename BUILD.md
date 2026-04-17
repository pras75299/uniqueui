# Build Guide

## Requirements

- Node.js 18 or higher
- pnpm 8.12.1 — `npm install -g pnpm@8.12.1`

## Quick Start

```bash
pnpm install               # Install all workspace dependencies
pnpm build:registry        # Rebuild registry artifacts and sync docs UI from registry/
cd apps/www && pnpm dev    # Start docs site at localhost:3000
```

## Building the CLI

```bash
cd packages/cli
pnpm build      # Compile TypeScript → dist/
pnpm dev        # Run CLI with ts-node (no build step needed)
```

## Testing the CLI Locally Against the Local Registry

```bash
# From the repo root, first build registry.json
pnpm build:registry

# From packages/cli after building
node dist/index.js add moving-border --url ../../registry.json
```

### `uniqueui add --url` accepted source shapes

`uniqueui add` accepts remote URLs and local filesystem paths. For normal use, prefer the default (omit `--url`) so the CLI uses the official hosted registry.

```bash
# Remote host root (tries /registry/index.json, then fallbacks)
npx uniqueui add moving-border --url https://uniqueui-platform.vercel.app

# Remote /registry base
npx uniqueui add moving-border --url https://uniqueui-platform.vercel.app/registry

# Remote split index
npx uniqueui add moving-border --url https://uniqueui-platform.vercel.app/registry/index.json

# Remote direct component or legacy registry JSON
npx uniqueui add moving-border --url https://example.com/registry/moving-border.json

# Local relative path
npx uniqueui add moving-border --url ../../registry.json

# Local absolute path
npx uniqueui add moving-border --url /Users/you/dev/uniqueui/registry/registry.json
```

Resolution behavior (brief):
- Split registry lookup: `<base>/registry/index.json` + `<base>/registry/<component>.json` (or directly under `<base>` if `--url` already points at `/registry` or `/index.json`).
- Legacy fallback lookup: `registry.json`, then `api/registry` candidates.
- Remote-only network fallback: if a non-local source does not resolve, CLI retries against `https://raw.githubusercontent.com/pras75299/uniqueui/main`.

## Running Tests

```bash
pnpm test                                            # All workspaces (parallel)
pnpm test:ci                                         # All workspaces (sequential, strict)
pnpm --dir packages/cli test                         # CLI only
pnpm --dir apps/www test                             # Docs site only

# Single test file:
pnpm test -- packages/cli/src/commands/add.test.ts
```

## Registry Build

`registry.json` is a **generated artifact** — never edit it manually.

```bash
pnpm build:registry    # Reads registry/<slug>/component.tsx sources → writes registry.json
                       # Also writes apps/www/public/registry.json
                       # Also splits per-component files into apps/www/public/registry/
                       # Also syncs docs copies into apps/www/components/ui/
                       # Also generates apps/www/config/{components,docs-scenarios,demos}.ts*
```

Always commit `registry.json` after adding or modifying components.

### Docs Metadata Storage Decision

`registry/docs.json` remains centralized for now (single source authoring model). This aligns with the current build flow where one registry build command composes and syncs docs artifacts.

- Author docs metadata in the centralized file.
- Generated runtime artifacts can still be split per component for delivery.
- Revisit splitting authoring into per-component metadata files only when scaling triggers are hit (see `docs/adr/0001-registry-docs-metadata-storage.md`).

## Workspaces

| Workspace | Directory | npm name |
|-----------|-----------|----------|
| CLI | `packages/cli` | `uniqueui-cli` (published) |
| Docs | `apps/www` | `www` (not published) |

## Type Checking

```bash
pnpm typecheck    # Type-check all workspaces
```

## Release (maintainers only)

```bash
pnpm changeset          # Create a changeset describing the change
pnpm version-packages   # Bump versions + update packages/cli/CHANGELOG.md + root CHANGELOG.md
pnpm release            # Build + publish to npm
```

Release automation uses `.github/workflows/changesets.yml`:

- On pushes to `main` and `pras75299/initial-feature-setup`, Changesets opens or updates a release PR.
- That release PR runs `pnpm version-packages`, so changelog updates are generated from changesets and synced into root `CHANGELOG.md`.
- After merging the release PR, publish from maintainers as usual.
