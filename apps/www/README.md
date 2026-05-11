# UniqueUI Docs App

This workspace contains the public docs and demo site for UniqueUI.

## What Lives Here

- `app/` — App Router pages and layouts
- `components/` — docs UI and synced component previews
- `config/` — generated docs metadata consumed by the site
- `public/registry/` — generated registry payloads used by the docs experience
- `public/r/` — generated shadcn-compatible registry payloads
- `tests/` — docs-site and component integration tests

## Running Locally

From the repository root:

```bash
pnpm dev
```

Or directly from this workspace:

```bash
pnpm dev
```

Then open `http://localhost:3000`.

## Generated Files

Parts of this workspace are generated from the root `registry/` source of truth.

Do not hand-edit generated output under:

- `components/ui/`
- `config/components.ts`
- `config/docs-scenarios.ts`
- `config/demos.tsx`
- `public/registry/`
- `public/r/`

Regenerate them from the repo root with:

```bash
pnpm build:registry
```

## Common Tasks

```bash
# Run the docs app
pnpm dev

# Run docs tests
pnpm test

# Build the app
pnpm build
```

## Source Of Truth

If you are adding or changing a component, start in the repo root:

- component source: `registry/<slug>/component.tsx`
- docs metadata: `registry/docs.json`
- demo mappings: `registry/demos.tsx`

Contributor workflow details live in the root [`CONTRIBUTING.md`](../../CONTRIBUTING.md) and [`BUILD.md`](../../BUILD.md).
