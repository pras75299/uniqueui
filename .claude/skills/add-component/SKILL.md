---
name: add-uniqueui-component
description: End-to-end workflow for adding a new UniqueUI component or hero block. Use when creating registry components, hero blocks, or when asked to add a component to UniqueUI.
---

# Add UniqueUI Component

Use this skill when adding a new component or hero block to the UniqueUI registry.

## Mechanical setup (deterministic)

Run the scaffold script — do not hand-create manifest paths:

```bash
pnpm new:component <slug> [--hero] [--tags tag1,tag2]
```

This creates:

- `registry/{slug}/component.tsx` or `registry/blocks/hero/{short}/component.tsx`
- `registry/components/{slug}.json` with ADR 0003 metadata defaults and `changelog` stub at `1.0.0`
- One-line inserts in `registry/manifest.json` (`order` + `docsOrder`)

Read `CLAUDE.md` for architecture rules. **Never** edit generated files under `apps/www/components/ui` or `apps/www/config/components.ts` by hand.

## Judgment work (you implement)

1. **Component design** — implement `component.tsx` with motion, `className` + `cn`, reduced-motion guards where needed.
2. **Manifest docs** — fill `docs.name`, `description`, `props`, `usageCode`, and nested `docs.overview` / `docs.scenarios[]` in `registry/components/{slug}.json`.
3. **Metadata** — set on the same manifest file:
   - `tags` (≥1, lowercase kebab-case)
   - `accessibility` (`audited` | `unaudited` | `n/a`)
   - `motion` (only if the component animates): `{ "reducedMotion": "full"|"partial"|"none", "performanceNotes"?: "..." }`
     - Add `performanceNotes` when using `"partial"` or `"none"` to document why the OS preference isn't fully honored.
   - `compatibility` / `peerDependencies` if non-default
4. **Demo** — add entry to `registry/{slug}/demo.tsx` and append the demo key to `registry/demos/demo-key-order.json` (shared helpers live in `registry/demos/shared.tsx`; `pnpm build:registry` assembles `apps/www/config/demos.tsx`).
5. **Changelog** — prepend a semver entry to the `changelog` array on `registry/components/{slug}.json` when shipping user-visible changes.

## Merge gate checklist

Before finishing, verify section G in `backlogs.md` / `CLAUDE.md`:

- `"use client"` where needed
- Motion springs preferred; no layout-thrash animations
- `useReducedMotion` or static fallback for ambient animation
- Cleanup rAF/subscriptions on unmount
- No cross-imports from other registry components
- Run `pnpm build:registry` — generated artifact diff must be empty except your new slug's files
- Run `pnpm test:repo`, `pnpm check:reduced-motion`, `pnpm registry:validate`

## Hero blocks

- Slug must be `hero-{short-name}` with `--hero` flag.
- Source path: `registry/blocks/hero/{short-name}/component.tsx`.
- Set `docs.kind: "block"` and `docs.category: "Hero"` in the manifest.
