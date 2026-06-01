---
name: registry-rebuild-verify
description: Rebuild the UniqueUI registry and confirm the generated artifact diff is empty or expected. Use after editing anything under registry/ (component.tsx, per-slug manifests, manifest.json, demos) or whenever you need to confirm generated output matches source before committing.
---

# Registry Rebuild & Verify

Encodes the acceptance test: **generated registry output is a deterministic function of
the source in `registry/`.** After any source edit, the rebuilt artifacts must change only
in the files your edit explains — nothing else.

Use this so the build-artifact diff is checked mechanically instead of hand-eyeballed in
`registry.json`.

## When to run

- After editing `registry/{slug}/component.tsx`, `registry/components/{slug}.json`,
  `registry/manifest.json`, `registry/{slug}/demo.tsx`, or `registry/demos/*`.
- Before committing any registry change.
- To confirm a clean tree: a no-op rebuild should produce **zero** diff.

## Generated artifacts (never hand-edit these)

`pnpm build:registry` regenerates all of:

- `registry.json`
- `apps/www/public/registry.json` and `apps/www/public/registry/*.json`
- `apps/www/public/r/*.json` (+ `r/registry.json`)
- `apps/www/components/ui/*.tsx` (synced docs copies)
- `apps/www/config/components.ts`, `apps/www/config/demos.tsx`, `apps/www/config/docs-scenarios.ts`

## Steps

1. **Start from a known state.** Stage or note your *source* edits under `registry/`.
   ```bash
   git status --short
   ```

2. **Rebuild.**
   ```bash
   pnpm build:registry
   ```

3. **Inspect the diff.**
   ```bash
   git status --short
   git diff --stat
   ```

4. **Classify the diff. It must be one of:**
   - **Empty** — expected when source was already in sync (no-op rebuild). ✅
   - **Limited to the slug(s) you edited** — the source `.tsx`/manifest you changed, plus
     its derived copies (`apps/www/components/ui/{slug}.tsx`, `public/registry/{slug}.json`,
     `public/r/{slug}.json`) and the aggregate manifests (`registry.json`,
     `public/registry.json`). ✅
   - **Touches unrelated slugs or configs you didn't edit** — ❌ STOP. Either the source
     was out of sync before your change (commit the regen separately and investigate), or
     someone hand-edited a generated file. Surface it; do not bury it in your commit.

5. **Validate schema + checks.**
   ```bash
   pnpm registry:validate
   ```

## Confirming a no-op (clean) tree

To prove generated output is already in sync with source — useful before a release or
after a `main` pull:

```bash
git stash --include-untracked   # if you have unrelated WIP; otherwise skip
pnpm build:registry
git status --short               # MUST be empty
```

A non-empty status here means a generated file drifted from source on `main` — report it.

## Output

State the result explicitly:

- "No-op: rebuild produced an empty diff." or
- "Expected: diff limited to `<slug>` files: <list>." or
- "Unexpected diff in <files> — investigating before commit."

Per CLAUDE.md Rule 12, never report "verified" if `build:registry` or `registry:validate`
errored or was skipped.
