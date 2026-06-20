"use client";

import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type SortDirection = "asc" | "desc";

export interface DataTableSortRule {
  id: string;
  direction: SortDirection;
}

export type DataTablePreset = "basic" | "advanced" | "enterprise";

export interface DataTableColumn<T> {
  /** Unique column id; used for sorting, grouping, and freezing. */
  id: string;
  header: React.ReactNode;
  /** Raw value used for sorting, searching, and grouping. */
  accessor: (row: T) => unknown;
  /** Optional cell renderer; defaults to `String(accessor(row))`. */
  cell?: (row: T) => React.ReactNode;
  /** Comparator type; "auto" infers number/date/string from the data. */
  sortType?: "string" | "number" | "date" | "auto";
  /** Overrides the table-level `sortable` flag for this column. */
  sortable?: boolean;
  /** Include this column's values in global search. Default true. */
  searchable?: boolean;
  /** Fixed width in px; improves frozen-column offsets and windowing. */
  width?: number;
  align?: "left" | "center" | "right";
  /** Pin the column to an edge while horizontally scrolling. */
  freeze?: "left" | "right";
  /** Nested columns render a grouped, multi-level header. */
  columns?: DataTableColumn<T>[];
  /** Merge consecutive equal accessor values (standard engine only). */
  rowSpan?: boolean;
}

export interface DataTableProps<T>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  data: T[];
  columns: DataTableColumn<T>[];
  /** Stable row id — selection, expansion, pinning, and windowing keys. */
  getRowId: (row: T) => string;

  /** Bundles feature defaults; any explicit prop overrides the preset. */
  preset?: DataTablePreset;

  searchable?: boolean;
  paginated?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  sortable?: boolean;
  multiSort?: boolean;
  onSort?: (sort: DataTableSortRule[]) => void;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  expandable?: boolean;
  renderExpanded?: (row: T) => React.ReactNode;
  expandedIds?: string[];
  onExpandedChange?: (ids: string[]) => void;
  /** Column id to group rows by — switches to the standard engine. */
  groupBy?: string;
  /** Force the engine; defaults to automatic selection. */
  virtualized?: boolean;
  /** Row count above which flat data is windowed. Default 100. */
  virtualizeThreshold?: number;
  /** Estimated row height in px used for windowing math. Default 44. */
  rowHeight?: number;
  /** Scroll container height; required for a useful virtualized view. */
  maxHeight?: number | string;
  stickyHeader?: boolean;
  /** Row ids kept visible directly below the header. */
  pinnedRows?: string[];

  theme?: "light" | "dark";
  border?: boolean;
  headerTextColor?: string;
  bodyTextColor?: string;
  headerBackground?: string;
  bodyBackground?: string;
}

/* ------------------------------------------------------------------ */
/* Pure helpers                                                        */
/* ------------------------------------------------------------------ */

const DEFAULT_ROW_HEIGHT = 44;
const DEFAULT_VIRTUALIZE_THRESHOLD = 100;
const DEFAULT_OVERSCAN = 5;
const DEFAULT_VIRTUAL_MAX_HEIGHT = 480;
const FALLBACK_COL_WIDTH_PX = 112;
const LEADING_COL_WIDTH_PX = 44;
const PAGE_SIZE_FALLBACK = 10;
const SEARCH_DEBOUNCE_MS = 150;

export interface WindowSlice {
  start: number;
  end: number;
  padTop: number;
  padBottom: number;
}

/**
 * Visible-window slice for hand-rolled row virtualization. Spacer heights
 * (`padTop`/`padBottom`) always complement the window so the scrollbar
 * reflects the full row count.
 */
export function computeWindow({
  scrollTop,
  viewportHeight,
  rowHeight,
  rowCount,
  overscan = DEFAULT_OVERSCAN,
}: {
  scrollTop: number;
  viewportHeight: number;
  rowHeight: number;
  rowCount: number;
  overscan?: number;
}): WindowSlice {
  const safeRowHeight = Math.max(1, rowHeight);
  const visibleCount = Math.max(1, Math.ceil(viewportHeight / safeRowHeight));
  const maxFirst = Math.max(0, rowCount - visibleCount);
  const firstVisible = Math.min(
    Math.max(0, Math.floor(scrollTop / safeRowHeight)),
    maxFirst
  );
  const start = Math.max(0, firstVisible - overscan);
  const end = Math.min(rowCount, firstVisible + visibleCount + overscan);
  return {
    start,
    end,
    padTop: start * safeRowHeight,
    padBottom: Math.max(0, rowCount - end) * safeRowHeight,
  };
}

type ResolvedSortType = "string" | "number" | "date";

function inferSortType(value: unknown): ResolvedSortType {
  if (typeof value === "number") return "number";
  if (value instanceof Date) return "date";
  return "string";
}

function compareValues(
  a: unknown,
  b: unknown,
  type: ResolvedSortType
): number {
  const aMissing = a == null || (typeof a === "number" && Number.isNaN(a));
  const bMissing = b == null || (typeof b === "number" && Number.isNaN(b));
  if (aMissing && bMissing) return 0;
  if (aMissing) return 1; // missing values sort last
  if (bMissing) return -1;
  if (type === "number") return Number(a) - Number(b);
  if (type === "date") {
    return new Date(a as Date).getTime() - new Date(b as Date).getTime();
  }
  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function normalizePageSize(input: unknown, fallback: number): number {
  const n = Math.floor(Number(input));
  if (!Number.isFinite(n) || n < 1) return fallback;
  return n;
}

/** Compact page list: first, window around current, last; ellipses when gaps exist. */
function getPaginationItems(
  currentPage: number,
  totalPages: number
): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const delta = 1;
  const items: Array<number | "ellipsis"> = [1];
  if (currentPage - delta > 2) items.push("ellipsis");
  for (
    let p = Math.max(2, currentPage - delta);
    p <= Math.min(totalPages - 1, currentPage + delta);
    p++
  ) {
    items.push(p);
  }
  if (currentPage + delta < totalPages - 1) items.push("ellipsis");
  if (totalPages > 1) items.push(totalPages);
  return items;
}

