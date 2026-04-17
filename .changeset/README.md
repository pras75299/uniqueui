# Changesets

This directory holds [Changesets](https://github.com/changesets/changesets) — small Markdown files that describe **user-visible** changes to versioned packages (`packages/cli`).

## Creating a changeset

From the repo root:

```bash
pnpm changeset
```

You will be prompted to:

1. Select which packages changed (choose **`uniqueui-cli`** / `packages/cli` for CLI work).
2. Pick a semver bump:
   - **patch** — bug fixes, internal refactors with no CLI behavior change, docs-only fixes that ship with the package.
   - **minor** — new features, new flags or registry behavior that is backward compatible.
   - **major** — breaking CLI API, removed commands, or incompatible registry/URL behavior.
3. Write a **summary** (see below).

Commit the generated `.changeset/*.md` next to your code. Do not hand-edit `CHANGELOG.md` at the root or under `packages/cli` — `pnpm version-packages` updates those from changesets.

## Writing summaries consumers will understand

The first line of a changeset becomes the changelog entry for that bump. Prefer **what users get**, not how you implemented it.

| Avoid | Prefer |
|--------|--------|
| "refactor registry sync" | "Fix `uniqueui add` when the registry is served from a subdirectory URL" |
| "update tests" | (no changeset unless it fixes user-visible bugs — use **patch** only if something shipped broken) |
| "WIP" / internal ticket IDs only | A short sentence a downstream developer can grep in release notes |

**Patch example:**

> Fix Tailwind merge when `theme.extend` already defines `keyframes`.

**Minor example:**

> Add support for fetching a component directly from a `…/registry/<slug>.json` URL.

**Major example:**

> **Breaking:** Require Node 18 or later; older Node versions are no longer supported.

If a PR mixes user-facing fixes and internal-only chores, split changesets or write the summary around the **shipping** change.

## Release process

1. Merging changesets accumulates entries. The **Version Packages** / release automation opens or updates a PR that runs `pnpm version-packages`.
2. That PR bumps `packages/cli` version and refreshes `packages/cli/CHANGELOG.md`; the root `CHANGELOG.md` is synced by the same script.
3. Publishing runs via the publish workflow after the release PR merges.

## Manual release (maintainers)

```bash
pnpm version-packages   # Bump versions and update CHANGELOG files
pnpm release            # Registry build + CLI build + publish to npm
```

See root `BUILD.md` and `CONTRIBUTING.md` for when a changeset is required.
