# Docs Metadata Friction Log

This log tracks lightweight, release-over-release friction signals for the centralized `registry/docs.json` model.

Use it to decide when ADR 0001 migration triggers are actually sustained in real maintenance work, without changing the current model early.

## How maintainers use this

1. Run `pnpm docs:metadata-friction --append` once per release cycle (or monthly).
2. Fill the manual columns in the new row:
   - `C2 conflicts`: number of `registry/docs.json` conflict incidents in the window.
   - `C3 ownership need`: `yes` if component-local ownership/CODEOWNERS/lint scope pressure is active.
   - `C4 tooling need`: `yes` if build/tooling needs independent per-component metadata loading.
3. If `met >= 2` for more than one release cycle, open an issue/RFC to start ADR migration planning.

## Trigger mapping (ADR 0001)

- `C1`: `registry/docs.json` exceeds ~1,500 lines or ~200 KB.
- `C2`: repeated metadata conflicts (3+ incidents/month).
- `C3`: contributor ownership boundaries require component-local metadata.
- `C4`: tooling/build requires per-component metadata loading.

<!-- DOCS_METADATA_FRICTION_LOG_START -->
| Date | Lines | Size (KB) | Touches (30d) | C1 size/lines | C2 conflicts (manual) | C3 ownership need (manual) | C4 tooling need (manual) | Met count | Action |
| --- | ---: | ---: | ---: | --- | --- | --- | --- | ---: | --- |
<!-- DOCS_METADATA_FRICTION_LOG_END -->