interface HeaderCell<T> {
  column: DataTableColumn<T>;
  colSpan: number;
  rowSpan: number;
  leaf: boolean;
  /** Index of the first leaf column this cell spans. */
  leafIndex: number;
}

function getColumnDepth<T>(columns: DataTableColumn<T>[]): number {
  let depth = 1;
  for (const col of columns) {
    if (col.columns?.length) {
      depth = Math.max(depth, 1 + getColumnDepth(col.columns));
    }
  }
  return depth;
}

/** Leaf columns in visual order, inheriting `freeze` from group parents. */
function flattenColumns<T>(
  columns: DataTableColumn<T>[],
  parentFreeze?: "left" | "right"
): DataTableColumn<T>[] {
  const leaves: DataTableColumn<T>[] = [];
  for (const col of columns) {
    const freeze = col.freeze ?? parentFreeze;
    if (col.columns?.length) {
      leaves.push(...flattenColumns(col.columns, freeze));
    } else {
      leaves.push(freeze === col.freeze ? col : { ...col, freeze });
    }
  }
  return leaves;
}

function buildHeaderRows<T>(
  columns: DataTableColumn<T>[],
  depth: number
): HeaderCell<T>[][] {
  const rows: HeaderCell<T>[][] = Array.from({ length: depth }, () => []);
  let leafCount = 0;

  function place(col: DataTableColumn<T>, level: number) {
    if (col.columns?.length) {
      const cell: HeaderCell<T> = {
        column: col,
        colSpan: 0,
        rowSpan: 1,
        leaf: false,
        leafIndex: leafCount,
      };
      rows[level].push(cell);
      for (const child of col.columns) place(child, level + 1);
      cell.colSpan = leafCount - cell.leafIndex;
    } else {
      rows[level].push({
        column: col,
        colSpan: 1,
        rowSpan: depth - level,
        leaf: true,
        leafIndex: leafCount,
      });
      leafCount += 1;
    }
  }

  for (const col of columns) place(col, 0);
  return rows;
}

/** rowSpan column merge plan: span count at the first row of a run, 0 inside it. */
function computeRowSpans<T>(
  rows: T[],
  column: DataTableColumn<T>
): number[] {
  const spans = new Array<number>(rows.length).fill(1);
  let runStart = 0;
  for (let i = 1; i <= rows.length; i++) {
    const prev = column.accessor(rows[i - 1]);
    const same = i < rows.length && Object.is(column.accessor(rows[i]), prev);
    if (!same) {
      spans[runStart] = i - runStart;
      for (let j = runStart + 1; j < i; j++) spans[j] = 0;
      runStart = i;
    }
  }
  return spans;
}

const PRESET_DEFAULTS: Record<
  DataTablePreset,
  Partial<
    Pick<
      DataTableProps<unknown>,
      | "searchable"
      | "paginated"
      | "sortable"
      | "multiSort"
      | "selectable"
      | "expandable"
      | "stickyHeader"
    >
  >
> = {
  basic: { searchable: true, paginated: true, sortable: true },
  advanced: {
    searchable: true,
    paginated: true,
    sortable: true,
    multiSort: true,
    selectable: true,
    expandable: true,
    stickyHeader: true,
  },
  enterprise: {
    searchable: true,
    sortable: true,
    multiSort: true,
    selectable: true,
    expandable: true,
    stickyHeader: true,
  },
};

/* ------------------------------------------------------------------ */
/* Theming                                                             */
/* ------------------------------------------------------------------ */

const defaultHeaderTextColor = (theme: "light" | "dark") =>
  theme === "dark" ? "text-neutral-200" : "text-neutral-900";
const defaultBodyTextColor = (theme: "light" | "dark") =>
  theme === "dark" ? "text-neutral-300" : "text-neutral-700";
const defaultHeaderBackground = (theme: "light" | "dark") =>
  theme === "dark" ? "bg-neutral-800" : "bg-neutral-100";
