"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type AutocompleteOption = {
  /** Stable, unique value used as the React key and returned on select. */
  value: string;
  /** Visible text; also what is matched against and highlighted. */
  label: string;
  /** Optional section label — consecutive options sharing it are grouped. */
  group?: string;
  /** Optional secondary line shown under the label. */
  description?: string;
  /** Optional leading icon node. */
  icon?: React.ReactNode;
};

export interface AutocompleteSearchProps {
  /** Static option list (synchronous local filtering). Ignored when `onSearch` is set. */
  options?: AutocompleteOption[];
  /** Async resolver — return matching options for a query. Enables async mode. */
  onSearch?: (query: string) => Promise<AutocompleteOption[]>;
  /** Fired when an option is chosen via click or Enter. */
  onSelect?: (option: AutocompleteOption) => void;
  placeholder?: string;
  /** Debounce before filtering/fetching. Default 300ms. */
  debounceMs?: number;
  /** Minimum characters before searching. Default 0. */
  minChars?: number;
  emptyMessage?: string;
  loadingMessage?: string;
  /** Shown when the query is below `minChars` (only if provided). */
  hintMessage?: string;
  errorMessage?: string;
  theme?: "light" | "dark";
  className?: string;
}

type Status = "idle" | "loading" | "error";

export function AutocompleteSearch({
  options,
  onSearch,
  onSelect,
  placeholder = "Search…",
  debounceMs = 300,
  minChars = 0,
  emptyMessage = "No results found",
  loadingMessage = "Searching…",
  hintMessage,
  errorMessage = "Something went wrong. Try again.",
  theme = "dark",
  className,
}: AutocompleteSearchProps) {
  const dark = theme === "dark";
  const reduceMotion = useReducedMotion();

  const baseId = useId();
  const listboxId = `${baseId}-listbox`;
  const statusId = `${baseId}-status`;
  const optionId = (i: number) => `${baseId}-option-${i}`;

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<AutocompleteOption[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [status, setStatus] = useState<Status>("idle");

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  // Monotonic id so a slow async response can't overwrite a newer query.
  const requestIdRef = useRef(0);

  const trimmed = query.trim();
  const belowMin = trimmed.length < minChars;

  // Debounced sync filter / async fetch. All state writes live in the timer or
  // promise callback so nothing runs synchronously in the effect body.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (belowMin) {
        requestIdRef.current++; // invalidate any in-flight async result
        setResults([]);
        setActiveIndex(-1);
        setStatus("idle");
        return;
      }

      // Sync mode — local case-insensitive substring filter.
      if (!onSearch) {
        const needle = trimmed.toLowerCase();
        const next = (options ?? []).filter((o) =>
          o.label.toLowerCase().includes(needle),
        );
        setResults(next);
        setActiveIndex(next.length ? 0 : -1);
        setStatus("idle");
        return;
      }

      // Async mode — fetch with a stale-response guard.
      setStatus("loading");
      const reqId = ++requestIdRef.current;
      onSearch(trimmed)
        .then((next) => {
          if (reqId !== requestIdRef.current) return;
          setResults(next);
          setActiveIndex(next.length ? 0 : -1);
          setStatus("idle");
        })
        .catch(() => {
          if (reqId !== requestIdRef.current) return;
          setResults([]);
          setActiveIndex(-1);
          setStatus("error");
        });
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [trimmed, belowMin, onSearch, options, debounceMs]);

  // Close on outside pointer interaction.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Keep the active option scrolled into view during keyboard navigation.
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const select = useCallback(
    (option: AutocompleteOption) => {
      setQuery(option.label);
      setOpen(false);
      setActiveIndex(-1);
      onSelect?.(option);
      inputRef.current?.focus();
    },
    [onSelect],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) {
          setOpen(true);
          break;
        }
        setActiveIndex((i) => (results.length ? (i + 1) % results.length : -1));
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!open) {
          setOpen(true);
          break;
        }
        setActiveIndex((i) =>
          results.length ? (i - 1 + results.length) % results.length : -1,
        );
        break;
      case "Enter":
        if (open && activeIndex >= 0 && results[activeIndex]) {
          e.preventDefault();
          select(results[activeIndex]);
        }
        break;
      case "Escape":
        if (open) {
          setOpen(false);
          setActiveIndex(-1);
        } else if (query) {
          setQuery("");
        }
        break;
    }
  };

  // Group consecutive options that share a `group` label.
  const sections = useMemo(() => {
    const out: {
      group?: string;
      items: { option: AutocompleteOption; index: number }[];
    }[] = [];
    results.forEach((option, index) => {
      const last = out[out.length - 1];
      if (last && last.group === option.group) {
        last.items.push({ option, index });
      } else {
        out.push({ group: option.group, items: [{ option, index }] });
      }
    });
    return out;
  }, [results]);

  const showLoading = open && status === "loading";
  const showError = open && status === "error";
  const showList = open && status === "idle" && results.length > 0;
  const showHint = open && belowMin && !!hintMessage;
  const showEmpty =
    open && status === "idle" && !belowMin && results.length === 0;
  const dropdownOpen =
    showLoading || showError || showList || showHint || showEmpty;

  const statusText = showLoading
    ? loadingMessage
    : showError
      ? errorMessage
      : showList
        ? `${results.length} result${results.length === 1 ? "" : "s"} available`
        : showEmpty
          ? emptyMessage
          : "";

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full max-w-md", className)}
    >
      <div className="relative">
        <Search
          aria-hidden
          className={cn(
            "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2",
            dark ? "text-neutral-500" : "text-neutral-400",
          )}
        />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={dropdownOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            showList && activeIndex >= 0 ? optionId(activeIndex) : undefined
          }
          aria-label={placeholder}
          autoComplete="off"
          spellCheck={false}
          value={query}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className={cn(
            "w-full rounded-xl border py-2.5 pl-9 pr-9 text-sm outline-none transition-colors",
            dark
              ? "border-neutral-800 bg-neutral-900 text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-600"
              : "border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400",
          )}
        />
        {showLoading && (
          <Loader2
            aria-hidden
            className={cn(
              "absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin",
              dark ? "text-neutral-500" : "text-neutral-400",
            )}
          />
        )}
      </div>

      <div id={statusId} role="status" aria-live="polite" className="sr-only">
        {statusText}
      </div>

      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: -4, scale: 0.98 }
            }
            transition={
              reduceMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 520, damping: 36 }
            }
            className={cn(
              "absolute z-50 mt-2 w-full overflow-hidden rounded-xl border shadow-xl",
              dark
                ? "border-neutral-800 bg-neutral-900"
                : "border-neutral-200 bg-white",
            )}
          >
            {showLoading && (
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-3 text-sm",
                  dark ? "text-neutral-400" : "text-neutral-500",
                )}
              >
                <Loader2 aria-hidden className="size-4 animate-spin" />
                {loadingMessage}
              </div>
            )}

            {showError && (
              <div
                className={cn(
                  "px-3 py-3 text-sm",
                  dark ? "text-red-400" : "text-red-600",
                )}
              >
                {errorMessage}
              </div>
            )}

            {showHint && (
              <div
                className={cn(
                  "px-3 py-3 text-sm",
                  dark ? "text-neutral-500" : "text-neutral-400",
                )}
              >
                {hintMessage}
              </div>
            )}

            {showEmpty && (
              <div
                className={cn(
                  "px-3 py-3 text-sm",
                  dark ? "text-neutral-500" : "text-neutral-400",
                )}
              >
                {emptyMessage}
              </div>
            )}

            {showList && (
              <div
                ref={listRef}
                id={listboxId}
                role="listbox"
                aria-label={placeholder}
                // Keep input focus when clicking an option.
                onMouseDown={(e) => e.preventDefault()}
                className="max-h-72 overflow-y-auto p-1"
              >
                {sections.map((section, si) => (
                  <div
                    key={section.group ?? `section-${si}`}
                    role={section.group ? "group" : undefined}
                    aria-label={section.group}
                  >
                    {section.group && (
                      <div
                        aria-hidden
                        className={cn(
                          "px-2.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider",
                          dark ? "text-neutral-500" : "text-neutral-400",
                        )}
                      >
                        {section.group}
                      </div>
                    )}
                    {section.items.map(({ option, index }) => {
                      const active = index === activeIndex;
                      return (
                        <div
                          key={option.value}
                          id={optionId(index)}
                          data-index={index}
                          role="option"
                          aria-selected={active}
                          onClick={() => select(option)}
                          onMouseMove={() => setActiveIndex(index)}
                          className={cn(
                            "flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                            active
                              ? dark
                                ? "bg-neutral-800 text-neutral-100"
                                : "bg-neutral-100 text-neutral-900"
                              : dark
                                ? "text-neutral-300"
                                : "text-neutral-700",
                          )}
                        >
                          {option.icon && (
                            <span className="flex size-4 shrink-0 items-center justify-center">
                              {option.icon}
                            </span>
                          )}
                          <span className="min-w-0 flex-1">
                            <span className="block truncate">
                              {highlightMatch(option.label, trimmed, dark)}
                            </span>
                            {option.description && (
                              <span
                                className={cn(
                                  "block truncate text-xs",
                                  dark ? "text-neutral-500" : "text-neutral-400",
                                )}
                              >
                                {option.description}
                              </span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Bold the first case-insensitive substring of `query` within `label`. */
function highlightMatch(label: string, query: string, dark: boolean) {
  if (!query) return label;
  const i = label.toLowerCase().indexOf(query.toLowerCase());
  if (i === -1) return label;
  return (
    <>
      {label.slice(0, i)}
      <span
        className={cn("font-semibold", dark ? "text-purple-400" : "text-purple-600")}
      >
        {label.slice(i, i + query.length)}
      </span>
      {label.slice(i + query.length)}
    </>
  );
}
