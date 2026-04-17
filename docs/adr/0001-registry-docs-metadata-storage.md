# ADR 0001: Keep `registry/docs.json` Centralized (for now)

## Status

Accepted - 2026-04-16

## Context

The docs system currently uses centralized metadata maps (for example `apps/www/config/docs-scenarios.ts`) and a single registry build pipeline (`pnpm build:registry`) that already generates shared artifacts (`registry.json`, `apps/www/public/registry.json`, and per-component docs payloads under `apps/www/public/registry/`).

We need a decision on whether `registry/docs.json` should remain one centralized file or be split into per-component metadata files.

## Decision

Keep `registry/docs.json` centralized for now.

If `registry/docs.json` is used or expanded, it is the canonical source for docs metadata and should be edited directly as one file. Build scripts may still generate derived per-component output for runtime delivery, but authoring remains centralized.

## Why This Fits Current Flow

- Matches current contributor workflow: one place to edit docs metadata, similar to `registry/config.ts` and `apps/www/config/docs-scenarios.ts`.
- Keeps `pnpm build:registry` simple and deterministic with fewer file-discovery edge cases.
- Avoids introducing a migration and validation surface while the docs metadata model is still evolving.
- Preserves easy review ergonomics: one diff shows docs metadata changes together.

## Tradeoffs

- Large-file growth can increase merge conflicts as component count and contributor count rise.
- Per-component ownership is less explicit than colocated metadata files.
- Partial updates are harder if teams want strict boundaries by component folder.

## Authoring friction (qualitative signals)

Before the numeric thresholds below bite, you may already feel friction: long scroll/edit sessions in one file, difficulty reviewing unrelated docs changes in a single PR, or repeated rebases touching `registry/docs.json`. Treat those as prompts to **open a discussion** (issue or RFC); they do not by themselves require migration until the migration triggers are met.

## Migration trigger

Revisit this decision and split to per-component metadata files when **two or more** of these conditions hold for **more than one release cycle**:

1. `registry/docs.json` exceeds ~1,500 lines or ~200 KB on disk.
2. Repeated PR conflicts occur in docs metadata (3+ conflict incidents per month).
3. Contributors need component-local ownership with CODEOWNERS or automated lint scopes.
4. Build or tooling requires independent metadata loading per component.

If only one condition is true, prefer process changes (smaller PRs, section comments in `registry/docs.json`, stricter merge cadence) before starting a migration.

## Planned Migration Path (when triggered)

1. Introduce `registry/<component>/docs.json` as the new authoring format.
2. Update generator to glob and validate per-component files, then compose a deterministic aggregate.
3. Keep generating a compatibility `registry/docs.json` artifact for one transition phase.
4. Add CI checks to prevent drift between per-component sources and aggregate output.
5. Remove compatibility path only after CLI/docs consumers are fully switched.