const defaultBodyBackground = (theme: "light" | "dark") =>
  theme === "dark" ? "bg-neutral-950" : "bg-white";

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function DataTable<T>({
  data,
  columns,
  getRowId,
  preset,
  searchable,
  paginated,
  pageSize = PAGE_SIZE_FALLBACK,
  pageSizeOptions,
  sortable,
  multiSort,
  onSort,
  selectable,
  selectedIds,
  onSelectionChange,
  expandable,
  renderExpanded,
  expandedIds,
  onExpandedChange,
  groupBy,
  virtualized,
  virtualizeThreshold = DEFAULT_VIRTUALIZE_THRESHOLD,
  rowHeight = DEFAULT_ROW_HEIGHT,
  maxHeight,
  stickyHeader,
  pinnedRows,
  theme = "dark",
  border = false,
  headerTextColor,
  bodyTextColor,
  headerBackground,
  bodyBackground,
  className,
  ...rootProps
}: DataTableProps<T>) {
  /* ----- feature resolution: explicit prop > preset > base default ---- */
  const presetDefaults = preset ? PRESET_DEFAULTS[preset] : {};
  const searchEnabled = searchable ?? presetDefaults.searchable ?? false;
  const paginatedEnabled = paginated ?? presetDefaults.paginated ?? false;
  const tableSortable = sortable ?? presetDefaults.sortable ?? false;
  const multiSortEnabled = multiSort ?? presetDefaults.multiSort ?? false;
  const selectableEnabled = selectable ?? presetDefaults.selectable ?? false;
  const expandEnabled =
    (expandable ?? presetDefaults.expandable ?? false) && !!renderExpanded;
  const stickyHeaderEnabled =
    stickyHeader ?? presetDefaults.stickyHeader ?? false;

  /* ----- columns ------------------------------------------------------ */
  const leafColumns = useMemo(() => flattenColumns(columns), [columns]);
  const headerDepth = useMemo(() => getColumnDepth(columns), [columns]);
  const headerRows = useMemo(
    () => buildHeaderRows(columns, headerDepth),
    [columns, headerDepth]
  );
  const anyRowSpan = leafColumns.some((c) => c.rowSpan);

  /* ----- engine decision ---------------------------------------------- */
  const wantsGrouping = !!groupBy || anyRowSpan;
  const isVirtual =
    virtualized ??
    (!paginatedEnabled && !wantsGrouping && data.length > virtualizeThreshold);
  const groupingActive = wantsGrouping && !(virtualized === true);
  const warnedRef = useRef(false);
  const conflictingForce =
    virtualized === true && (wantsGrouping || paginatedEnabled);
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" &&
      conflictingForce &&
      !warnedRef.current
    ) {
      warnedRef.current = true;
      console.warn(
        "DataTable: `virtualized` cannot be combined with `groupBy`/`rowSpan`/`paginated`; the unsupported feature is ignored."
      );
    }
  }, [conflictingForce]);
  const virtual = isVirtual && !paginatedEnabled;

  /* ----- search -------------------------------------------------------- */
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  useEffect(() => {
    const t = setTimeout(
      () => setQuery(searchInput.trim().toLowerCase()),
      SEARCH_DEBOUNCE_MS
    );
    return () => clearTimeout(t);
  }, [searchInput]);

  const searchedData = useMemo(() => {
    if (!searchEnabled || !query) return data;
    const searchCols = leafColumns.filter((c) => c.searchable !== false);
    return data.filter((row) =>
      searchCols.some((col) => {
        const value = col.accessor(row);
        if (value == null) return false;
        return String(value).toLowerCase().includes(query);
      })
    );
  }, [data, query, searchEnabled, leafColumns]);

  /* ----- sort ----------------------------------------------------------- */
  const [sortRules, setSortRules] = useState<DataTableSortRule[]>([]);

  const sortedData = useMemo(() => {
    if (!sortRules.length) return searchedData;
    const resolved = sortRules
      .map((rule) => {
        const col = leafColumns.find((c) => c.id === rule.id);
        if (!col) return null;
        let type: ResolvedSortType;
        if (col.sortType && col.sortType !== "auto") {
          type = col.sortType;
        } else {
          const sample = searchedData
            .map((row) => col.accessor(row))
            .find((v) => v != null);
          type = inferSortType(sample);
        }
        return { col, type, direction: rule.direction };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);
    if (!resolved.length) return searchedData;
    return [...searchedData].sort((a, b) => {
      for (const { col, type, direction } of resolved) {
        const cmp = compareValues(col.accessor(a), col.accessor(b), type);
        if (cmp !== 0) return direction === "asc" ? cmp : -cmp;
      }
      return 0;
    });
  }, [searchedData, sortRules, leafColumns]);

  const toggleSort = useCallback(
    (colId: string, shiftKey: boolean) => {
      setSortRules((prev) => {
        const existing = prev.find((r) => r.id === colId);
        let next: DataTableSortRule[];
        if (multiSortEnabled && shiftKey && prev.length > 0) {
          if (!existing) {
            next = [...prev, { id: colId, direction: "asc" }];
          } else if (existing.direction === "asc") {
            next = prev.map((r) =>
              r.id === colId ? { ...r, direction: "desc" as const } : r
            );
          } else {
            next = prev.filter((r) => r.id !== colId);
          }
        } else if (existing && prev.length === 1) {
          next =
            existing.direction === "asc"
              ? [{ id: colId, direction: "desc" }]
              : [];
        } else {
          next = [{ id: colId, direction: "asc" }];
        }
        onSort?.(next);
        return next;
      });
    },
    [multiSortEnabled, onSort]
  );

  /* ----- ids, selection, expansion -------------------------------------- */
  const [internalSelected, setInternalSelected] = useState<Set<string>>(
    () => new Set()
  );
  const selectedSet = useMemo(
    () => (selectedIds ? new Set(selectedIds) : internalSelected),
    [selectedIds, internalSelected]
  );
  const updateSelection = useCallback(
    (next: Set<string>) => {
      if (selectedIds === undefined) setInternalSelected(next);
      onSelectionChange?.([...next]);
    },
    [selectedIds, onSelectionChange]
  );
  const toggleRowSelected = useCallback(
    (id: string) => {
      const next = new Set(selectedSet);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      updateSelection(next);
    },
    [selectedSet, updateSelection]
  );

  const filteredIds = useMemo(
    () => sortedData.map((row) => getRowId(row)),
    [sortedData, getRowId]
  );
  const allFilteredSelected =
    filteredIds.length > 0 && filteredIds.every((id) => selectedSet.has(id));
  const someFilteredSelected = filteredIds.some((id) => selectedSet.has(id));
  const toggleSelectAll = useCallback(() => {
    // Merge against the current selection so ids hidden by an active search are
    // preserved rather than dropped.
    const next = new Set(selectedSet);
    if (allFilteredSelected) {
      filteredIds.forEach((id) => next.delete(id));
    } else {
      filteredIds.forEach((id) => next.add(id));
    }
    updateSelection(next);
  }, [allFilteredSelected, filteredIds, selectedSet, updateSelection]);

  const [internalExpanded, setInternalExpanded] = useState<Set<string>>(
    () => new Set()
  );
  const expandedSet = useMemo(
    () => (expandedIds ? new Set(expandedIds) : internalExpanded),
    [expandedIds, internalExpanded]
  );
  const toggleRowExpanded = useCallback(
    (id: string) => {
      const next = new Set(expandedSet);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      if (expandedIds === undefined) setInternalExpanded(next);
      onExpandedChange?.([...next]);
    },
    [expandedSet, expandedIds, onExpandedChange]
  );

  /* ----- group collapse -------------------------------------------------- */
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    () => new Set()
  );
  const toggleGroup = useCallback((key: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  /* ----- pinned rows ------------------------------------------------------ */
  const pinnedSet = useMemo(() => new Set(pinnedRows ?? []), [pinnedRows]);
  const pinnedData = useMemo(
    () =>
      pinnedSet.size
        ? sortedData.filter((row) => pinnedSet.has(getRowId(row)))
        : [],
    [sortedData, pinnedSet, getRowId]
  );
  const flowData = useMemo(
    () =>
      pinnedSet.size
        ? sortedData.filter((row) => !pinnedSet.has(getRowId(row)))
        : sortedData,
    [sortedData, pinnedSet, getRowId]
  );
  // Index map over the windowed flow (pinned rows excluded), so virtual spacer
  // math matches the coordinate system `computeWindow` runs against.
  const flowRowIdIndex = useMemo(() => {
    const map = new Map<string, number>();
    flowData.forEach((row, i) => map.set(getRowId(row), i));
    return map;
  }, [flowData, getRowId]);

  /* ----- pagination ------------------------------------------------------- */
  const normalizedPageSize = normalizePageSize(pageSize, PAGE_SIZE_FALLBACK);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(normalizedPageSize);
  useEffect(() => {
    setCurrentPageSize(normalizedPageSize);
  }, [normalizedPageSize]);
  const effectivePageSize = normalizePageSize(
    currentPageSize,
    PAGE_SIZE_FALLBACK
  );
  const totalItems = flowData.length;
  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / (paginatedEnabled ? effectivePageSize : totalItems || 1))
  );
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  useEffect(() => {
    if (!paginatedEnabled) return;
    setCurrentPage((prev) => Math.min(Math.max(prev, 1), totalPages));
  }, [paginatedEnabled, totalPages]);

  const pageStartIndex = paginatedEnabled
    ? (safePage - 1) * effectivePageSize
    : 0;
  const pageEndIndex = paginatedEnabled
    ? Math.min(pageStartIndex + effectivePageSize, totalItems)
    : totalItems;

  /* ----- virtualization ----------------------------------------------------- */
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [measuredViewport, setMeasuredViewport] = useState(0);
  const viewportHeight =
    typeof maxHeight === "number"
      ? maxHeight
      : measuredViewport || DEFAULT_VIRTUAL_MAX_HEIGHT;

  useLayoutEffect(() => {
    if (!virtual || typeof maxHeight === "number") return;
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => {
      const h = el.clientHeight;
      if (h > 0) setMeasuredViewport(h);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [virtual, maxHeight]);

  const [expandedHeights, setExpandedHeights] = useState<
    Record<string, number>
  >({});
  const measureExpandedRow = useCallback(
    (id: string) => (el: HTMLTableRowElement | null) => {
      if (!el) return;
      const h = el.offsetHeight;
      if (h > 0) {
        setExpandedHeights((prev) =>
          Math.abs((prev[id] ?? 0) - h) > 1 ? { ...prev, [id]: h } : prev
        );
      }
    },
    []
  );

  const windowSlice = useMemo(() => {
    if (!virtual) return null;
    const base = computeWindow({
      scrollTop,
      viewportHeight,
      rowHeight,
      rowCount: flowData.length,
    });
    if (!expandedSet.size) return base;
    // Expanded panels add real height; shift the spacers so the scrollbar
    // still reflects the full content size.
    let extraAbove = 0;
    let extraBelow = 0;
    for (const id of expandedSet) {
      const index = flowRowIdIndex.get(id);
      // Missing ids are pinned rows; they sit outside the virtual flow.
      if (index === undefined) continue;
      const extra = expandedHeights[id] ?? 0;
      if (index < base.start) extraAbove += extra;
      else if (index >= base.end) extraBelow += extra;
    }
    return {
      ...base,
      padTop: base.padTop + extraAbove,
      padBottom: base.padBottom + extraBelow,
    };
  }, [
    virtual,
    scrollTop,
    viewportHeight,
    rowHeight,
    flowData.length,
    expandedSet,
    expandedHeights,
    flowRowIdIndex,
  ]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  /* ----- visible rows -------------------------------------------------------- */
  const visibleRows = useMemo(() => {
    if (virtual && windowSlice) {
      return flowData.slice(windowSlice.start, windowSlice.end);
    }
    if (paginatedEnabled) return flowData.slice(pageStartIndex, pageEndIndex);
    return flowData;
  }, [
    virtual,
    windowSlice,
    paginatedEnabled,
    flowData,
    pageStartIndex,
    pageEndIndex,
  ]);

  /* ----- grouping -------------------------------------------------------------- */
  const groupColumn = groupingActive && groupBy
    ? leafColumns.find((c) => c.id === groupBy)
    : undefined;
  const groupedRows = useMemo(() => {
    if (!groupColumn) return null;
    const groups: Array<{ key: string; rows: T[] }> = [];
    const byKey = new Map<string, T[]>();
    for (const row of visibleRows) {
      const key = String(groupColumn.accessor(row) ?? "");
      let bucket = byKey.get(key);
      if (!bucket) {
        bucket = [];
        byKey.set(key, bucket);
        groups.push({ key, rows: bucket });
      }
      bucket.push(row);
    }
    return groups;
  }, [groupColumn, visibleRows]);

  const rowSpanPlans = useMemo(() => {
    if (virtual || !anyRowSpan) return null;
    const plans = new Map<string, number[]>();
    for (const col of leafColumns) {
      if (!col.rowSpan) continue;
      if (groupedRows) {
        // Spans must reset at group boundaries and align with the global
        // grouped render order, so compute per group and concatenate.
        const merged: number[] = [];
        for (const group of groupedRows) {
          merged.push(...computeRowSpans(group.rows, col));
        }
        plans.set(col.id, merged);
      } else {
        plans.set(col.id, computeRowSpans(visibleRows, col));
      }
    }
    return plans;
  }, [virtual, anyRowSpan, leafColumns, visibleRows, groupedRows]);

  /* ----- frozen columns ---------------------------------------------------------- */
  const tableRef = useRef<HTMLTableElement>(null);
  const theadRef = useRef<HTMLTableSectionElement>(null);
  const [measuredWidths, setMeasuredWidths] = useState<number[]>([]);
  const [headerHeight, setHeaderHeight] = useState(0);
  const anyFreeze = leafColumns.some((c) => c.freeze);
  const leadingCount = (selectableEnabled ? 1 : 0) + (expandEnabled ? 1 : 0);
  const fullColSpan = leadingCount + leafColumns.length;

  const measureWidths = useCallback(() => {
    if (!anyFreeze) return;
    const table = tableRef.current;
    if (!table) return;
    const firstRow = table.querySelector("tbody tr[data-row]");
    if (!firstRow) return;
    const cells = firstRow.querySelectorAll("td");
    if (cells.length !== fullColSpan) return; // rowSpan merges break alignment
    const widths: number[] = [];
    cells.forEach((cell, i) => {
      if (i >= leadingCount) widths.push(cell.getBoundingClientRect().width);
    });
    if (widths.length && widths.every((w) => Number.isFinite(w) && w > 0)) {
      setMeasuredWidths(widths);
    }
  }, [anyFreeze, fullColSpan, leadingCount]);

  useLayoutEffect(() => {
    measureWidths();
    const thead = theadRef.current;
    if (thead && (pinnedData.length || stickyHeaderEnabled)) {
      const h = thead.getBoundingClientRect().height;
      if (h > 0) setHeaderHeight((prev) => (Math.abs(prev - h) > 1 ? h : prev));
    }
  }, [measureWidths, visibleRows, pinnedData.length, stickyHeaderEnabled]);

  useEffect(() => {
    if (!anyFreeze) return;
    const table = tableRef.current;
    if (!table) return;
    const ro = new ResizeObserver(() => measureWidths());
    ro.observe(table);
    window.addEventListener("resize", measureWidths);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measureWidths);
    };
  }, [anyFreeze, measureWidths]);

  const freezeOffsets = useMemo(() => {
    const widths = leafColumns.map(
      (col, i) =>
        col.width ??
        (measuredWidths[i] && measuredWidths[i] > 0
          ? measuredWidths[i]
          : FALLBACK_COL_WIDTH_PX)
    );
    const left = new Map<number, number>();
    const right = new Map<number, number>();
    let leftAcc = leadingCount * LEADING_COL_WIDTH_PX;
    leafColumns.forEach((col, i) => {
      if (col.freeze === "left") {
        left.set(i, leftAcc);
        leftAcc += widths[i];
      }
    });
    let rightAcc = 0;
    for (let i = leafColumns.length - 1; i >= 0; i--) {
      if (leafColumns[i].freeze === "right") {
        right.set(i, rightAcc);
        rightAcc += widths[i];
      }
    }
    return { left, right, widths };
  }, [leafColumns, measuredWidths, leadingCount]);
  const anyFreezeLeft = freezeOffsets.left.size > 0;

  /* ----- theming -------------------------------------------------------------------- */
  const headerText = headerTextColor ?? defaultHeaderTextColor(theme);
  const bodyText = bodyTextColor ?? defaultBodyTextColor(theme);
  const headerBg = headerBackground ?? defaultHeaderBackground(theme);
  const bodyBg = bodyBackground ?? defaultBodyBackground(theme);
  const borderColor =
    theme === "dark" ? "border-neutral-700" : "border-neutral-200";
  const borderClass = border ? cn("border", borderColor) : "";
  const cellBorderClass = border
    ? cn("border-b border-r last:border-r-0", borderColor)
    : "";
  const paginationBtnBase =
    theme === "dark"
      ? "border-neutral-700 hover:bg-neutral-800"
      : "border-neutral-300 hover:bg-neutral-100";
  const paginationBtnActive =
    theme === "dark"
      ? "bg-neutral-100 text-neutral-900 border-neutral-300"
      : "bg-neutral-900 text-white border-neutral-700";
  const paginationBtnDisabled =
    "cursor-not-allowed opacity-40 border-neutral-700";
  const inputBorder =
    theme === "dark" ? "border-neutral-700" : "border-neutral-300";

  const pageSizeSelectId = useId();

  /* ----- header keyboard roving ------------------------------------------------------- */
  const handleHeaderKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTableSectionElement>) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const thead = theadRef.current;
      if (!thead) return;
      const buttons = Array.from(thead.querySelectorAll("button"));
      const index = buttons.indexOf(e.target as HTMLButtonElement);
      if (index === -1) return;
      const next = buttons[index + (e.key === "ArrowRight" ? 1 : -1)];
      if (next) {
        e.preventDefault();
        next.focus();
      }
    },
    []
  );

  /* ----- cell render helpers ------------------------------------------------------------ */
  const renderCellValue = useCallback(
    (col: DataTableColumn<T>, row: T): React.ReactNode => {
      if (col.cell) return col.cell(row);
      const value = col.accessor(row);
      if (value == null) return "";
      return String(value);
    },
    []
  );

  const leafStickyStyle = useCallback(
    (leafIndex: number, isHeader: boolean): React.CSSProperties => {
      const leftOffset = freezeOffsets.left.get(leafIndex);
      const rightOffset = freezeOffsets.right.get(leafIndex);
      const style: React.CSSProperties = {};
      const width = freezeOffsets.widths[leafIndex];
      const col = leafColumns[leafIndex];
      if (col?.width) {
        style.width = col.width;
        style.minWidth = col.width;
      }
      if (leftOffset === undefined && rightOffset === undefined) return style;
      style.position = "sticky";
      style.zIndex = isHeader ? 30 : 10;
      style.width = width;
      style.minWidth = width;
      if (leftOffset !== undefined) {
        style.left = leftOffset;
        if (leftOffset > 0) {
          style.boxShadow = "4px 0 6px -2px rgba(0,0,0,0.1)";
        }
      } else if (rightOffset !== undefined) {
        style.right = rightOffset;
        style.boxShadow = "-4px 0 6px -2px rgba(0,0,0,0.1)";
      }
      return style;
    },
    [freezeOffsets, leafColumns]
  );

  const leadingStickyStyle = useCallback(
    (position: number, isHeader: boolean): React.CSSProperties => {
      const style: React.CSSProperties = {
        width: LEADING_COL_WIDTH_PX,
        minWidth: LEADING_COL_WIDTH_PX,
      };
      if (anyFreezeLeft) {
        style.position = "sticky";
        style.left = position * LEADING_COL_WIDTH_PX;
        style.zIndex = isHeader ? 30 : 10;
      }
      return style;
    },
    [anyFreezeLeft]
  );

  const alignClass = (col: DataTableColumn<T>) =>
    col.align === "right"
      ? "text-right"
      : col.align === "center"
        ? "text-center"
        : undefined;

  /* ----- row rendering --------------------------------------------------------------------- */
  const renderDataRow = (
    row: T,
    visibleIndex: number,
    options: { ariaRowIndex?: number; pinned?: boolean } = {}
  ) => {
    const id = getRowId(row);
    const isSelected = selectableEnabled && selectedSet.has(id);
    const isExpanded = expandEnabled && expandedSet.has(id);
    const pinnedStyle: React.CSSProperties | undefined = options.pinned
      ? { position: "sticky", top: headerHeight, zIndex: 15 }
      : undefined;

    const cells = leafColumns.map((col, leafIndex) => {
      const plan = rowSpanPlans?.get(col.id);
      if (plan && !options.pinned) {
        const span = plan[visibleIndex];
        if (span === 0) return null;
        if (span > 1) {
          return (
            <td
              key={col.id}
              rowSpan={span}
              className={cn(
                "px-4 py-3 align-top",
                bodyText,
                bodyBg,
                cellBorderClass,
                alignClass(col)
              )}
              style={leafStickyStyle(leafIndex, false)}
            >
              {renderCellValue(col, row)}
            </td>
          );
        }
      }
      return (
        <td
          key={col.id}
          className={cn(
            "px-4 py-3",
            bodyText,
            bodyBg,
            cellBorderClass,
            alignClass(col)
          )}
          style={leafStickyStyle(leafIndex, false)}
        >
          {renderCellValue(col, row)}
        </td>
      );
    });

    return (
      <React.Fragment key={id}>
        <tr
          data-row=""
          aria-rowindex={options.ariaRowIndex}
          aria-selected={selectableEnabled ? isSelected : undefined}
          className={cn(bodyBg, border && cn("border-b", borderColor))}
          style={pinnedStyle}
        >
          {selectableEnabled && (
            <td
              className={cn("px-3 py-3", bodyBg, cellBorderClass)}
              style={leadingStickyStyle(0, false)}
            >
              <input
                type="checkbox"
                aria-label="Select row"
                className="size-4 accent-current"
                checked={isSelected}
                onChange={() => toggleRowSelected(id)}
              />
            </td>
          )}
          {expandEnabled && (
            <td
              className={cn("px-2 py-3", bodyBg, cellBorderClass)}
              style={leadingStickyStyle(selectableEnabled ? 1 : 0, false)}
            >
              <button
                type="button"
                aria-label="Expand row"
                aria-expanded={isExpanded}
                onClick={() => toggleRowExpanded(id)}
                className={cn(
                  "inline-flex size-6 items-center justify-center rounded-sm",
                  bodyText,
                  "hover:opacity-80 outline-none focus-visible:ring-2",
                  theme === "dark"
                    ? "focus-visible:ring-neutral-600"
                    : "focus-visible:ring-neutral-400"
                )}
              >
                <ChevronDown
                  className={cn(
                    "size-4 motion-safe:transition-transform",
                    isExpanded && "rotate-180"
                  )}
                  aria-hidden
                />
              </button>
            </td>
          )}
          {cells}
        </tr>
        {isExpanded && (
          <tr
            data-row-expansion=""
            ref={virtual ? measureExpandedRow(id) : undefined}
            className={cn(bodyBg, border && cn("border-b", borderColor))}
          >
            <td
              colSpan={fullColSpan}
              className={cn("px-4 py-3", bodyText, bodyBg, cellBorderClass)}
            >
              {renderExpanded?.(row)}
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  };

  /* ----- header rendering --------------------------------------------------------------------- */
  const stickyHeaderClass = stickyHeaderEnabled ? "sticky top-0 z-20" : "";

  const renderHeader = () => (
    <thead ref={theadRef} onKeyDown={handleHeaderKeyDown}>
      {headerRows.map((cells, level) => (
        <tr key={level} className={headerBg}>
          {level === 0 && selectableEnabled && (
            <th
              scope="col"
              rowSpan={headerDepth}
              className={cn(
                "px-3 py-3",
                headerText,
                headerBg,
                cellBorderClass,
                stickyHeaderClass
              )}
              style={leadingStickyStyle(0, true)}
            >
              <input
                type="checkbox"
                aria-label="Select all rows"
                className="size-4 accent-current"
                checked={allFilteredSelected}
                ref={(el) => {
                  if (el) {
                    el.indeterminate =
                      someFilteredSelected && !allFilteredSelected;
                  }
                }}
                onChange={toggleSelectAll}
              />
            </th>
          )}
          {level === 0 && expandEnabled && (
            <th
              scope="col"
              rowSpan={headerDepth}
              aria-label="Row expansion"
              className={cn(
                "px-2 py-3",
                headerText,
                headerBg,
                cellBorderClass,
                stickyHeaderClass
              )}
              style={leadingStickyStyle(selectableEnabled ? 1 : 0, true)}
            />
          )}
          {cells.map((cell) => {
            const col = cell.column;
            const canSort =
              cell.leaf && (col.sortable ?? tableSortable) && !col.columns;
            const rule = sortRules.find((r) => r.id === col.id);
            const sortPriority =
              rule && sortRules.length > 1
                ? sortRules.indexOf(rule) + 1
                : null;
            const ariaSort = rule
              ? rule.direction === "asc"
                ? "ascending"
                : "descending"
              : undefined;
            return (
              <th
                key={col.id}
                scope={cell.leaf ? "col" : "colgroup"}
                colSpan={cell.colSpan > 1 ? cell.colSpan : undefined}
                rowSpan={cell.rowSpan > 1 ? cell.rowSpan : undefined}
                aria-sort={canSort ? ariaSort : undefined}
                className={cn(
                  "px-4 py-3 font-medium whitespace-nowrap",
                  !cell.leaf && "text-center",
                  headerText,
                  headerBg,
                  cellBorderClass,
                  stickyHeaderClass,
                  alignClass(col)
                )}
                style={cell.leaf ? leafStickyStyle(cell.leafIndex, true) : undefined}
              >
                {canSort ? (
                  <button
                    type="button"
                    onClick={(e) => toggleSort(col.id, e.shiftKey)}
                    className={cn(
                      "inline-flex w-full max-w-full items-center gap-1 rounded-sm bg-transparent p-0 text-left font-inherit",
                      headerText,
                      "cursor-pointer select-none hover:opacity-80",
                      "outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                      theme === "dark"
                        ? "focus-visible:ring-neutral-600 focus-visible:ring-offset-neutral-950"
                        : "focus-visible:ring-neutral-400 focus-visible:ring-offset-white"
                    )}
                  >
                    {col.header}
                    {rule && (
                      <span className="ml-1 inline-flex items-center">
                        <span aria-hidden>
                          {rule.direction === "asc" ? "↑" : "↓"}
                        </span>
                        {sortPriority != null && (
                          <>
                            <span
                              className="ml-0.5 text-[10px] tabular-nums opacity-70"
                              aria-hidden
                            >
                              {sortPriority}
                            </span>
                            <span className="sr-only">{`, sort priority ${sortPriority}`}</span>
                          </>
                        )}
                      </span>
                    )}
                  </button>
                ) : (
                  col.header
                )}
              </th>
            );
          })}
        </tr>
      ))}
    </thead>
  );

  /* ----- body rendering ----------------------------------------------------------------------- */
  const renderBody = () => {
    // Under virtualization pinned rows occupy the first aria-rowindex slots, so
    // the windowed flow rows below are offset past them.
    const pinned = pinnedData.map((row, i) =>
      renderDataRow(row, i, {
        pinned: true,
        ariaRowIndex: virtual ? i + 2 : undefined,
      })
    );

    if (virtual && windowSlice) {
      return (
        <tbody>
          {pinned}
          {windowSlice.padTop > 0 && (
            <tr data-spacer="" aria-hidden="true">
              <td
                colSpan={fullColSpan}
                style={{ height: windowSlice.padTop, padding: 0, border: "none" }}
              />
            </tr>
          )}
          {visibleRows.map((row, i) =>
            renderDataRow(row, i, {
              ariaRowIndex: pinnedData.length + windowSlice.start + i + 2,
            })
          )}
          {windowSlice.padBottom > 0 && (
            <tr data-spacer="" aria-hidden="true">
              <td
                colSpan={fullColSpan}
                style={{
                  height: windowSlice.padBottom,
                  padding: 0,
                  border: "none",
                }}
              />
            </tr>
          )}
        </tbody>
      );
    }

    if (groupedRows) {
      let groupRowOffset = 0;
      return (
        <tbody>
          {pinned}
          {groupedRows.map((group) => {
            const collapsed = collapsedGroups.has(group.key);
            // Global index into the concatenated rowSpan plans; advances across
            // every group (collapsed included) to stay aligned.
            const groupStart = groupRowOffset;
            groupRowOffset += group.rows.length;
            return (
              <React.Fragment key={group.key}>
                <tr
                  data-row-group=""
                  className={cn(headerBg, border && cn("border-b", borderColor))}
                >
                  <td colSpan={fullColSpan} className={cn("px-4 py-2", headerText)}>
                    <button
                      type="button"
                      aria-expanded={!collapsed}
                      onClick={() => toggleGroup(group.key)}
                      className={cn(
                        "inline-flex items-center gap-2 font-medium",
                        headerText,
                        "cursor-pointer select-none hover:opacity-80 outline-none focus-visible:ring-2",
                        theme === "dark"
                          ? "focus-visible:ring-neutral-600"
                          : "focus-visible:ring-neutral-400"
                      )}
                    >
                      <ChevronDown
                        className={cn(
                          "size-4 motion-safe:transition-transform",
                          collapsed && "-rotate-90"
                        )}
                        aria-hidden
                      />
                      {group.key || "—"}
                      <span className="text-xs opacity-70 tabular-nums">
                        {group.rows.length}
                      </span>
                    </button>
                  </td>
                </tr>
                {!collapsed &&
                  group.rows.map((row, i) =>
                    renderDataRow(row, groupStart + i)
                  )}
              </React.Fragment>
            );
          })}
        </tbody>
      );
    }

    return (
      <tbody>
        {pinned}
        {visibleRows.map((row, i) => renderDataRow(row, i))}
      </tbody>
    );
  };

  /* ----- pagination footer ----------------------------------------------------------------------- */
  const pageItems = useMemo(
    () => getPaginationItems(safePage, totalPages),
    [safePage, totalPages]
  );

  const scrollStyle: React.CSSProperties = {};
  if (maxHeight !== undefined) {
    scrollStyle.maxHeight = maxHeight;
  } else if (virtual) {
    scrollStyle.maxHeight = DEFAULT_VIRTUAL_MAX_HEIGHT;
  }

  return (
    <div
      {...rootProps}
      className={cn("w-full rounded-lg", className)}
      data-engine={virtual ? "virtual" : "standard"}
    >
      {searchEnabled && (
        <div className="mb-3 flex items-center justify-between gap-3">
          <div
            className={cn(
              "flex h-9 w-full max-w-xs items-center gap-2 rounded-md border px-3",
              inputBorder,
              bodyText
            )}
          >
            <Search className="size-4 shrink-0 opacity-60" aria-hidden />
            <input
              type="search"
              aria-label="Search table"
              placeholder="Search…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className={cn(
                "w-full bg-transparent text-sm outline-none placeholder:opacity-50",
                bodyText
              )}
            />
          </div>
          {selectableEnabled && selectedSet.size > 0 && (
            <div className={cn("shrink-0 text-xs tabular-nums", bodyText)}>
              {selectedSet.size} selected
            </div>
          )}
        </div>
      )}

      <div
        ref={viewportRef}
        data-table-viewport=""
        onScroll={virtual ? handleScroll : undefined}
        className="w-full overflow-x-auto overflow-y-auto"
        style={scrollStyle}
      >
        <table
          ref={tableRef}
          aria-label="Data table"
          aria-rowcount={virtual ? sortedData.length + 1 : undefined}
          className={cn("w-full min-w-max text-left text-sm", borderClass)}
        >
          {renderHeader()}
          {renderBody()}
        </table>
      </div>

      {totalItems === 0 && data.length > 0 && (
        <div className={cn("px-4 py-6 text-center text-sm", bodyText)}>
          No matching rows.
        </div>
      )}

      {paginatedEnabled && totalItems > 0 && (
        <nav
          className={cn(
            "mt-4 flex flex-col items-center justify-between gap-3 text-xs sm:flex-row sm:text-sm",
            bodyText
          )}
          aria-label="Table pagination"
        >
          <div className="text-xs sm:text-sm">
            {`Showing ${pageStartIndex + 1}-${pageEndIndex} of ${totalItems}`}
          </div>
          <div className="flex items-center gap-3">
            {pageSizeOptions && pageSizeOptions.length > 0 && (
              <div className="flex items-center gap-1">
                <label htmlFor={pageSizeSelectId} className="hidden sm:inline">
                  Rows per page
                </label>
                <select
                  id={pageSizeSelectId}
                  className={cn(
                    "h-8 rounded-md border bg-transparent px-2 text-xs outline-none sm:text-sm",
                    inputBorder
                  )}
                  value={effectivePageSize}
                  onChange={(e) => {
                    setCurrentPageSize(
                      normalizePageSize(e.target.value, effectivePageSize)
                    );
                    setCurrentPage(1);
                  }}
                >
                  {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Previous page"
                className={cn(
                  "inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-md border px-2 text-xs leading-none sm:text-sm",
                  safePage === 1 ? paginationBtnDisabled : paginationBtnBase
                )}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
              >
                <ChevronLeft className="size-4" aria-hidden />
              </button>
              {pageItems.map((item, itemIdx) =>
                item === "ellipsis" ? (
                  <span
                    key={`ellipsis-${itemIdx}`}
                    className="inline-flex h-8 min-w-8 shrink-0 items-center justify-center px-1 text-xs tabular-nums text-neutral-500 sm:text-sm"
                    aria-hidden
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    className={cn(
                      "inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-md border px-2 text-xs leading-none tabular-nums sm:text-sm",
                      item === safePage ? paginationBtnActive : paginationBtnBase
                    )}
                    aria-current={item === safePage ? "page" : undefined}
                    onClick={() => setCurrentPage(item)}
                  >
                    {item}
                  </button>
                )
              )}
              <button
                type="button"
                aria-label="Next page"
                className={cn(
                  "inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-md border px-2 text-xs leading-none sm:text-sm",
                  safePage === totalPages
                    ? paginationBtnDisabled
                    : paginationBtnBase
                )}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
              >
                <ChevronRight className="size-4" aria-hidden />
              </button>
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
