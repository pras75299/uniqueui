"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/** Fallback width when column widths are not measured yet. */
const STICKY_COL_WIDTH_PX = 112;

const PAGE_SIZE_FALLBACK = 8;

function normalizePageSize(input: unknown, fallback: number): number {
  const n = Math.floor(Number(input));
  if (!Number.isFinite(n) || n < 1) return fallback;
  return n;
}

function defaultGetRowKey(
  row: Record<string, React.ReactNode>,
  index: number
): React.Key {
  const id = row["id"];
  const key = row["key"];
  if (typeof id === "string" || typeof id === "number") return String(id);
  if (typeof key === "string" || typeof key === "number") return String(key);
  return `__row-${index}`;
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

export interface DataTableColumn {
  key: string;
  label: string;
  sortKey?: string;
}

export interface DataTableOwnProps {
  columns: DataTableColumn[];
  data: Record<string, React.ReactNode>[];
  freezeColumns?: "none" | "left" | "right" | "both";
  /**
   * @deprecated Use `freezeLeftCount` and/or `freezeRightCount` instead.
   * Legacy fallback count when side-specific freeze counts are not provided.
   */
  freezeCount?: number;
  /**
   * How many columns to freeze on the **left** when `freezeColumns` is `"left"` or `"both"`.
   * Ignored when `freezeColumns` is `"right"` or `"none"`.
   */
  freezeLeftCount?: number;
  /**
   * How many columns to freeze on the **right** when `freezeColumns` is `"right"` or `"both"`.
   * Ignored when `freezeColumns` is `"left"` or `"none"`.
   */
  freezeRightCount?: number;
  paginated?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  initialPage?: number;
  onPageChange?: (page: number, pageSize: number) => void;
  /** Content for the previous-page control; defaults to a left chevron icon. */
  paginationPreviousLabel?: React.ReactNode;
  /** Content for the next-page control; defaults to a right chevron icon. */
  paginationNextLabel?: React.ReactNode;
  /**
   * Stable key for each row (sorting, pagination). Defaults to `row.id` / `row.key` when string/number, else a generated key.
   */
  getRowKey?: (row: Record<string, React.ReactNode>, index: number) => React.Key;
  headerTextColor?: string;
  bodyTextColor?: string;
  headerBackground?: string;
  bodyBackground?: string;
  border?: boolean;
  sortable?: boolean;
  onSort?: (key: string, direction: "asc" | "desc") => void;
  className?: string;
  theme?: "light" | "dark";
}

export type DataTableProps = DataTableOwnProps &
  Omit<React.HTMLAttributes<HTMLDivElement>, keyof DataTableOwnProps | "children">;

const defaultHeaderTextColor = (theme: "light" | "dark") =>
  theme === "dark" ? "text-neutral-200" : "text-neutral-900";
const defaultBodyTextColor = (theme: "light" | "dark") =>
  theme === "dark" ? "text-neutral-300" : "text-neutral-700";
const defaultHeaderBackground = (theme: "light" | "dark") =>
  theme === "dark" ? "bg-neutral-800" : "bg-neutral-100";
const defaultBodyBackground = (theme: "light" | "dark") =>
  theme === "dark" ? "bg-neutral-950" : "bg-white";

export function DataTable({
  columns,
  data,
  freezeColumns = "none",
  freezeCount = 1,
  freezeLeftCount: freezeLeftCountProp,
  freezeRightCount: freezeRightCountProp,
  paginated = false,
  pageSize = PAGE_SIZE_FALLBACK,
  pageSizeOptions,
  initialPage = 1,
  onPageChange,
  paginationPreviousLabel = <ChevronLeft className="size-4" aria-hidden />,
  paginationNextLabel = <ChevronRight className="size-4" aria-hidden />,
  getRowKey,
  headerTextColor,
  bodyTextColor,
  headerBackground,
  bodyBackground,
  border = false,
  sortable = false,
  onSort,
  className,
  theme = "dark",
  ...rest
}: DataTableProps) {
  const pageSizeSelectId = useId();
  const tableRef = useRef<HTMLTableElement>(null);
  const [colWidths, setColWidths] = useState<number[]>([]);

  const normalizedInitialPageSize = useMemo(
    () => normalizePageSize(pageSize, PAGE_SIZE_FALLBACK),
    [pageSize]
  );

  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [currentPageSize, setCurrentPageSize] = useState(normalizedInitialPageSize);

  useEffect(() => {
    setCurrentPageSize(normalizedInitialPageSize);
  }, [normalizedInitialPageSize]);

  const effectivePageSize = normalizePageSize(currentPageSize, PAGE_SIZE_FALLBACK);

  useEffect(() => {
    if (!paginated) return;
    if (!pageSizeOptions?.length) return;
    if (!pageSizeOptions.includes(effectivePageSize)) {
      const next = normalizePageSize(pageSizeOptions[0], PAGE_SIZE_FALLBACK);
      setCurrentPageSize(next);
      setCurrentPage(1);
      onPageChange?.(1, next);
    }
  }, [paginated, pageSizeOptions, effectivePageSize, onPageChange]);

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
  const headerCellBorderClass = border
    ? cn("border-b border-r last:border-r-0", borderColor)
    : "";
  const rowSepBorderClass = border ? cn("border-b", borderColor) : "";

  const paginationBtnBase =
    theme === "dark"
      ? "border-neutral-700 hover:bg-neutral-800"
      : "border-neutral-300 hover:bg-neutral-100";
  const paginationBtnActive =
    theme === "dark"
      ? "bg-neutral-100 text-neutral-900 border-neutral-300"
      : "bg-neutral-900 text-white border-neutral-700";
  const paginationBtnDisabled = "cursor-not-allowed opacity-40 border-neutral-700";
  const selectBorder =
    theme === "dark" ? "border-neutral-700" : "border-neutral-300";

  const handleSort = (key: string) => {
    if (!sortable) return;
    const nextDir =
      sortKey === key && sortDirection === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortDirection(nextDir);
    onSort?.(key, nextDir);
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      const aStr = typeof va === "object" ? String(va) : String(va ?? "");
      const bStr = typeof vb === "object" ? String(vb) : String(vb ?? "");
      const cmp = aStr.localeCompare(bStr, undefined, { numeric: true });
      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDirection]);

  const totalItems = sortedData.length;
  const totalPages = Math.max(
    1,
    Math.ceil(
      totalItems / (paginated ? effectivePageSize : totalItems || 1)
    )
  );

  const safePage = Math.min(Math.max(currentPage, 1), totalPages);

  const n = columns.length;
  const isLeftFreeze = freezeColumns === "left" || freezeColumns === "both";
  const isRightFreeze = freezeColumns === "right" || freezeColumns === "both";
  const leftCount = freezeLeftCountProp ?? freezeCount;
  const rightCount = freezeRightCountProp ?? freezeCount;
  const leftFreezeCount = isLeftFreeze ? Math.min(leftCount, n) : 0;
  let rightFreezeCount = isRightFreeze ? Math.min(rightCount, n) : 0;
  if (freezeColumns === "both" && leftFreezeCount + rightFreezeCount > n) {
    rightFreezeCount = Math.max(0, n - leftFreezeCount);
  }

  const needsStickyMeasure = isLeftFreeze || isRightFreeze;

  const measureColWidths = useCallback(() => {
    if (!needsStickyMeasure) return;
    const table = tableRef.current;
    if (!table) return;
    const firstRow = table.querySelector("thead tr");
    if (!firstRow) return;
    const ths = firstRow.querySelectorAll("th");
    if (ths.length !== n) return;
    const w: number[] = [];
    ths.forEach((th) => w.push(th.getBoundingClientRect().width));
    if (w.length && w.every((x) => Number.isFinite(x) && x > 0)) {
      setColWidths(w);
    }
  }, [needsStickyMeasure, n]);

  useLayoutEffect(() => {
    measureColWidths();
  }, [
    measureColWidths,
    sortedData,
    columns,
    leftFreezeCount,
    rightFreezeCount,
    safePage,
    effectivePageSize,
  ]);

  useEffect(() => {
    if (!needsStickyMeasure) return;
    const table = tableRef.current;
    if (!table) return;
    const ro = new ResizeObserver(() => measureColWidths());
    ro.observe(table);
    window.addEventListener("resize", measureColWidths);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measureColWidths);
    };
  }, [
    needsStickyMeasure,
    measureColWidths,
    safePage,
    effectivePageSize,
  ]);

  const stickyOffsets = useMemo(() => {
    const widths: number[] = [];
    for (let i = 0; i < n; i++) {
      const w = colWidths[i];
      widths.push(
        w !== undefined && Number.isFinite(w) && w > 0
          ? w
          : STICKY_COL_WIDTH_PX
      );
    }
    const leftOffsets: number[] = new Array(n);
    leftOffsets[0] = 0;
    for (let i = 1; i < n; i++) {
      leftOffsets[i] = leftOffsets[i - 1] + widths[i - 1];
    }
    const rightOffsets: number[] = new Array(n);
    let acc = 0;
    for (let i = n - 1; i >= 0; i--) {
      rightOffsets[i] = acc;
      acc += widths[i];
    }
    return { leftOffsets, rightOffsets, widths };
  }, [colWidths, n]);

  // Keep pagination state consistent if `data` length (or pageSize) changes.
  useEffect(() => {
    if (!paginated) return;

    setCurrentPage((prev) => {
      const clamped = Math.min(Math.max(prev, 1), totalPages);
      if (clamped !== prev) {
        onPageChange?.(clamped, effectivePageSize);
        return clamped;
      }
      return prev;
    });
  }, [paginated, totalPages, effectivePageSize, onPageChange]);

  const pageStartIndex = paginated ? (safePage - 1) * effectivePageSize : 0;
  const pageEndIndex = paginated
    ? pageStartIndex + effectivePageSize
    : totalItems;

  const visibleData = paginated
    ? sortedData.slice(pageStartIndex, pageEndIndex)
    : sortedData;

  const pageItems = useMemo(
    () => getPaginationItems(safePage, totalPages),
    [safePage, totalPages]
  );

  return (
    <div
      {...rest}
      className={cn("w-full rounded-lg", className)}
    >
      <div className="w-full overflow-x-auto">
        <table
          ref={tableRef}
          className={cn("w-full min-w-max text-sm text-left", borderClass)}
        >
          <thead>
            <tr className={cn(headerBg)}>
              {columns.map((col, colIndex) => {
                const isStickyLeft =
                  isLeftFreeze && colIndex < leftFreezeCount;
                const isStickyRight =
                  isRightFreeze && colIndex >= n - rightFreezeCount;
                const stickyLeft = isStickyLeft
                  ? stickyOffsets.leftOffsets[colIndex]
                  : undefined;
                const stickyRight = isStickyRight
                  ? stickyOffsets.rightOffsets[colIndex]
                  : undefined;
                const canSort = sortable && col.sortKey != null;
                const ariaSort =
                  canSort && sortKey === col.sortKey
                    ? sortDirection === "asc"
                      ? "ascending"
                      : "descending"
                    : undefined;
                const cw = stickyOffsets.widths[colIndex];

                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={ariaSort}
                    className={cn(
                      "px-4 py-3 font-medium whitespace-nowrap",
                      headerText,
                      headerBg,
                      headerCellBorderClass
                    )}
                    style={{
                      ...(isStickyLeft && {
                        position: "sticky",
                        left: stickyLeft,
                        zIndex: 10,
                        width: cw,
                        minWidth: cw,
                        boxShadow: stickyLeft
                          ? "4px 0 6px -2px rgba(0,0,0,0.1)"
                          : undefined,
                      }),
                      ...(isStickyRight && {
                        position: "sticky",
                        right: stickyRight,
                        zIndex: 10,
                        width: cw,
                        minWidth: cw,
                        boxShadow:
                          stickyRight !== undefined
                            ? "-4px 0 6px -2px rgba(0,0,0,0.1)"
                            : undefined,
                      }),
                    }}
                  >
                    {canSort ? (
                      <button
                        type="button"
                        aria-label={`Sort by ${col.label} ${ariaSort ?? ""}`.trim()}
                        onClick={() =>
                          col.sortKey && handleSort(col.sortKey)
                        }
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
                        {col.label}
                        {sortKey === col.sortKey && (
                          <span className="ml-1" aria-hidden>
                            {sortDirection === "asc" ? " ↑" : " ↓"}
                          </span>
                        )}
                      </button>
                    ) : (
                      col.label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visibleData.map((row, rowIndex) => {
              const globalRowIndex = paginated
                ? pageStartIndex + rowIndex
                : rowIndex;
              const rowKey =
                getRowKey?.(row, globalRowIndex) ??
                defaultGetRowKey(row, globalRowIndex);

              return (
                <tr
                  key={rowKey}
                  className={cn(
                    bodyBg,
                    rowIndex < visibleData.length - 1 && border && rowSepBorderClass
                  )}
                >
                  {columns.map((col, colIndex) => {
                    const isStickyLeft =
                      isLeftFreeze && colIndex < leftFreezeCount;
                    const isStickyRight =
                      isRightFreeze && colIndex >= n - rightFreezeCount;
                    const stickyLeft = isStickyLeft
                      ? stickyOffsets.leftOffsets[colIndex]
                      : undefined;
                    const stickyRight = isStickyRight
                      ? stickyOffsets.rightOffsets[colIndex]
                      : undefined;
                    const cw = stickyOffsets.widths[colIndex];

                    return (
                      <td
                        key={col.key}
                        className={cn(
                          "px-4 py-3",
                          bodyText,
                          bodyBg,
                          cellBorderClass
                        )}
                        style={{
                          ...(isStickyLeft && {
                            position: "sticky",
                            left: stickyLeft,
                            zIndex: 5,
                            width: cw,
                            minWidth: cw,
                            boxShadow: stickyLeft
                              ? "4px 0 6px -2px rgba(0,0,0,0.08)"
                              : undefined,
                          }),
                          ...(isStickyRight && {
                            position: "sticky",
                            right: stickyRight,
                            zIndex: 5,
                            width: cw,
                            minWidth: cw,
                            boxShadow:
                              stickyRight !== undefined
                                ? "-4px 0 6px -2px rgba(0,0,0,0.08)"
                                : undefined,
                          }),
                        }}
                      >
                        {row[col.key]}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {paginated && totalItems > 0 && (
        <nav
          className={cn(
            "mt-4 flex flex-col gap-3 items-center justify-between text-xs sm:text-sm sm:flex-row",
            bodyText
          )}
          aria-label="Table pagination"
        >
          <div className="text-xs sm:text-sm">
            {`Showing ${pageStartIndex + 1}-${Math.min(
              pageEndIndex,
              totalItems
            )} of ${totalItems}`}
          </div>
          <div className="flex items-center gap-3">
            {pageSizeOptions && pageSizeOptions.length > 0 && (
              <div className="flex items-center gap-1">
                <label
                  htmlFor={pageSizeSelectId}
                  className="hidden sm:inline"
                >
                  Rows per page
                </label>
                <select
                  id={pageSizeSelectId}
                  className={cn(
                    "h-8 rounded-md border bg-transparent px-2 text-xs sm:text-sm outline-none",
                    selectBorder
                  )}
                  aria-label="Rows per page"
                  value={effectivePageSize}
                  onChange={(e) => {
                    const nextSize = normalizePageSize(
                      e.target.value,
                      effectivePageSize
                    );
                    setCurrentPageSize(nextSize);
                    const nextPage = 1;
                    setCurrentPage(nextPage);
                    onPageChange?.(nextPage, nextSize);
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
                  "inline-flex h-8 min-w-8 shrink-0 items-center justify-center px-2 rounded-md border text-xs sm:text-sm leading-none",
                  safePage === 1 ? paginationBtnDisabled : paginationBtnBase
                )}
                onClick={() => {
                  if (safePage <= 1) return;
                  const nextPage = safePage - 1;
                  setCurrentPage(nextPage);
                  onPageChange?.(nextPage, effectivePageSize);
                }}
                disabled={safePage === 1}
              >
                {paginationPreviousLabel}
              </button>
              {pageItems.map((item, itemIdx) =>
                item === "ellipsis" ? (
                  <span
                    key={`ellipsis-${itemIdx}`}
                    className="inline-flex h-8 min-w-8 shrink-0 items-center justify-center px-1 text-xs sm:text-sm tabular-nums text-neutral-500"
                    aria-hidden
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    className={cn(
                      "inline-flex h-8 min-w-8 shrink-0 items-center justify-center px-2 rounded-md border text-xs sm:text-sm leading-none tabular-nums",
                      item === safePage ? paginationBtnActive : paginationBtnBase
                    )}
                    aria-current={item === safePage ? "page" : undefined}
                    onClick={() => {
                      setCurrentPage(item);
                      onPageChange?.(item, effectivePageSize);
                    }}
                  >
                    {item}
                  </button>
                )
              )}
              <button
                type="button"
                aria-label="Next page"
                className={cn(
                  "inline-flex h-8 min-w-8 shrink-0 items-center justify-center px-2 rounded-md border text-xs sm:text-sm leading-none",
                  safePage === totalPages
                    ? paginationBtnDisabled
                    : paginationBtnBase
                )}
                onClick={() => {
                  if (safePage >= totalPages) return;
                  const nextPage = safePage + 1;
                  setCurrentPage(nextPage);
                  onPageChange?.(nextPage, effectivePageSize);
                }}
                disabled={safePage === totalPages}
              >
                {paginationNextLabel}
              </button>
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
