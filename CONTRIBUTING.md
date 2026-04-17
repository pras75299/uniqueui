# Contributing to UniqueUI

## Prerequisites

- Node.js 18 or higher
- pnpm 8.12.1 — `npm install -g pnpm@8.12.1`
- Git

## Local Setup

```bash
git clone https://github.com/pras75299/uniqueui.git
cd uniqueui
pnpm install
pnpm build:registry
cd apps/www && pnpm dev    # Docs site at localhost:3000
```

## Repository Structure

| Directory | Purpose |
|-----------|---------|
| `registry/` | Component source files — single source of truth |
| `registry/config.ts` | Component registry definition (name, deps, tailwind config) |
| `packages/cli/` | `uniqueui-cli` npm package — handles `uniqueui add <component>` |
| `apps/www/` | Next.js docs/showcase site |
| `scripts/` | Build scripts (registry generation, pre-commit hook) |

## Adding a New Component

1. Create `registry/<component-name>/component.tsx` with the component source
2. Add an entry to `registry/config.ts` with `name`, `dependencies`, `files`, and optional `tailwindConfig`
3. Add docs metadata to `registry/docs.json` for the component page and scenarios
4. Add the live demo mapping to `registry/demos.tsx`
5. Run `pnpm build:registry` from the root — this regenerates `registry.json`, refreshes `apps/www/public/registry/*`, syncs `apps/www/components/ui/*`, and generates `apps/www/config/components.ts`, `apps/www/config/docs-scenarios.ts`, and `apps/www/config/demos.tsx`
6. Test in the docs site: `cd apps/www && pnpm dev`

### Docs metadata and demos

| Source (edit these) | Generated (do not edit by hand) |
|---------------------|----------------------------------|
| `registry/docs.json` | `apps/www/config/components.ts`, `apps/www/config/docs-scenarios.ts` |
| `registry/demos.tsx` | `apps/www/config/demos.tsx` |

- **Policy:** Keep docs metadata authoring centralized in `registry/docs.json` unless a [documented migration](docs/adr/0001-registry-docs-metadata-storage.md) has happened. The ADR lists quantitative **migration triggers** (file size, conflict rate, ownership needs) and qualitative **friction signals** — open a discussion if friction grows, but do not split metadata files until triggers are met.
- **When the model changes:** If an ADR supersedes 0001 (for example per-component `registry/<slug>/docs.json`), update this section, `BUILD.md`, and any `scripts/build-registry.ts` / CI drift checks in the same change series so contributors have a single coherent story.
- After any edit to `registry/docs.json` or `registry/demos.tsx`, run `pnpm build:registry` and commit generated files under `apps/www/config/`, `apps/www/components/ui/`, `apps/www/public/registry/`, and root `registry.json` as required by CI.

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
