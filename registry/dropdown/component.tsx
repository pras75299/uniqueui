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
import { Check, ChevronDown, Minus, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type DropdownOption = {
  /** Unique value; returned via onChange. */
  value: string;
  /** Visible text; matched against when searching. */
  label: string;
  /** Optional leading icon node. */
  icon?: React.ReactNode;
  /** Optional CSS color for a leading dot (e.g. "#22c55e"). */
  color?: string;
  /** Optional secondary line under the label. */
  description?: string;
  /** Consecutive options sharing this render as a labelled section. */
  group?: string;
  disabled?: boolean;
};

export interface DropdownProps {
  options: DropdownOption[];
  /** Controlled value. string[] in multiple mode, string in single mode. */
  value?: string | string[];
  /** Uncontrolled initial value. */
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  /** Show a "Select all / Deselect all" row (multiple mode only). */
  showSelectAll?: boolean;
  /**
   * Selection marker. Defaults to "checkbox" in multiple mode and "check" in
   * single mode. "radio" suits single-choice lists.
   */
  selectionIndicator?: "checkbox" | "radio" | "check" | "none";
  /** Render selected items as removable chips (multiple mode). Otherwise a count. */
  chips?: boolean;
  /** Max chips before collapsing to "+N". Default 3. */
  maxVisibleChips?: number;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  selectAllLabel?: string;
  disabled?: boolean;
  theme?: "light" | "dark";
  className?: string;
}

export function Dropdown({
  options,
  value,
  defaultValue,
  onChange,
  multiple = false,
  searchable = false,
  clearable = false,
  showSelectAll = false,
  selectionIndicator,
  chips = false,
  maxVisibleChips = 3,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyMessage = "No options found",
  selectAllLabel = "Select all",
  disabled = false,
  theme = "dark",
  className,
}: DropdownProps) {
  const dark = theme === "dark";
  const reduceMotion = useReducedMotion();

  const baseId = useId();
  const listboxId = `${baseId}-listbox`;
  const optionId = (i: number) => `${baseId}-option-${i}`;

  const indicator = selectionIndicator ?? (multiple ? "checkbox" : "check");

  const normalize = (v: string | string[] | undefined): string[] =>
    v == null ? [] : Array.isArray(v) ? v : v ? [v] : [];

  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<string[]>(() =>
    normalize(defaultValue),
  );
  const selected = isControlled ? normalize(value) : internal;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const optionByValue = useMemo(() => {
    const map = new Map<string, DropdownOption>();
    for (const o of options) map.set(o.value, o);
    return map;
  }, [options]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? options.filter((o) => o.label.toLowerCase().includes(q))
      : options;
  }, [options, query]);

  const enabledValues = useMemo(
    () => options.filter((o) => !o.disabled).map((o) => o.value),
    [options],
  );
  const allSelected =
    enabledValues.length > 0 && enabledValues.every((v) => selected.includes(v));
  const someSelected = enabledValues.some((v) => selected.includes(v));

  const commit = useCallback(
    (next: string[]) => {
      if (!isControlled) setInternal(next);
      onChange?.(multiple ? next : (next[0] ?? ""));
    },
    [isControlled, multiple, onChange],
  );

  const toggle = useCallback(
    (option: DropdownOption) => {
      if (option.disabled) return;
      if (multiple) {
        const next = selected.includes(option.value)
          ? selected.filter((v) => v !== option.value)
          : [...selected, option.value];
        commit(next);
      } else {
        commit([option.value]);
        setOpen(false);
        setQuery("");
      }
    },
    [commit, multiple, selected],
  );

  const clearAll = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      commit([]);
    },
    [commit],
  );

  const toggleSelectAll = useCallback(() => {
    commit(allSelected ? [] : enabledValues);
  }, [allSelected, commit, enabledValues]);

  // Move active option, skipping disabled entries.
  const move = useCallback(
    (dir: 1 | -1) => {
      if (!visible.length) return;
      setActiveIndex((current) => {
        let i = current;
        for (let step = 0; step < visible.length; step++) {
          i = (i + dir + visible.length) % visible.length;
          if (!visible[i]?.disabled) return i;
        }
        return current;
      });
    },
    [visible],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) setOpen(true);
        else move(1);
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!open) setOpen(true);
        else move(-1);
        break;
      case "Enter":
      case " ":
        if (open && activeIndex >= 0 && visible[activeIndex]) {
          e.preventDefault();
          toggle(visible[activeIndex]);
        } else if (!open) {
          e.preventDefault();
          setOpen(true);
        }
        break;
      case "Home":
        if (open) {
          e.preventDefault();
          setActiveIndex(-1);
          move(1);
        }
        break;
      case "End":
        if (open) {
          e.preventDefault();
          setActiveIndex(0);
          move(-1);
        }
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          setOpen(false);
          triggerRef.current?.focus({ preventScroll: true });
        }
        break;
      case "Tab":
        if (open) setOpen(false);
        break;
    }
  };

  // Close on outside pointer interaction.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // On open: focus search (if any), seed the active option.
  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    const firstSelected = visible.findIndex(
      (o) => selected.includes(o.value) && !o.disabled,
    );
    const firstEnabled = visible.findIndex((o) => !o.disabled);
    setActiveIndex(firstSelected >= 0 ? firstSelected : firstEnabled);
    // preventScroll: focusing the search input must not scroll the page/panel
    // into view, which causes a visible jump when opening.
    if (searchable) searchRef.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, searchable]);

  // Keep active option in view.
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  // Reset active option to top whenever the filtered set changes.
  useEffect(() => {
    if (open) setActiveIndex(visible.findIndex((o) => !o.disabled));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Group consecutive options sharing a `group`.
  const sections = useMemo(() => {
    const out: {
      group?: string;
      items: { option: DropdownOption; index: number }[];
    }[] = [];
    visible.forEach((option, index) => {
      const last = out[out.length - 1];
      if (last && last.group === option.group) {
        last.items.push({ option, index });
      } else {
        out.push({ group: option.group, items: [{ option, index }] });
      }
    });
    return out;
  }, [visible]);

  const selectedOptions = selected
    .map((v) => optionByValue.get(v))
    .filter((o): o is DropdownOption => Boolean(o));

  return (
    <div ref={containerRef} className={cn("relative w-full max-w-sm", className)}>
      {/* Trigger */}
      <div
        ref={triggerRef}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-disabled={disabled || undefined}
        aria-activedescendant={
          open && activeIndex >= 0 ? optionId(activeIndex) : undefined
        }
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={disabled ? undefined : onKeyDown}
        className={cn(
          "flex min-h-[42px] w-full cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm outline-none transition-colors",
          dark
            ? "border-neutral-800 bg-neutral-900 text-neutral-100 focus:border-neutral-600"
            : "border-neutral-200 bg-white text-neutral-900 focus:border-neutral-400",
          open && (dark ? "border-neutral-600" : "border-neutral-400"),
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {selectedOptions.length === 0 && (
            <span className={dark ? "text-neutral-500" : "text-neutral-400"}>
              {placeholder}
            </span>
          )}

          {/* Single value */}
          {!multiple && selectedOptions[0] && (
            <span className="flex items-center gap-2 truncate">
              <OptionGlyph option={selectedOptions[0]} />
              <span className="truncate">{selectedOptions[0].label}</span>
            </span>
          )}

          {/* Multi: chips or count */}
          <AnimatePresence initial={false}>
            {multiple &&
              chips &&
              selectedOptions.slice(0, maxVisibleChips).map((option) => (
                <motion.span
                  key={option.value}
                  layout={!reduceMotion}
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={cn(
                    "flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs",
                    dark
                      ? "bg-neutral-800 text-neutral-200"
                      : "bg-neutral-100 text-neutral-700",
                  )}
                >
                  <OptionGlyph option={option} small />
                  <span className="max-w-[8rem] truncate">{option.label}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${option.label}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(option);
                    }}
                    className={cn(
                      "rounded-sm transition-colors",
                      dark ? "hover:text-white" : "hover:text-neutral-900",
                    )}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.span>
              ))}
          </AnimatePresence>

          {multiple && chips && selectedOptions.length > maxVisibleChips && (
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-xs",
                dark
                  ? "bg-neutral-800 text-neutral-400"
                  : "bg-neutral-100 text-neutral-500",
              )}
            >
              +{selectedOptions.length - maxVisibleChips}
            </span>
          )}

          {multiple && !chips && selectedOptions.length > 0 && (
            <span>{selectedOptions.length} selected</span>
          )}
        </div>

        {clearable && selectedOptions.length > 0 && !disabled && (
          <button
            type="button"
            aria-label="Clear selection"
            onClick={clearAll}
            className={cn(
              "shrink-0 rounded-md p-0.5 transition-colors",
              dark
                ? "text-neutral-500 hover:bg-neutral-800 hover:text-neutral-200"
                : "text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700",
            )}
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <ChevronDown
          aria-hidden
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200",
            open && "rotate-180",
            dark ? "text-neutral-500" : "text-neutral-400",
          )}
        />
      </div>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.98 }
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
            {searchable && (
              <div
                className={cn(
                  "flex items-center gap-2 border-b px-3 py-2",
                  dark ? "border-neutral-800" : "border-neutral-200",
                )}
              >
                <Search
                  aria-hidden
                  className={cn(
                    "h-4 w-4 shrink-0",
                    dark ? "text-neutral-500" : "text-neutral-400",
                  )}
                />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  placeholder={searchPlaceholder}
                  aria-label={searchPlaceholder}
                  autoComplete="off"
                  spellCheck={false}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onKeyDown}
                  className={cn(
                    "w-full bg-transparent text-sm outline-none",
                    dark
                      ? "text-neutral-100 placeholder:text-neutral-500"
                      : "text-neutral-900 placeholder:text-neutral-400",
                  )}
                />
              </div>
            )}

            {multiple && showSelectAll && visible.length > 0 && (
              <button
                type="button"
                onClick={toggleSelectAll}
                className={cn(
                  "flex w-full items-center gap-2.5 border-b px-3 py-2 text-sm font-medium transition-colors",
                  dark
                    ? "border-neutral-800 text-neutral-200 hover:bg-neutral-800/60"
                    : "border-neutral-200 text-neutral-700 hover:bg-neutral-100",
                )}
              >
                <CheckboxBox
                  checked={allSelected}
                  indeterminate={!allSelected && someSelected}
                  dark={dark}
                />
                {allSelected ? "Deselect all" : selectAllLabel}
              </button>
            )}

            <div
              ref={listRef}
              id={listboxId}
              role="listbox"
              aria-multiselectable={multiple || undefined}
              aria-label={placeholder}
              // Keep trigger/search focus when clicking an option.
              onMouseDown={(e) => e.preventDefault()}
              className="max-h-64 overflow-y-auto p-1"
            >
              {visible.length === 0 && (
                <div
                  className={cn(
                    "px-3 py-3 text-sm",
                    dark ? "text-neutral-500" : "text-neutral-400",
                  )}
                >
                  {emptyMessage}
                </div>
              )}

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
                    const isSelected = selected.includes(option.value);
                    const active = index === activeIndex;
                    return (
                      <div
                        key={option.value}
                        id={optionId(index)}
                        data-index={index}
                        role="option"
                        aria-selected={isSelected}
                        aria-disabled={option.disabled || undefined}
                        onClick={() => toggle(option)}
                        onMouseMove={() =>
                          !option.disabled && setActiveIndex(index)
                        }
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm",
                          option.disabled
                            ? "cursor-not-allowed opacity-40"
                            : "cursor-pointer",
                          !option.disabled &&
                            active &&
                            (dark ? "bg-neutral-800" : "bg-neutral-100"),
                          dark ? "text-neutral-200" : "text-neutral-700",
                        )}
                      >
                        <SelectionMark
                          indicator={indicator}
                          checked={isSelected}
                          dark={dark}
                        />
                        <OptionGlyph option={option} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate">{option.label}</span>
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
                        {indicator === "check" && isSelected && (
                          <motion.span
                            initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 600, damping: 30 }}
                          >
                            <Check
                              className={cn(
                                "h-4 w-4 shrink-0",
                                dark ? "text-purple-400" : "text-purple-600",
                              )}
                            />
                          </motion.span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Leading icon or color dot for an option. */
