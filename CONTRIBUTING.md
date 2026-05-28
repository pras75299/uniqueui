# Contributing to UniqueUI

## Prerequisites

- Node.js 24 LTS (recommended)
- pnpm 10.33.0 — `npm install -g pnpm@10.33.0`
- Git

## Package Manager Policy

This repository uses **pnpm workspaces** as its development workflow.

- Run install and scripts with `pnpm`
- Treat `pnpm-lock.yaml` as the source of truth
- Do not commit workspace `package-lock.json` files

## Local Setup

```bash
git clone https://github.com/pras75299/uniqueui.git
cd uniqueui
pnpm install
pnpm build:registry
pnpm dev                   # Docs site at localhost:3000
```

## Repository Structure

| Directory | Purpose |
|-----------|---------|
| `registry/` | Component source files — single source of truth |
| `registry/components/<slug>.json` | Per-component manifest: build config (deps, files, tailwind) + docs metadata. See [ADR 0002](docs/adr/0002-per-slug-registry-manifests.md) |
| `registry/manifest.json` | Demos `sourceFile` + `order` (install order) + `docsOrder` (docs-site display order) |
| `packages/cli/` | `uniqueui-cli` npm package — handles `uniqueui add <component>` |
| `apps/www/` | Next.js docs/showcase site |
| `scripts/` | Build scripts (registry generation, pre-commit hook) |

## Adding a New Component

1. Create `registry/<component-name>/component.tsx` with the component source
2. Create `registry/components/<slug>.json` — a `registry` block (`dependencies`, `files`, optional `tailwindConfig`/`tailwindCss`; the shared `cn` util is appended automatically, so don't list it) and a `docs` block (name, description, icon, props, optional `docs.overview`/`docs.scenarios`). See [ADR 0002](docs/adr/0002-per-slug-registry-manifests.md)
3. Add the slug to both `order` and `docsOrder` in `registry/manifest.json`
4. Add the live demo mapping to `registry/demos.tsx`
5. Run `pnpm build:registry` from the root — this regenerates `registry.json`, refreshes `apps/www/public/registry/*` and **`apps/www/public/r/*`** (shadcn registry URLs), syncs `apps/www/components/ui/*`, and generates `apps/www/config/components.ts`, `apps/www/config/docs-scenarios.ts`, and `apps/www/config/demos.tsx`
6. Test in the docs site: `cd apps/www && pnpm dev`

### Docs metadata and demos

| Source (edit these) | Generated (do not edit by hand) |
|---------------------|----------------------------------|
| `registry/components/<slug>.json` | `apps/www/config/components.ts`, `apps/www/config/docs-scenarios.ts` |
| `registry/demos.tsx` | `apps/www/config/demos.tsx` |

- **Model:** Registry metadata is authored as one manifest per component under `registry/components/<slug>.json`, aggregated by `scripts/build-registry.ts`. This supersedes the centralized `registry/docs.json` model — see [ADR 0002](docs/adr/0002-per-slug-registry-manifests.md) (which supersedes [ADR 0001](docs/adr/0001-registry-docs-metadata-storage.md)).
- **When the model changes:** If a future ADR supersedes 0002, update this section, `BUILD.md`, and any `scripts/build-registry.ts` / CI drift checks in the same change series so contributors have a single coherent story.
- After any edit under `registry/components/`, `registry/manifest.json`, or `registry/demos.tsx`, run `pnpm build:registry` and commit generated files under `apps/www/config/`, `apps/www/components/ui/`, `apps/www/public/registry/`, **`apps/www/public/r/`**, and root `registry.json` as required by CI.

## Component Design Rules

- **Animations**: Use `motion` from `motion/react` (not `framer-motion`). Prefer `type: "spring"` transitions.
- **Styling**: All components must accept a `className` prop merged via `cn` (`clsx` + `tailwind-merge`).
- **Self-contained**: One file per component. No imports from other registry components.
- **`"use client"` directive**: Required on all interactive or animated components.
- **TypeScript**: Extend the relevant HTML/motion props interface and omit conflicting event handlers.
- **No arbitrary Tailwind values**: Use standard tokens where possible.

## Running Tests

```bash
pnpm test                               # All workspaces
pnpm --dir packages/cli test            # CLI tests only
pnpm --dir apps/www test                # Docs site tests only

# Single test file:
pnpm test -- packages/cli/src/commands/add.test.ts
```

## Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(scope): add new component
fix(scope): correct animation timing
chore(scope): update dependencies
```

Common scopes: `registry`, `cli`, `docs`, or the component name (e.g. `moving-border`).

## Pull Request Process

1. Fork the repo and create a branch from `pras75299/initial-feature-setup`
2. Make your changes following the guidelines above
3. Run `pnpm build:registry` if you touched registry source or docs metadata, and commit the regenerated artifacts
4. Run `pnpm test` and ensure all tests pass
5. Add a changeset if your changes affect `packages/cli`: `pnpm changeset`
6. Do not edit `CHANGELOG.md` manually. Release automation updates it from changesets.
7. Open a PR — fill in the PR template

## Release notes and changelog

- Changesets are the source of truth for **versioned** CLI releases.
- The release automation opens or updates a PR that runs `pnpm version-packages`.
- `pnpm version-packages` updates `packages/cli/CHANGELOG.md` and syncs root `CHANGELOG.md`.
- Write changeset summaries for **end users** (what changed in behavior or usage). See `.changeset/README.md` for bump types and examples. Root changelog richness depends on good changeset first lines.
- Optional quality check: run `pnpm changeset:quality` to catch weak changeset summaries before PR review.

## Code of Conduct

Be respectful and constructive. Feedback on PRs should focus on the code, not the person. We welcome contributions from everyone regardless of experience level.
