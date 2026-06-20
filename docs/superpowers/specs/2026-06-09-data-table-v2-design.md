# DataTable v2 — Design Spec

**Date:** 2026-06-09
**Branch:** `feat/data-table-enhance`
**Status:** Approved (pending spec review)

## Goal

Rebuild UniqueUI's `data-table` into a best-in-class, **zero-external-dependency**
data grid that stays fast and reliable from **10 rows to 100,000 rows** and up to
**~50–80 columns**. A developer choosing UniqueUI's DataTable "should not regret it."

## Locked Decisions

1. **Hand-rolled, zero external deps** — no `@tanstack/*` or any library. Custom row
   virtualization (windowing) is mandatory for the 100k path.
2. **Breaking change is acceptable** — the published `data-table` has no real users;
   prioritize the best API over backward compatibility. Bump major version, document
   the migration in the changelog.
3. **Typed rows + column accessors/renderers** — replaces the old
   `Record<string, ReactNode>` cells.
4. **Auto mode-switch** between a virtualized engine and a standard engine.
5. **"Variants" = feature presets** (`basic` / `advanced` / `enterprise`). No visual
   style variants were requested.
6. **Columns: ~50–80 max**, efficiently rendered (memoization + native horizontal
   scroll + frozen columns). **No column virtualization.**

## API

```ts
type SortDirection = "asc" | "desc";

interface Column<T> {
  id: string;
  header: React.ReactNode;
  accessor: (row: T) => unknown;        // raw value for sort/search/group
  cell?: (row: T) => React.ReactNode;   // optional render; defaults to String(value)
  sortType?: "string" | "number" | "date" | "auto"; // default "auto" (inferred)
  sortable?: boolean;                    // default depends on preset
  searchable?: boolean;                  // default true
  width?: number;                        // px; aids virtualization + freeze
  align?: "left" | "center" | "right";
  freeze?: "left" | "right";             // per-column pin
  columns?: Column<T>[];                 // nested = column group (multi-level header)
  rowSpan?: boolean;                     // merge equal consecutive values (standard engine)
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  getRowId: (row: T) => string;          // REQUIRED — stable key for select/expand/virt

  preset?: "basic" | "advanced" | "enterprise";

  // Feature flags — a preset sets defaults; explicit props override.
  searchable?: boolean;
  paginated?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  sortable?: boolean;
  multiSort?: boolean;
  selectable?: boolean;
  selectedIds?: string[];                       // controlled selection
  onSelectionChange?: (ids: string[]) => void;
  expandable?: boolean;
  renderExpanded?: (row: T) => React.ReactNode;
  expandedIds?: string[];                       // controlled expansion
  onExpandedChange?: (ids: string[]) => void;
  groupBy?: string;                             // column id → standard engine, collapsible groups
  virtualized?: boolean;                        // force on/off; default = auto
  virtualizeThreshold?: number;                 // default 100
  rowHeight?: number;                           // estimate for windowing; default ~44
  maxHeight?: number | string;                  // scroll container height
  stickyHeader?: boolean;
  pinnedRows?: string[];                        // row ids pinned under the header
  onSort?: (sort: Array<{ id: string; direction: SortDirection }>) => void;

  // Existing visual props carried forward:
  theme?: "light" | "dark";
  border?: boolean;
  headerTextColor?: string;
  bodyTextColor?: string;
  headerBackground?: string;
  bodyBackground?: string;
  className?: string;
}
```

- Generic `<T>` for full consumer type safety.
- `getRowId` is required; selection, expansion, pinning, and virtualization keys all
  hang off it.

## Two Engines, One Component (Auto Mode-Switch)

### Virtualized engine (default for large flat data)
- Active when `data.length > virtualizeThreshold` (default 100) **and** no `groupBy`/
  `rowSpan` is in use.
- Hand-rolled vertical windowing: a scroll container with `maxHeight`, a spacer sized to
  `total × rowHeight`, render only the visible window plus a small overscan.
- `stickyHeader` and frozen columns remain fixed during scroll.
- Handles 100,000 rows: only the visible window (~30 rows) is in the DOM.
- Row height: estimated from `rowHeight`; expanded rows are measured so the spacer stays
  correct.

### Standard engine (rich layout / small data)
- Active when `groupBy` or any column `rowSpan` is enabled (or data is small).
- Renders real `<tbody>` rows. Supports:
  - **Rowspan** — merge equal consecutive accessor values into a spanning cell.
  - **Row groups** — `groupBy` produces collapsible group header rows.
  - **Expansion** — same `renderExpanded` contract.
