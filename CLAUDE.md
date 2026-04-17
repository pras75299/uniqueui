# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

UniqueUI is a monorepo for an animated React component library built on a copy-paste model (similar to shadcn/ui). Users install components via `npx uniqueui add <component>` rather than importing a package.

**Package manager**: pnpm 10.33.0 with workspaces (`pnpm-workspace.yaml`)

**Workspaces**:
- `apps/www` — Next.js 16 showcase/docs site
- `packages/cli` — `uniqueui-cli` npm package (Commander-based)
- `registry/` — Component source files (not a workspace, read by build scripts)

## Commands

### Root
```bash
pnpm build:registry       # Rebuild registry artifacts and sync docs UI from registry/
pnpm test                 # Run Vitest across all workspaces
```

### apps/www
```bash
cd apps/www
pnpm dev                  # Dev server at localhost:3000
pnpm build
pnpm lint                 # ESLint (eslint-config-next)
```

### packages/cli
```bash
cd packages/cli
pnpm build                # Compile TypeScript → dist/
pnpm dev                  # Run CLI directly with ts-node
```

### Scripts
```bash
# From root:
npx ts-node scripts/build-registry.ts      # Same as pnpm build:registry
npx ts-node scripts/test-all-components.ts # Spins up a fresh Next.js app, installs every component via CLI, and does a full build
bash scripts/test-cli-e2e.sh               # End-to-end CLI smoke tests
```

### Running a single test
```bash
# From root:
pnpm test -- packages/cli/src/npm-dependency-name.test.ts
pnpm test -- packages/cli/src/commands/add.test.ts
```

## Architecture

### Component Data Flow

```
registry/{component}/component.tsx ← source of truth for component code
       ↓  (pnpm build:registry)
registry/config.ts                ← declares name, npm deps, tailwindConfig per component
       ↓
registry.json                     ← auto-generated root manifest
apps/www/public/registry/*.json   ← auto-generated split docs registry artifacts
apps/www/components/ui/*.tsx      ← auto-synced docs UI copies
       ↓  (CLI: uniqueui add)
user's project/components/ui/     ← files written to the end-user's codebase
```

`registry.json` is also served at `https://uniqueui.com/registry.json` for the CLI to fetch remotely. **Never edit it by hand** — always run `pnpm build:registry`.

### Showcase Site (`apps/www`)

Three config files drive the entire docs site:

| File | Purpose |
|------|---------|
| `apps/www/config/components.ts` | `componentsList` array — slug, name, props table, `usageCode` shown in the code tab |
| `apps/www/config/demos.tsx` | `componentDemos` map — live React preview rendered in `ComponentPreview` |
| `apps/www/config/docs-scenarios.ts` | `docsScenarios` map — per-component `overview` + `scenarios[]` (title, description, code snippet) |

`ComponentPreview` (`apps/www/components/component-preview.tsx`) renders a demo by looking up `slug` in `componentDemos`. It removes `overflow-hidden` for components that need full-page scroll (currently only `horizontal-scroll-gallery`).

### CLI (`packages/cli/src`)

- `index.ts` — CLI entry, registers `init` and `add` commands
- `commands/init.ts` — scaffolds `components.json` config in a user project
- `commands/add.ts` — fetches `registry.json`, resolves component entry, writes files, installs npm deps
- `npm-dependency-name.ts` — maps registry dependency names to correct npm package names

### Adding a New Component

1. Create `registry/{component-name}/component.tsx`
2. Add entry to `registry/config.ts` (name, dependencies, files array, optional `tailwindConfig` for custom keyframes)
3. Add docs metadata to `registry/docs.json`
4. Add demo to `apps/www/config/demos.tsx` (`componentDemos`)
5. Run `pnpm build:registry` from root to regenerate `registry.json`, refresh `apps/www/public/registry/*`, sync `apps/www/components/ui/{component-name}.tsx`, and generate `apps/www/config/components.ts` plus `apps/www/config/docs-scenarios.ts`

When editing an existing component, update `registry/{component}/component.tsx` and then run `pnpm build:registry` to refresh the generated docs copies and registry artifacts.

## Component Design Rules

- **Animations**: Always use `motion` from `motion/react` (package is `motion`, not `framer-motion`). Prefer `type: "spring"` over duration-based easing.
- **Styling**: All components accept a `className` prop merged via `cn` (`clsx` + `tailwind-merge`). Avoid arbitrary Tailwind values when standard tokens suffice.
- **Self-contained**: One file per component. No cross-component imports inside `registry/`.
- **`"use client"` directive**: Required on all interactive/animated components.
- **TypeScript**: Extend the relevant HTML/motion props interface and omit conflicting event handlers (e.g., `Omit<HTMLMotionProps<"div">, "onDrag" | ...>`).

## CSP / Image Domains

`apps/www/next.config.ts` sets strict CSP headers. External image sources must be explicitly listed in the `img-src` directive. Currently allowed: `'self' data: blob: https://images.unsplash.com`.

## Commits

Follow Conventional Commits: `feat(scope): message`, `fix(scope): message`, `chore(scope): message`. Scope is typically `registry`, `cli`, `docs`, or a component name.

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
|------|----------|
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.
