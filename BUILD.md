# Build Guide

## Requirements

- Node.js 18 or higher
- pnpm 8.12.1 — `npm install -g pnpm@8.12.1`

## Quick Start

```bash
pnpm install               # Install all workspace dependencies
pnpm build:registry        # Generate registry.json from registry/ sources
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
pnpm build:registry    # Reads registry/ source files → writes registry.json
                       # Also writes apps/www/public/registry.json
                       # Also splits into per-component files in apps/www/public/registry/
                       # Also syncs component files to apps/www/components/ui/
```

Always commit `registry.json` after adding or modifying components.

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
pnpm version-packages   # Bump versions + update CHANGELOG
pnpm release            # Build + publish to npm
```