function OptionGlyph({
  option,
  small,
}: {
  option: DropdownOption;
  small?: boolean;
}) {
  if (option.icon) {
    return (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center",
          small ? "size-3.5" : "size-4",
        )}
      >
        {option.icon}
      </span>
    );
  }
  if (option.color) {
    return (
      <span
        aria-hidden
        className={cn("shrink-0 rounded-full", small ? "size-2" : "size-2.5")}
        style={{ backgroundColor: option.color }}
      />
    );
  }
  return null;
}

/** Per-option selection marker (checkbox / radio); "check"/"none" render nothing here. */
function SelectionMark({
  indicator,
  checked,
  dark,
}: {
  indicator: "checkbox" | "radio" | "check" | "none";
  checked: boolean;
  dark: boolean;
}) {
  if (indicator === "checkbox")
    return <CheckboxBox checked={checked} dark={dark} />;
  if (indicator === "radio") {
    return (
      <span
        aria-hidden
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors",
          checked
            ? "border-purple-500"
            : dark
              ? "border-neutral-600"
              : "border-neutral-300",
        )}
      >
        {checked && <span className="size-2 rounded-full bg-purple-500" />}
      </span>
    );
  }
  return null;
}

function CheckboxBox({
  checked,
  indeterminate,
  dark,
}: {
  checked: boolean;
  indeterminate?: boolean;
  dark: boolean;
}) {
  const filled = checked || indeterminate;
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-[5px] border transition-colors",
        filled
          ? "border-purple-500 bg-purple-500 text-white"
          : dark
            ? "border-neutral-600"
            : "border-neutral-300",
      )}
    >
      {indeterminate ? (
        <Minus className="h-3 w-3" strokeWidth={3} />
      ) : checked ? (
        <Check className="h-3 w-3" strokeWidth={3} />
      ) : null}
    </span>
  );
}
