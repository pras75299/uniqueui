"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useMemo, useState } from "react";

const STICKY_COL_WIDTH_PX = 112;

export interface DataTableColumn {
  key: string;
  label: string;
  sortKey?: string;
}

export interface DataTableProps {
  columns: DataTableColumn[];
  data: Record<string, React.ReactNode>[];
  freezeColumns?: "none" | "left" | "right" | "both";
  freezeCount?: number;
  /** When freezeColumns is "both", number of columns to freeze on the right. Default 1. */
  freezeRightCount?: number;
  paginated?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  initialPage?: number;
  onPageChange?: (page: number, pageSize: number) => void;
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
  freezeRightCount: freezeRightCountProp,
  paginated = false,
  pageSize = 8,
  pageSizeOptions,
  initialPage = 1,
  onPageChange,
  headerTextColor,
  bodyTextColor,
  headerBackground,
  bodyBackground,
  border = false,
  sortable = false,
  onSort,
  className,
  theme = "dark",
}: DataTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);

  const headerText = headerTextColor ?? defaultHeaderTextColor(theme);
  const bodyText = bodyTextColor ?? defaultBodyTextColor(theme);
  const headerBg = headerBackground ?? defaultHeaderBackground(theme);
  const bodyBg = bodyBackground ?? defaultBodyBackground(theme);

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
    Math.ceil(totalItems / (paginated ? currentPageSize : totalItems || 1))
  );

  const safePage = Math.min(Math.max(currentPage, 1), totalPages);

  // Keep pagination state consistent if `data` length (or pageSize) changes.
  // Without this, `currentPage` can point past the end and the footer/page buttons
  // may render in an unexpected state.
  useEffect(() => {
    if (!paginated) return;

    setCurrentPage((prev) => {
      const clamped = Math.min(Math.max(prev, 1), totalPages);
      if (clamped !== prev) {
        onPageChange?.(clamped, currentPageSize);
        return clamped;
      }
      return prev;
    });
  }, [paginated, totalPages, currentPageSize, onPageChange]);

  const pageStartIndex = paginated ? (safePage - 1) * currentPageSize : 0;
  const pageEndIndex = paginated
    ? pageStartIndex + currentPageSize
    : totalItems;

  const visibleData = paginated
    ? sortedData.slice(pageStartIndex, pageEndIndex)
    : sortedData;

  const n = columns.length;
  const isLeftFreeze = freezeColumns === "left" || freezeColumns === "both";
  const isRightFreeze = freezeColumns === "right" || freezeColumns === "both";
  const rightCount = freezeColumns === "both" ? (freezeRightCountProp ?? 1) : freezeCount;
  const leftFreezeCount = isLeftFreeze ? Math.min(freezeCount, n) : 0;
  let rightFreezeCount = isRightFreeze ? Math.min(rightCount, n) : 0;
  if (freezeColumns === "both" && leftFreezeCount + rightFreezeCount > n) {
    rightFreezeCount = Math.max(0, n - leftFreezeCount);
  }

  const borderClass = border
    ? "border border-neutral-200 dark:border-neutral-700"
    : "";
  const cellBorderClass = border
    ? "border-b border-r border-neutral-200 dark:border-neutral-700 last:border-r-0"
    : "";
  const headerCellBorderClass = border
    ? "border-b border-r border-neutral-200 dark:border-neutral-700 last:border-r-0"
    : "";

  return (
    <div className={cn("w-full rounded-lg", className)}>
      <div className="w-full overflow-x-auto">
        <table
          className={cn("w-full min-w-max text-sm text-left", borderClass)}
          role="grid"
        >
          <thead>
            <tr className={cn(headerBg)}>
              {columns.map((col, colIndex) => {
              const isStickyLeft =
                isLeftFreeze && colIndex < leftFreezeCount;
              const isStickyRight =
                isRightFreeze && colIndex >= n - rightFreezeCount;
              const stickyLeft =
                isStickyLeft ? colIndex * STICKY_COL_WIDTH_PX : undefined;
              const stickyRight = isStickyRight
                ? (n - 1 - colIndex) * STICKY_COL_WIDTH_PX
                : undefined;
              const canSort = sortable && col.sortKey != null;
              const ariaSort =
                canSort && sortKey === col.sortKey
                  ? sortDirection === "asc"
                    ? "ascending"
                    : "descending"
                  : undefined;

              return (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={ariaSort}
                  className={cn(
                    "px-4 py-3 font-medium whitespace-nowrap",
                    headerText,
                    headerBg,
                    headerCellBorderClass,
                    canSort && "cursor-pointer select-none hover:opacity-80"
                  )}
                  style={{
                    ...(isStickyLeft && {
                      position: "sticky",
                      left: stickyLeft,
                      zIndex: 10,
                      minWidth: STICKY_COL_WIDTH_PX,
                      boxShadow: stickyLeft
                        ? "4px 0 6px -2px rgba(0,0,0,0.1)"
                        : undefined,
                    }),
                    ...(isStickyRight && {
                      position: "sticky",
                      right: stickyRight,
                      zIndex: 10,
                      minWidth: STICKY_COL_WIDTH_PX,
                      boxShadow:
                        stickyRight !== undefined
                          ? "-4px 0 6px -2px rgba(0,0,0,0.1)"
                          : undefined,
                    }),
                  }}
                  onClick={() => canSort && col.sortKey && handleSort(col.sortKey)}
                >
                  {canSort ? (
                    <span
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          if (col.sortKey) handleSort(col.sortKey);
                        }
                      }}
                      aria-label={`Sort by ${col.label} ${ariaSort ?? ""}`.trim()}
                    >
                      {col.label}
                      {sortKey === col.sortKey && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? " ↑" : " ↓"}
                        </span>
                      )}
                    </span>
                  ) : (
                    col.label
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {visibleData.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={cn(
                bodyBg,
                rowIndex < visibleData.length - 1 &&
                  border &&
                  "border-b border-neutral-200 dark:border-neutral-700"
              )}
            >
              {columns.map((col, colIndex) => {
                const isStickyLeft =
                  isLeftFreeze && colIndex < leftFreezeCount;
                const isStickyRight =
                  isRightFreeze && colIndex >= n - rightFreezeCount;
                const stickyLeft = isStickyLeft
                  ? colIndex * STICKY_COL_WIDTH_PX
                  : undefined;
                const stickyRight = isStickyRight
                  ? (n - 1 - colIndex) * STICKY_COL_WIDTH_PX
                  : undefined;

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
                        minWidth: STICKY_COL_WIDTH_PX,
                        boxShadow: stickyLeft
                          ? "4px 0 6px -2px rgba(0,0,0,0.08)"
                          : undefined,
                      }),
                      ...(isStickyRight && {
                        position: "sticky",
                        right: stickyRight,
                        zIndex: 5,
                        minWidth: STICKY_COL_WIDTH_PX,
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
          ))}
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
                <span className="hidden sm:inline">Rows per page</span>
                <select
                  className={cn(
                    "h-8 rounded-md border border-neutral-300 bg-transparent px-2 text-xs sm:text-sm outline-none",
                    "dark:border-neutral-700"
                  )}
                  value={currentPageSize}
                  onChange={(e) => {
                    const nextSize = Number(e.target.value) || currentPageSize;
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
                className={cn(
                  "px-2 py-1 rounded-md border text-xs sm:text-sm",
                  safePage === 1
                    ? "cursor-not-allowed opacity-40 border-neutral-700"
                    : "hover:bg-neutral-100 dark:hover:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
                )}
                onClick={() => {
                  if (safePage <= 1) return;
                  const nextPage = safePage - 1;
                  setCurrentPage(nextPage);
                  onPageChange?.(nextPage, currentPageSize);
                }}
                disabled={safePage === 1}
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    type="button"
                    className={cn(
                      "px-2 py-1 rounded-md border text-xs sm:text-sm",
                      page === safePage
                        ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-neutral-700 dark:border-neutral-300"
                        : "hover:bg-neutral-100 dark:hover:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
                    )}
                    aria-current={page === safePage ? "page" : undefined}
                    onClick={() => {
                      setCurrentPage(page);
                      onPageChange?.(page, currentPageSize);
                    }}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                type="button"
                className={cn(
                  "px-2 py-1 rounded-md border text-xs sm:text-sm",
                  safePage === totalPages
                    ? "cursor-not-allowed opacity-40 border-neutral-700"
                    : "hover:bg-neutral-100 dark:hover:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
                )}
                onClick={() => {
                  if (safePage >= totalPages) return;
                  const nextPage = safePage + 1;
                  setCurrentPage(nextPage);
                  onPageChange?.(nextPage, currentPageSize);
                }}
                disabled={safePage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
