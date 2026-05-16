---
"uniqueui-cli": major
---

Add `uniqueui list`, `--dry-run` / `--force` flags on `add`, an overwrite prompt for existing component files, and Bun lockfile detection.

**New: `uniqueui list`** — prints every component the registry exposes, sorted alphabetically with descriptions when available. Supports the same `--url` flag as `add`, and accepts direct `.json` paths (e.g. `--url ./apps/www/public/r/registry.json`).

```bash
npx uniqueui list
npx uniqueui list --url ./local-registry
```

**New: `--dry-run` on `add`** — prints every file that would be written and every dependency that would be installed without touching the filesystem or invoking the package manager.

**New: `--force` on `add`** — overwrites existing component files without prompting.

**New: Bun lockfile detection** — `bun.lock` / `bun.lockb` is now recognized first, ahead of pnpm / yarn / npm.

**Breaking: `add` no longer silently overwrites existing component files.** When `components/ui/<slug>.tsx` already exists, the CLI now prompts with `skip` / `overwrite` / `diff`; non-interactive shells default to skip with a warning that points to `--force`.

*Migration:* CI / script users who relied on the old always-overwrite behavior should pass `--force`:

```diff
- npx uniqueui add moving-border --yes
+ npx uniqueui add moving-border --yes --force
```
