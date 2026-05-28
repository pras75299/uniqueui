# ADR 0002: Split registry metadata into per-slug manifests

## Status

Accepted - 2026-05-28. Supersedes [ADR 0001](0001-registry-docs-metadata-storage.md).

## Context

[ADR 0001](0001-registry-docs-metadata-storage.md) kept docs metadata in a single
`registry/docs.json` and registry build config in a single `registry/config.ts`,
with a documented migration trigger: split when **two or more** friction
conditions hold for more than one release cycle.

By 2026-05 the first trigger was met objectively — `registry/docs.json` had grown
to ~4,200 lines / ~150 KB, well past the ~1,500-line / ~200 KB threshold (C1) — and
the file pairing made every new component touch two large, frequently-rebased
monoliths (`config.ts` + `docs.json`). The friction monitor that ADR 0001
introduced (`scripts/docs-metadata-friction.mjs`) had served its purpose of
signalling when to act.

## Decision

Author registry metadata as **one manifest per component** at
`registry/components/<slug>.json`, aggregated by `scripts/build-registry.ts`.

Each manifest merges the two former concerns for that component:

```jsonc
{
  "slug": "moving-border",
  "registry": {                 // was an entry in registry/config.ts
    "dependencies": ["motion", "clsx", "tailwind-merge"],
    "files": [{ "path": "moving-border/component.tsx", "type": "registry:ui" }],
    "tailwindConfig": { /* optional, Tailwind v3 */ },
    "tailwindCss": "/* optional, Tailwind v4 */"
  },
  "docs": {                     // was an entry in registry/docs.json components[]
    "name": "Moving Border",
    "description": "...",
    "icon": "LucideSparkles",
    "props": [ /* ... */ ],
    "docs": { "overview": "...", "scenarios": [ /* ... */ ] }
  }
}
```

A small `registry/manifest.json` holds the cross-cutting bits that are not
per-component:

```jsonc
{
  "demos": { "sourceFile": "registry/demos.tsx" },
  "order": [ /* install / registry.json order — was registry/config.ts order */ ],
  "docsOrder": [ /* docs-site display order — was registry/docs.json order */ ]
}
```

Two order arrays are intentional: the registry array order (drives `registry.json`,
the split payloads, and the shadcn manifest) and the docs display order (drives
`apps/www/config/components.ts` grouping) were historically independent, so both
are preserved verbatim.

The build script appends the shared `cn` util to every component's files (it was
duplicated inline in `registry/config.ts`), so manifests declare only their own
files.

## Consequences

- **Byte-identical output.** The migration was validated by rebuilding and
  diffing: `registry.json`, `apps/www/public/**`, and `apps/www/components/ui/**`
  are unchanged; only the generated-file banner string moved from
  `registry/docs.json` to `registry/components/*.json`.
- **Lower merge friction.** Adding a component creates one new file and appends
  two one-line entries to `registry/manifest.json` instead of editing two
  monoliths.
- **Component-local ownership** is now possible via CODEOWNERS on
  `registry/components/<slug>.json`.
- **Retired tooling.** The friction monitor (`scripts/docs-metadata-friction.mjs`,
  its test, the `docs:metadata-friction` npm script, and
  `docs/maintainers/docs-metadata-friction-log.md`) is removed — it existed only to
  decide when to do this split.
- **New build edge cases** the script guards: `manifest.order`/`docsOrder` must
  match the set of files in `registry/components/`, and each file's `slug` must
  match its filename.

## Deviations from ADR 0001's planned path

ADR 0001 sketched `registry/<component>/docs.json` and a compatibility
`registry/docs.json` artifact during transition. We instead:

- Co-located **both** registry build config and docs metadata in a single
  `registry/components/<slug>.json` (ADR 0001 only planned to split docs).
- Skipped the compatibility `registry/docs.json` artifact: there are no external
  consumers of the source file (the published artifacts under
  `apps/www/public/` are unchanged), so a transition shim added cost without
  value.
