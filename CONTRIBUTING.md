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

1. Create `registry/<component-name>.tsx` with the component source
2. Add an entry to `registry/config.ts` with `name`, `dependencies`, `files`, and optional `tailwindConfig`
3. Run `pnpm build:registry` from the root — this regenerates `registry.json` and syncs to `apps/www/`
4. Add the component to `apps/www/config/components.ts` (`componentsList`)
5. Add a live demo to `apps/www/config/demos.tsx` (`componentDemos`)
6. Optionally add documentation scenarios to `apps/www/config/docs-scenarios.ts`
7. Test in the docs site: `cd apps/www && pnpm dev`

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
3. Run `pnpm build:registry` if you touched any `registry/` files, and commit `registry.json`
4. Run `pnpm test` and ensure all tests pass
5. Add a changeset if your changes affect `packages/cli`: `pnpm changeset`
6. Open a PR — fill in the PR template

## Code of Conduct

Be respectful and constructive. Feedback on PRs should focus on the code, not the person. We welcome contributions from everyone regardless of experience level.
