# UniqueUI — Repository Structural Audit & Improvement Plan

> **Status:** Internal working document. Not committed to git.
> **Date:** 2026-04-16
> **Scope:** Full monorepo — CLI, registry system, docs site, build pipeline, open-source readiness

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Repository Overview](#2-repository-overview)
3. [Monorepo Structure](#3-monorepo-structure)
4. [Registry System](#4-registry-system)
5. [CLI Architecture](#5-cli-architecture)
6. [Docs Site (apps/www)](#6-docs-site-appswww)
7. [Testing Infrastructure](#7-testing-infrastructure)
8. [Build Pipeline & Scripts](#8-build-pipeline--scripts)
9. [Security Analysis](#9-security-analysis)
10. [Performance Bottlenecks](#10-performance-bottlenecks)
11. [Open-Source Readiness Gaps](#11-open-source-readiness-gaps)
12. [Recommended Structural Refactor](#12-recommended-structural-refactor)
13. [Prioritized Action Plan](#13-prioritized-action-plan)
14. [Appendix — File Inventory](#14-appendix--file-inventory)

---

## 1. Executive Summary

UniqueUI is a React animated component library built on a **copy-paste architecture** (similar to shadcn/ui). Users install components via `npx uniqueui add <component>` instead of importing a package — meaning no runtime dependency, full customization.

The codebase demonstrates strong fundamentals: clean CLI design, security-first registry fetching, TypeScript throughout, and 42 production-quality animated components. However, it has several critical gaps that block open-source maturity:

| Area | Status |
|------|--------|
| CI/CD pipelines | Missing |
| Release automation | Missing |
| Registry performance | 304 KB monolith — needs splitting |
| Build orchestration | No Turbo |
| Test coverage | ~5 test files for 42 components |
| Developer docs | CONTRIBUTING.md, SECURITY.md absent |
| Config file scale | 3 hand-maintained files totalling 263 KB |

---

## 2. Repository Overview

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Package manager | pnpm 8.12.1 with workspaces |
| Component animations | `motion` from `motion/react` (not framer-motion) |
| Docs site | Next.js 16.1.1 + Turbopack |
| Syntax highlighting | Shiki 3.23.0 (server-side) |
| Styling | Tailwind CSS 4 |
| CLI framework | Commander.js 11 |
| AST manipulation | ts-morph 21 (for tailwind.config.ts patching) |
| Testing | Vitest 4 |
| Git hooks | Husky 9 |

### Workspaces

```
pnpm-workspace.yaml
  packages/*   →  packages/cli   (published to npm as uniqueui-cli)
  apps/*       →  apps/www       (Next.js showcase — not published)
```

`registry/` is **not a workspace** — it's read directly by build scripts.

---

## 3. Monorepo Structure

### Current Layout

```
uniqueui/
├── package.json              # Root private package (pnpm@8.12.1)
├── pnpm-workspace.yaml       # Workspace definition
├── tsconfig.json             # Shared TypeScript config
├── registry/
│   ├── config.ts             # Component registry definition (393 lines)
│   └── *.tsx                 # 42 component implementations (~150 KB total)
├── scripts/
│   ├── build-registry.ts     # Generates registry.json (57 lines)
│   ├── pre-commit.sh         # Git hook: tests + lint
│   ├── test-all-components.ts
│   └── test-cli-e2e.sh
├── packages/
│   └── cli/
│       ├── package.json      # Published: uniqueui-cli v1.0.0
│       ├── src/
│       │   ├── index.ts      # CLI entry, Commander setup (29 lines)
│       │   ├── commands/
│       │   │   ├── init.ts   # Project scaffolding (82 lines)
│       │   │   ├── add.ts    # Component install — core logic (420 lines)
│       │   │   └── add.test.ts
│       │   └── npm-dependency-name.ts
│       ├── tsconfig.json
│       └── vitest.config.ts
├── apps/
│   └── www/
│       ├── package.json      # Next.js app
│       ├── app/              # Next.js App Router pages
│       ├── components/       # App-level components
│       ├── config/
│       │   ├── components.ts # Component metadata — 127.5 KB, hand-maintained
│       │   ├── demos.tsx     # Demo implementations — 88.7 KB, hand-maintained
│       │   └── docs-scenarios.ts # Docs content — 47.3 KB, hand-maintained
│       ├── public/
│       │   └── registry.json # 304 KB — copy of root registry.json
│       ├── tests/            # 5 test files
│       ├── next.config.ts
│       └── vitest.config.ts
├── .github/
│   └── pull_request_template.md  # Only file — no CI workflows
├── .husky/
│   └── pre-commit
├── registry.json             # 304 KB generated artifact
├── CLAUDE.md
└── README.md
```

### Root package.json Scripts

```json
{
  "build:registry": "ts-node scripts/build-registry.ts",
  "test": "pnpm --dir packages/cli test && pnpm --dir apps/www test",
  "prepare": "husky",
  "precommit": "bash scripts/pre-commit.sh"
}
```

**Issue:** Tests run sequentially (`&&`), not in parallel.

---

## 4. Registry System

### Data Flow

```
registry/{component}.tsx          ← single source of truth for component code
       ↓  (pnpm build:registry)
registry/config.ts                ← declares name, npm deps, tailwindConfig per component
       ↓
registry.json                     ← auto-generated; embeds full source + cn util inline
  + apps/www/public/registry.json ← copy served by Next.js
       ↓  (CLI: uniqueui add <slug>)
user's project/components/ui/     ← files written into end-user's codebase
```

### registry/config.ts

- **Lines:** 393
- **Components:** 42 across 4 phases
- **Entry structure:**
  ```typescript
  {
    name: "moving-border",
    dependencies: ["motion", "clsx", "tailwind-merge"],
    files: [{ path: "moving-border.tsx", type: "registry:ui" }],
    tailwindConfig?: {
      animation: { "moving-border": "..." },
      keyframes: { "moving-border": { ... } }
    }
  }
  ```
- **Utility file:** `cnUtilFile` (lines 9–13) — `utils/cn.ts` shared by all components

### Component Breakdown by Category

| Category | Count | Components |
|----------|-------|-----------|
| Text Effects | 8 | typewriter-text, animated-glowing-text-outline, gradient-text-reveal, scramble-text, shiny-text, blur-reveal, count-up, word-rotate |
| Cards | 8 | 3d-tilt-card, spotlight-card, meteors-card, flip-card, hover-reveal-card, bento-grid, morphing-card-stack, multi-step-auth-card |
| Effects & Animations | 12 | moving-border, animated-tabs, magnetic-button, infinite-marquee, scroll-reveal, skeleton-shimmer, confetti-burst, drawer-slide, animated-timeline, horizontal-scroll-gallery, ripple, border-beam |
| Backgrounds | 4 | aurora-background, dot-grid-background, particle-field, glow-hero-section |
| Navigation & Overlays | 5 | morphing-modal, floating-dock, notification-stack, radial-menu, limelight-nav |
| Cursor Effects | 3 | interactive-cursor, cursor-trail, pen-cursor |
| Data & Layout | 2 | data-table, nested-comments |

### Component File Sizes

| Component | Size | Notes |
|-----------|------|-------|
| `data-table.tsx` | 22.8 KB | Complex table with sort/pagination |
| `animated-timeline.tsx` | 18.1 KB | 4 animation variants |
| `bento-grid.tsx` | 7.1 KB | |
| `limelight-nav.tsx` | 5.8 KB | |
| `animated-glowing-text-outline.tsx` | 5.3 KB | |
| `blur-reveal.tsx` | 1.7 KB | Smallest |
| `flip-card.tsx` | 2.3 KB | |

### Dependency Usage Across 42 Components

| Package | Used by | % |
|---------|---------|---|
| `clsx` | 42 | 100% |
| `tailwind-merge` | 42 | 100% |
| `motion` | 35+ | 83% |
| `lucide-react` | 4 | 9.5% |

### build-registry.ts — `scripts/build-registry.ts`

- **Lines:** 57
- **Outputs:**
  - `/registry.json` (root) — for GitHub raw access
  - `/apps/www/public/registry.json` — served by Next.js
- **Logic:**
  1. Import component list from `registry/config.ts`
  2. For each component, read `.tsx` file contents from disk
  3. Fall back to inline `content` if provided in config
  4. Embed full source + cn util into JSON
  5. Write both output files
- **Issue:** Does NOT sync `registry/*.tsx` → `apps/www/components/ui/`. This is a manual step that causes drift.

### registry.json Size Problem

- **Current size:** 304 KB (882 lines)
- **Impact:** Full file downloaded by CLI on every `uniqueui add <component>` (mitigated by 1-hour local cache)
- **Cache location:** `~/.uniqueui/registry-cache.json`
- **Root cause:** Monolithic JSON embeds source code of all 42 components

---

## 5. CLI Architecture

### Entry Point — `packages/cli/src/index.ts`

```
Commands:
  init                    Scaffold components.json in user project
  add <component>         Install component with optional --url flag
    --url                 Override registry URL (default: https://uniqueui-platform.vercel.app)
```

### init Command — `commands/init.ts` (82 lines)

**Interactive prompts:**
1. Components directory (default: `components/ui`)
2. TypeScript toggle (default: true)
3. Tailwind config location (default: `tailwind.config.ts`)

**Outputs:**
- `components.json` in user project root
- `utils/cn.ts` if missing

**Issue:** Line 36 references `https://uniqueui.com/schema.json` in the components.json `$schema` field. This URL is not yet published.

### add Command — `commands/add.ts` (420 lines)

This is the most critical and complex part of the CLI.

#### Registry Fetch Strategy (lines 111–202)

```
1. If URL starts with "."  →  read local file
2. Check cache (~/.uniqueui/registry-cache.json, TTL: 1 hour)
3. Fetch <URL>/registry.json
4. Fall back to <URL>/api/registry
5. Fall back to GitHub raw URL
6. Error if all fail
```

#### Registry Validation (lines 21–70)

Strict schema validation before processing:
- `name`: string
- `dependencies`: string array
- `files`: array of `{ path, type, content }`
- `tailwindConfig`: optional object with `animation`/`keyframes`

Returns `null` on malformed data — safe failure.

#### Security: URL Whitelisting (lines 72–98)

Trusted registry hosts:
- Local paths (`.` prefix)
- `uniqueui-platform.vercel.app`
- `raw.githubusercontent.com/pras75299/uniqueui/*`

Warning issued for untrusted URLs. Suppressed via `UNIQUEUI_SKIP_REGISTRY_WARN=1`.

#### Dependency Installation (lines 230–256)

- Validates names via `assertSafeNpmDependencies()`
- Auto-detects package manager (pnpm > yarn > npm)
- Uses `spawnSync` with `shell: false` — no shell injection possible
- Args passed as array, not interpolated string

#### File Writing (lines 264–295)

- Allowed extensions: `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs` only
- UI components → `config.paths.components` (default: `components/ui`)
- Utilities → `config.paths.lib` (default: `utils`)
- `utils/cn.ts` is idempotent — only written if missing

#### Tailwind Config Merge (lines 258–419)

Most complex code path — uses `ts-morph` to parse and patch `tailwind.config.ts`:
1. Find or create `theme.extend.animation` object literal
2. Find or create `theme.extend.keyframes` object literal
3. Add new animation/keyframe properties if not already present
4. Write modified file back to disk

**Issue:** This entire code path has zero unit tests.

### npm-dependency-name.ts

- Maps registry dependency names to correct npm package names
- Prevents homograph attacks and typosquatting
- Has its own test file: `npm-dependency-name.test.ts`

---

## 6. Docs Site (apps/www)

### Next.js Configuration — `next.config.ts`

- **Next.js version:** 16.1.1
- **Turbopack:** Enabled (line 31) — points to monorepo root
- **Security headers:**
  - CSP (allows unsafe-inline for scripts/styles — could be tightened)
  - `X-Frame-Options: DENY`
  - HSTS with preload
- **Redirects:** `/docs/:slug` → `/components/:slug` (permanent)
- **Static asset caching:** 1-year immutable cache for `_next/static`

### App Router Structure

```
apps/www/app/
├── page.tsx                      # Homepage (25+ KB)
├── layout.tsx                    # Root layout + ThemeProvider
├── components/
│   ├── page.tsx                  # Component gallery
│   └── [slug]/page.tsx           # Component detail (SSG)
├── docs/
│   ├── page.tsx                  # Docs index
│   └── [slug]/page.tsx           # Individual doc
└── templates/
    ├── page.tsx
    └── [slug]/page.tsx
```

### Config Files — The Scaling Problem

| File | Size | Lines | Content |
|------|------|-------|---------|
| `config/components.ts` | 127.5 KB | 3,778 | Component metadata, prop tables, usage code |
| `config/demos.tsx` | 88.7 KB | ~88,741 | Live React demo implementations |
| `config/docs-scenarios.ts` | 47.3 KB | ~2,000+ | Per-component overview + scenarios |
| **Total** | **263.5 KB** | **~94,519** | Hand-maintained for 42 components |

Each new component requires manual edits to all three files. This does not scale past ~80 components.

### Component Detail Page — `[slug]/page.tsx`

- `generateStaticParams()` — pre-renders all 42 component routes at build time
- `dynamicParams: true` — allows fallback for new components
- Shiki pre-highlights code blocks server-side
- Variant codes all pre-highlighted at build time
- `BentoVariantSwitcher` client component for tab UI

### Theme System

- `layout.tsx` — Inline `beforeInteractive` script reads `uniqueui-theme` from localStorage
- Sets `document.documentElement.dataset.theme` before paint (prevents flash)
- `useSyncExternalStore` in ThemeProvider to avoid hydration mismatch

### ComponentPreview

- `components/component-preview.tsx` — renders demo by slug lookup in `componentDemos`
- Special case: removes `overflow-hidden` for `horizontal-scroll-gallery`

---

## 7. Testing Infrastructure

### CLI Tests — `packages/cli/`

**Config:** `vitest.config.ts` — Node environment, globals enabled

| File | Lines | Coverage |
|------|-------|---------|
| `commands/add.test.ts` | 99 | Registry fetch, file write, cache |
| `npm-dependency-name.test.ts` | ~40 | Dependency name validation |

**Mocked:** `fs-extra`, `node-fetch`, `child_process`

**Not covered:**
- Tailwind config merge logic (lines 258–419 of add.ts)
- `init.ts` command
- Error paths (network failure, malformed registry, invalid component slug)
- Security edge cases (untrusted URL behavior)

### Docs Site Tests — `apps/www/tests/`

**Config:** `vitest.config.ts` — jsdom environment, React plugin, `@` alias

| File | Size | Focus |
|------|------|-------|
| `accessibility.test.tsx` | 3.4 KB | ARIA compliance |
| `component-sync.test.ts` | 1.3 KB | Registry/config sync |
| `components.test.tsx` | 0.8 KB | Basic import checks |
| `interaction.test.tsx` | 2.3 KB | User interactions |
| `setup.ts` | — | Test environment setup |

**Assessment:** 5 test files, ~8 KB total for 42 components — very thin coverage.

### Pre-commit Hook

**`.husky/pre-commit`** → **`scripts/pre-commit.sh`**:
1. `pnpm test` (root — runs all packages)
2. `pnpm lint` in `apps/www`

**Issue:** Runs full test suite on every commit. Slow for large changes. Should use `lint-staged` for changed files only.

---

## 8. Build Pipeline & Scripts

### Root Scripts Summary

| Script | Command | Output |
|--------|---------|--------|
| `build:registry` | `ts-node scripts/build-registry.ts` | `registry.json` + `apps/www/public/registry.json` |
| `test` | Sequential pnpm --dir tests | Test results |
| `prepare` | `husky` | Git hooks installed |
| `precommit` | `bash scripts/pre-commit.sh` | Tests + lint |

### Missing Build Orchestration

- **No `turbo.json`** — All packages build independently, no caching
- **No parallel test execution** — `&&` chains in test script
- **No incremental registry builds** — Full rebuild on any change

### Scripts Directory

| Script | Purpose |
|--------|---------|
| `build-registry.ts` | Generates registry.json from config.ts + registry/*.tsx |
| `pre-commit.sh` | Git hook: run tests + lint |
| `test-all-components.ts` | Spins up fresh Next.js, installs every component via CLI, full build |
| `test-cli-e2e.sh` | End-to-end CLI smoke tests |

---

## 9. Security Analysis

### Strengths

**Registry URL validation** (`add.ts:72–88`):
- Whitelist-only approach
- Warning system with env override
- Clear security boundary

**Shell injection prevention** (`add.ts:243–245`):
```typescript
spawnSync(pm, args, { stdio: "inherit", shell: false, env: process.env })
```
- `shell: false` prevents injection
- Args as array, never interpolated strings

**File extension whitelist** (`add.ts:264`):
- Only `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs` allowed
- Blocks `.sh`, `.env`, `.yaml`, `.json` writes

**Dependency name validation**:
- `assertSafeNpmDependencies()` before any install
- Prevents homograph attacks

### Issues

| Issue | Location | Severity |
|-------|----------|----------|
| `SECURITY.md` referenced but missing | `add.ts:95` | Medium |
| CSP allows `unsafe-inline` | `next.config.ts` | Low |
| No rate limiting on registry fetches | `add.ts:179` | Low |
| No integrity hashes for registry content | `add.ts` | Low |

---

## 10. Performance Bottlenecks

### CLI Performance

| Bottleneck | Severity | Current Mitigation | Better Fix |
|------------|----------|-------------------|------------|
| 304 KB registry download | Medium | 1-hour local cache | Split into per-component JSON files |
| Full registry parse on each `add` | Low | Cache hit avoids re-fetch | Lazy-load by component slug |
| Sequential npm install | Low | None | Already fast for 2–3 deps |

### Build Performance

| Bottleneck | Severity | Current Mitigation | Better Fix |
|------------|----------|-------------------|------------|
| No Turbo caching | Medium | None | Add `turbo.json` |
| Sequential test runs | Low | None | Parallel via Turbo |
| Full registry rebuild on any change | Low | None | Hash-based incremental builds |

### Docs Site Performance

| Bottleneck | Severity | Current Mitigation | Better Fix |
|------------|----------|-------------------|------------|
| `components.ts` is 127.5 KB in JS bundle | Medium | Next.js tree-shaking | Generate from registry at build time |
| `demos.tsx` is 88.7 KB | Medium | Code splitting per route | Dynamic imports per component |
| No client-side search | Low | None | Algolia DocSearch or Fuse.js |
| No component lazy loading in gallery | Low | None | Virtualize or paginate |

---

## 11. Open-Source Readiness Gaps

### Missing Infrastructure

| Item | Impact | Effort |
|------|--------|--------|
| GitHub Actions CI (`ci.yml`) | Blocks contributor quality assurance | Low |
| GitHub Actions publish (`publish.yml`) | Manual npm releases | Low |
| Registry verification CI | Stale registry.json goes undetected | Low |
| `@changesets/cli` | No versioning/changelog automation | Medium |
| `turbo.json` | Slow monorepo builds | Low |

### Missing Documentation

| File | Why It Matters |
|------|---------------|
| `CONTRIBUTING.md` | Explains how to add a component, run tests, submit PRs |
| `BUILD.md` | Local dev setup from scratch |
| `SECURITY.md` | Responsible disclosure — already referenced in CLI source code |
| `ARCHITECTURE.md` | System design for new contributors |
| `CHANGELOG.md` | Version history (auto-generated by changesets) |

### Missing Quality Gates

| Gate | Current State | Target |
|------|---------------|--------|
| Test coverage | ~12% (5 test files / 42 components) | 60%+ |
| Visual regression tests | None | Chromatic or Percy |
| Accessibility CI | Manual in test files | axe-core in CI |
| Bundle size tracking | None | size-limit in CI |
| Type checking in CI | None | `tsc --noEmit` in CI |

---

## 12. Recommended Structural Refactor

### Problem A: Three Hand-Maintained Config Files Don't Scale

Current state — every new component requires editing 3 files manually:
- `apps/www/config/components.ts` (127.5 KB)
- `apps/www/config/demos.tsx` (88.7 KB)
- `apps/www/config/docs-scenarios.ts` (47.3 KB)

**Solution: Co-locate component metadata with component source**

```
registry/
├── moving-border/
│   ├── component.tsx       # source (currently: registry/moving-border.tsx)
│   ├── demo.tsx            # demo (currently: embedded in apps/www/config/demos.tsx)
│   └── docs.ts             # metadata (currently: split across components.ts + docs-scenarios.ts)
├── typewriter-text/
│   ├── component.tsx
│   ├── demo.tsx
│   └── docs.ts
└── config.ts               # keeps name, deps, tailwindConfig (no source content needed)
```

`build-registry.ts` then generates all three config files automatically, plus:
- `registry.json`
- `apps/www/public/registry.json`
- `apps/www/components/ui/*.tsx` (eliminates manual sync step)

### Problem B: 304 KB Monolithic Registry JSON

**Solution: Per-component registry files**

```
apps/www/public/registry/
├── index.json              # ~8 KB — component list + metadata only, no source
├── moving-border.json      # ~3 KB — single component with full source
├── typewriter-text.json    # ~4 KB
└── ...                     # 42 individual files
```

CLI flow change:
```
Old: fetch registry.json (304 KB) → find component → install
New: fetch registry/index.json (8 KB) → validate slug exists → fetch registry/<slug>.json (~3 KB) → install
```

**Payload reduction: ~304 KB → ~11 KB per install (96% reduction)**

### Target Directory Structure

```
uniqueui/
├── .github/
│   └── workflows/
│       ├── ci.yml              # ADD: test + lint + type-check on PR
│       ├── publish.yml         # ADD: npm publish on GitHub release
│       └── registry.yml        # ADD: verify registry.json not stale
├── .changeset/                 # ADD: changeset config
│   └── config.json
├── turbo.json                  # ADD: parallel/cached builds
├── registry/
│   ├── moving-border/          # REFACTOR: per-component directories
│   │   ├── component.tsx
│   │   ├── demo.tsx
│   │   └── docs.ts
│   ├── ...
│   └── config.ts               # keeps deps + tailwindConfig, no inline source
├── scripts/
│   └── build-registry.ts       # ENHANCE: generate configs + copy to www + split JSON
├── packages/cli/
│   └── src/commands/
│       └── add.ts              # ENHANCE: per-component fetch strategy
├── apps/www/
│   ├── public/
│   │   └── registry/           # REFACTOR: per-component JSON files
│   │       ├── index.json
│   │       └── [slug].json
│   └── config/                 # MAKE GENERATED (not hand-edited)
│       ├── components.ts       # auto-generated by build-registry.ts
│       ├── demos.tsx           # auto-generated
│       └── docs-scenarios.ts   # auto-generated
├── SECURITY.md                 # ADD
├── CONTRIBUTING.md             # ADD
├── BUILD.md                    # ADD
└── CHANGELOG.md                # ADD (auto-generated by changesets)
```

---

## 13. Prioritized Action Plan

### Priority 1 — CI/CD Foundation

**Unblocks:** Contributor PRs can be automatically verified.

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm test
      - run: pnpm --dir apps/www lint
      - run: pnpm --dir packages/cli build
      - run: pnpm build:registry && git diff --exit-code registry.json
```

The last step (`git diff --exit-code`) fails the build if `registry.json` is stale, enforcing that it's always rebuilt before commit.

---

### Priority 2 — Registry Split (Biggest User-Facing Win)

**Impact:** CLI payload per install drops from 304 KB to ~11 KB (96% reduction).

**Steps:**
1. Modify `build-registry.ts` to output both monolith + split files
2. Update CLI `add.ts` fetch strategy:
   ```typescript
   // Step 1: lightweight index (slug validation only)
   const index = await fetchJSON(`${url}/registry/index.json`)
   if (!index.components.includes(slug)) {
     throw new Error(`Component not found: ${slug}`)
   }
   // Step 2: fetch only the requested component (~3 KB)
   const component = await fetchJSON(`${url}/registry/${slug}.json`)
   ```
3. Keep monolith `registry.json` at root for backwards compatibility during transition
4. Update cache strategy: cache per-component files individually (longer TTL acceptable)

---

### Priority 3 — Release Automation

**Unblocks:** Community contributions can be released without maintainer manual work.

```bash
pnpm add -Dw @changesets/cli
pnpm changeset init
```

**Contributor workflow:**
```bash
pnpm changeset          # Interactive: select package + bump type + description
git add .changeset/
git commit -m "chore: add changeset"
```

**Release workflow (automated):**
1. Changesets bot opens "Version Packages" PR automatically
2. Maintainer merges PR → versions bumped, CHANGELOG updated
3. GitHub Actions publishes to npm

---

### Priority 4 — Eliminate Manual Registry Sync

**Unblocks:** No more `registry/*.tsx` ↔ `apps/www/components/ui/*.tsx` drift.

Extend `build-registry.ts`:
```typescript
// After generating registry.json, also sync component files to www
for (const component of registryComponents) {
  const srcPath = path.join("registry", `${component.name}.tsx`)
  const destPath = path.join("apps/www/components/ui", `${component.name}.tsx`)
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath)
  }
}
```

This makes `registry/*.tsx` the single source of truth and removes the manual step from CLAUDE.md.

---

### Priority 5 — Turbo Build Caching

**Impact:** Unchanged packages skip build + test. CI: ~3 min → ~30 sec on incremental changes.

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "build:registry": {
      "inputs": ["registry/**"],
      "outputs": ["registry.json", "apps/www/public/registry/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "lint": {
      "outputs": []
    }
  }
}
```

Also update root `package.json` test script:
```json
"test": "turbo run test"
```

---

### Priority 6 — Per-Component Directory Structure

**Impact:** Scales to 100+ components. Adding a component touches one directory, not three giant files.

**Migration approach:**
```bash
# For each component, create directory and move source
for tsx in registry/*.tsx; do
  slug=$(basename "$tsx" .tsx)
  mkdir -p "registry/$slug"
  mv "$tsx" "registry/$slug/component.tsx"
  # Extract demo JSX from apps/www/config/demos.tsx → registry/$slug/demo.tsx
  # Extract metadata from apps/www/config/components.ts → registry/$slug/docs.ts
done
```

**After migration:**
- `build-registry.ts` reads `registry/*/component.tsx` + `registry/*/docs.ts`
- Auto-generates `apps/www/config/components.ts`, `demos.tsx`, `docs-scenarios.ts`
- Config files become build artifacts — not hand-edited

---

### Priority 7 — Missing Documentation Files

**`SECURITY.md`** — Required. Already referenced in `add.ts:95`:
```markdown
## Reporting a Vulnerability
Email: singh.prashantking@gmail.com
Do not open a public GitHub issue for security vulnerabilities.
Response time: within 48 hours.
```

**`CONTRIBUTING.md`** — For contributors:
- Prerequisites and local setup
- How to add a new component (steps from CLAUDE.md)
- Registry sync process
- Commit conventions (Conventional Commits)
- PR guidelines

**`BUILD.md`** — First-time setup:
- Node 18+, pnpm 8.12.1
- `pnpm install`
- `pnpm build:registry`
- `cd apps/www && pnpm dev`

---

### Priority 8 — Tailwind Config Merge Tests

**Impact:** Most complex CLI code path (`add.ts:258–419`) currently has zero tests.

New file: `packages/cli/src/commands/add-tailwind.test.ts`

Required test cases:
1. Merges animations into empty tailwind config
2. Merges animations into existing config without clobbering existing values
3. Handles `tailwind.config.js` (JS, not TS)
4. Handles missing `theme.extend` section
5. Handles malformed config gracefully (no crash)
6. Idempotent — running twice produces same output

---

## 14. Appendix — File Inventory

### Registry Source Files (42 Components)

| File | Size | Phase |
|------|------|-------|
| `registry/moving-border.tsx` | 3.2 KB | 1 |
| `registry/typewriter-text.tsx` | 3.8 KB | 1 |
| `registry/3d-tilt-card.tsx` | 4.1 KB | 1 |
| `registry/animated-tabs.tsx` | 3.5 KB | 1 |
| `registry/spotlight-card.tsx` | 2.8 KB | 1 |
| `registry/infinite-marquee.tsx` | 3.1 KB | 1 |
| `registry/scroll-reveal.tsx` | 2.4 KB | 1 |
| `registry/aurora-background.tsx` | 4.6 KB | 1 |
| `registry/magnetic-button.tsx` | 2.9 KB | 1 |
| `registry/meteors-card.tsx` | 3.0 KB | 1 |
| `registry/morphing-modal.tsx` | 4.2 KB | 1 |
| `registry/floating-dock.tsx` | 3.7 KB | 1 |
| `registry/animated-glowing-text-outline.tsx` | 5.3 KB | 2 |
| `registry/gradient-text-reveal.tsx` | 2.7 KB | 2 |
| `registry/flip-card.tsx` | 2.3 KB | 2 |
| `registry/hover-reveal-card.tsx` | 3.4 KB | 2 |
| `registry/dot-grid-background.tsx` | 3.8 KB | 2 |
| `registry/notification-stack.tsx` | 4.1 KB | 2 |
| `registry/skeleton-shimmer.tsx` | 2.6 KB | 2 |
| `registry/bento-grid.tsx` | 7.1 KB | 2 |
| `registry/confetti-burst.tsx` | 2.6 KB | 2 |
| `registry/drawer-slide.tsx` | 3.9 KB | 2 |
| `registry/animated-timeline.tsx` | 18.1 KB | 2 |
| `registry/scramble-text.tsx` | 3.2 KB | 2 |
| `registry/count-up.tsx` | 2.2 KB | 2 |
| `registry/horizontal-scroll-gallery.tsx` | 4.8 KB | 2 |
| `registry/particle-field.tsx` | 5.1 KB | 3 |
| `registry/interactive-cursor.tsx` | 4.0 KB | 3 |
| `registry/morphing-card-stack.tsx` | 6.2 KB | 3 |
| `registry/radial-menu.tsx` | 4.9 KB | 3 |
| `registry/limelight-nav.tsx` | 5.8 KB | 3 |
| `registry/data-table.tsx` | 22.8 KB | 3 |
| `registry/ripple.tsx` | 2.8 KB | 3 |
| `registry/border-beam.tsx` | 3.1 KB | 3 |
| `registry/nested-comments.tsx` | 5.4 KB | 3 |
| `registry/shiny-text.tsx` | 2.5 KB | 4 |
| `registry/blur-reveal.tsx` | 1.7 KB | 4 |
| `registry/word-rotate.tsx` | 2.9 KB | 4 |
| `registry/cursor-trail.tsx` | 3.3 KB | 4 |
| `registry/pen-cursor.tsx` | 3.6 KB | 4 |
| `registry/glow-hero-section.tsx` | 4.2 KB | 4 |
| `registry/multi-step-auth-card.tsx` | 8.9 KB | 4 |

### Critical Source Files

| File | Size | Purpose |
|------|------|---------|
| `packages/cli/src/commands/add.ts` | 16.7 KB | Core CLI install logic |
| `apps/www/config/components.ts` | 127.5 KB | Component metadata (hand-maintained) |
| `apps/www/config/demos.tsx` | 88.7 KB | Demo implementations (hand-maintained) |
| `apps/www/config/docs-scenarios.ts` | 47.3 KB | Documentation content (hand-maintained) |
| `registry.json` | 304 KB | Generated registry artifact |
| `apps/www/public/registry.json` | 304 KB | Copy served by Next.js |

### Test Files

| File | Size | Environment |
|------|------|-------------|
| `packages/cli/src/commands/add.test.ts` | 3.8 KB | Node (Vitest) |
| `packages/cli/src/npm-dependency-name.test.ts` | 1.8 KB | Node (Vitest) |
| `apps/www/tests/accessibility.test.tsx` | 3.4 KB | jsdom (Vitest) |
| `apps/www/tests/component-sync.test.ts` | 1.3 KB | jsdom (Vitest) |
| `apps/www/tests/components.test.tsx` | 0.8 KB | jsdom (Vitest) |
| `apps/www/tests/interaction.test.tsx` | 2.3 KB | jsdom (Vitest) |

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Root monorepo scripts |
| `pnpm-workspace.yaml` | Workspace definition |
| `tsconfig.json` | Shared TypeScript config |
| `packages/cli/package.json` | CLI package (published to npm) |
| `packages/cli/tsconfig.json` | CLI TypeScript config |
| `apps/www/package.json` | Docs site package |
| `apps/www/next.config.ts` | Next.js + CSP headers |
| `.husky/pre-commit` | Git hook entry |
| `scripts/pre-commit.sh` | Hook: tests + lint |

---

*This document is gitignored (`/docs/repo-ui-audit.local.md`) and is for internal planning only.*
