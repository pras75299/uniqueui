# Changesets

This directory contains changesets — short markdown files that describe changes to versioned packages.

## Creating a changeset

Run the following from the repo root:

```bash
pnpm changeset
```

This will interactively prompt you to:
1. Select which packages changed (select `packages/cli` for CLI changes)
2. Choose a bump type (`patch` for fixes, `minor` for new features, `major` for breaking changes)
3. Write a short summary of the change

Commit the generated `.changeset/*.md` file alongside your code changes.

## Release process

1. The changesets bot opens a "Version Packages" PR automatically when changesets accumulate
2. Merging that PR bumps package versions and updates `CHANGELOG.md`
3. The publish GitHub Action runs automatically and publishes the new version to npm

## Manual release

```bash
pnpm version-packages   # Bump versions and update CHANGELOG
pnpm release            # Build + publish to npm
```