- Intended for paginated or ≤ ~10k datasets.

### Forcing
- `virtualized` prop forces either engine. Forcing `virtual` while `rowSpan`/`groupBy`
  or `paginated` is set logs a dev warning and ignores the unsupported feature.

## Feature Behaviors

- **Search** — global, debounced (~150ms), case-insensitive, over `searchable` columns'
  accessor values. Runs before sort → paginate/virtualize.
- **Sort** — header click cycles asc → desc → none. **Shift-click** adds secondary/
  tertiary keys (multi-sort) with visible priority badges. Typed comparators
  (number/date/string, inferred when `sortType: "auto"`).
- **Multi-select** — checkbox column; header tri-state select-all selects **all filtered
  rows** (not just the visible page/window). Controlled (`selectedIds` +
  `onSelectionChange`) and uncontrolled.
- **Row expansion** — chevron toggle column; `renderExpanded(row)` panel. Works in both
  engines; the virtualizer measures expanded height.
- **Freeze** — columns pinned left/right via sticky offsets (improved measurement of the
  current implementation). **Frozen rows** = `pinnedRows` stuck below the header. Sticky
  header (+ optional footer).
- **Column groups** — nested `columns` render a two-level `<thead>`; compatible with
  virtualization.
- **Row groups / rowspan** — standard engine only.
- **Scroll** — vertical (container + windowing) and horizontal (native overflow); frozen
  edges stay put on both axes.

## Presets ("Variants")

- `basic` → search + pagination + single sort.
- `advanced` → basic + multi-sort + multi-select + row expansion + frozen columns +
  sticky header.
- `enterprise` → advanced + column groups + virtualization; `groupBy`/`rowSpan` available.
- A preset only sets defaults; any explicit prop wins.
- Docs page shows one section per preset and per feature so users can preview and copy.

## Structure

- **One file** per registry convention: `registry/data-table/component.tsx`. Internally
  organized with local hooks (`useWindowing`, `useSortSearch`, `useSelection`,
  `useExpansion`) and pure helper functions. Expected size ~1.2–1.6k lines — the cost of
  the convention plus scope.
- Demo updated at `registry/data-table/demo.tsx`; demo keys appended to
  `registry/demos/demo-key-order.json`.
- Per-slug manifest `registry/components/data-table.json` updated: new props table,
  `docs.scenarios`, tags, accessibility, motion metadata, and a `changelog` entry with a
  bumped **major** version noting the breaking API change.
- `pnpm build:registry` regenerates `registry.json`, `apps/www/public/registry/*`,
  `apps/www/public/r/*`, and the synced docs UI copy.

## Performance Targets (Success Criteria)

- 100,000 rows scroll at ~60fps; only the visible window is in the DOM.
- Search/sort on 100,000 rows completes in < ~150ms (typed comparison, single pass).
- No layout thrash during scroll (transform/translate offsets, batched measurement).
- Up to 80 columns × ~30 visible rows (~2,400 cells) renders without jank.
- Expansion animation respects `prefers-reduced-motion`.

## Accessibility

- `aria-sort` on sortable headers; roving focus.
- `aria-selected` on selected rows; `aria-expanded` on expandable rows.
- Proper `scope` on header cells; `<caption>`/labelled region.
- `aria-rowcount` / `aria-rowindex` reflect the **true** filtered total in the virtualized
  engine, so screen-reader users get correct totals despite windowing.

## Testing

Vitest in `apps/www/tests`:
- Sort: single + multi, typed (number/date/string), direction cycling.
- Search: filter correctness, debounced, searchable-column scoping.
- Selection: select-all selects all filtered rows; controlled/uncontrolled parity.
- Pagination math and page clamping.
- Mode-switch: selection/expansion identity preserved across engines.
- Windowing: visible-window slice math and spacer sizing.
- Registry `component-sync` test (source ↔ synced docs copy).

## Out of Scope (v1)

1. **Column virtualization** — rows are windowed; columns are not. Target is 100k rows,
   up to ~80 columns.
2. **Server-side data** — client-side only; data lives in memory.
3. **Rowspan / row-grouping at 100k simultaneously** — those use the standard engine
   (paginated / ≤ ~10k), per the auto mode-switch.

## Build / Verification Gate (per CLAUDE.md)

Before any PR: `pnpm build:registry` (clean diff), `pnpm test`, `apps/www` lint,
typecheck, and the component-merge-review checklist (CodeRabbit recurring findings).
