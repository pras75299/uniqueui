# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# 12-rule template

These rules apply to every task in this project unless explicitly overridden.
Bias: caution over speed on non-trivial work. Use judgment on trivial tasks.

## Rule 1 — Think Before Coding

State assumptions explicitly. If uncertain, ask rather than guess.
Present multiple interpretations when ambiguity exists.
Push back when a simpler approach exists.
Stop when confused. Name what's unclear.

## Rule 2 — Simplicity First

Minimum code that solves the problem. Nothing speculative.
No features beyond what was asked. No abstractions for single-use code.
Test: would a senior engineer say this is overcomplicated? If yes, simplify.

## Rule 3 — Surgical Changes

Touch only what you must. Clean up only your own mess.
Don't "improve" adjacent code, comments, or formatting.
Don't refactor what isn't broken. Match existing style.

## Rule 4 — Goal-Driven Execution

Define success criteria. Loop until verified.
Don't follow steps. Define success and iterate.
Strong success criteria let you loop independently.

## Rule 5 — Use the model only for judgment calls

Use me for: classification, drafting, summarization, extraction.
Do NOT use me for: routing, retries, deterministic transforms.
If code can answer, code answers.

## Rule 6 — Token budgets are not advisory

Per-task: 4,000 tokens. Per-session: 30,000 tokens.
If approaching budget, summarize and start fresh.
Surface the breach. Do not silently overrun.

## Rule 7 — Surface conflicts, don't average them

If two patterns contradict, pick one (more recent / more tested).
Explain why. Flag the other for cleanup.
Don't blend conflicting patterns.

## Rule 8 — Read before you write

Before adding code, read exports, immediate callers, shared utilities.
"Looks orthogonal" is dangerous. If unsure why code is structured a way, ask.

## Rule 9 — Tests verify intent, not just behavior

Tests must encode WHY behavior matters, not just WHAT it does.
A test that can't fail when business logic changes is wrong.

## Rule 10 — Checkpoint after every significant step

Summarize what was done, what's verified, what's left.
Don't continue from a state you can't describe back.
If you lose track, stop and restate.

## Rule 11 — Match the codebase's conventions, even if you disagree

Conformance > taste inside the codebase.
If you genuinely think a convention is harmful, surface it. Don't fork silently.

## Rule 12 — Fail loud

"Completed" is wrong if anything was skipped silently.
"Tests pass" is wrong if any were skipped.
Default to surfacing uncertainty, not hiding it.

## Repository Overview

UniqueUI is a monorepo for an animated React component library built on a copy-paste model (similar to shadcn/ui). Users install components via **`npx uniqueui add <component>`** or via the **shadcn CLI** using published URLs such as `https://uniqueui.com/r/<slug>.json` (generated under `apps/www/public/r/` by `pnpm build:registry`).

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
pnpm test:e2e:shadcn                       # Same, but shadcn add + preview pages from usageCode + build
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
apps/www/public/registry/*.json   ← auto-generated split docs registry artifacts (uniqueui add)
apps/www/public/r/*.json          ← shadcn registry-item JSON (+ r/registry.json manifest)
apps/www/components/ui/*.tsx      ← auto-synced docs UI copies
       ↓  (CLI: uniqueui add or shadcn add …/r/<slug>.json)
user's project/components/ui/     ← files written to the end-user's codebase
```

`registry.json` is also served at `https://uniqueui.com/registry.json` for the UniqueUI CLI. **Never edit generated manifests by hand** — always run `pnpm build:registry`.

### Showcase Site (`apps/www`)

Three config files drive the entire docs site:

| File                                | Purpose                                                                                           |
| ----------------------------------- | ------------------------------------------------------------------------------------------------- |
| `apps/www/config/components.ts`     | `componentsList` array — slug, name, props table, `usageCode` shown in the code tab               |
| `apps/www/config/demos.tsx`         | `componentDemos` map — live React preview rendered in `ComponentPreview`                          |
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
5. Run `pnpm build:registry` from root to regenerate `registry.json`, refresh `apps/www/public/registry/*` and **`apps/www/public/r/*`**, sync `apps/www/components/ui/{component-name}.tsx`, and generate `apps/www/config/components.ts` plus `apps/www/config/docs-scenarios.ts`

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

| Tool                        | Use when                                               |
| --------------------------- | ------------------------------------------------------ |
| `detect_changes`            | Reviewing code changes — gives risk-scored analysis    |
| `get_review_context`        | Need source snippets for review — token-efficient      |
| `get_impact_radius`         | Understanding blast radius of a change                 |
| `get_affected_flows`        | Finding which execution paths are impacted             |
| `query_graph`               | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes`     | Finding functions/classes by name or keyword           |
| `get_architecture_overview` | Understanding high-level codebase structure            |
| `refactor_tool`             | Planning renames, finding dead code                    |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.

# Commit Rules

- Always use one liner commit message do not use any extra text and do not include words like claude or codex or cursor or windsurf or gemini or anthropic or openai or deepseek or etc.
- Always use the correct commit message format feat(scope): message or fix(scope): message or chore(scope): message or ref(scope): message or docs(scope): message or test(scope): message or style(scope): message or perf(scope): message or revert(scope): message or ci(scope): message or build(scope): message or release(scope): message or hotfix(scope): message or revert(scope): message or docs(scope): message or test(scope): message or style(scope): message or perf(scope): message or revert(scope): message or ci(scope): message or build(scope): message or release(scope): message or hotfix(scope): message
- Always run code review like code-rabbitmq to review the code before committing.
- Always run lint before committing.
- Always run tests before committing.
- Always run build before committing.
- Always run typecheck before committing.
- Always run security scan before committing.
- Always run ci before committing.
