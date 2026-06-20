// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DataTable,
  computeWindow,
  type DataTableColumn,
} from "../components/ui/data-table";

interface Person {
  id: string;
  name: string;
  dept: string;
  score: number;
  email: string;
  joined: Date;
}

const people: Person[] = [
  { id: "1", name: "Charlie", dept: "Platform", score: 40, email: "charlie@x.com", joined: new Date("2024-03-01") },
  { id: "2", name: "Alpha", dept: "Product", score: 5, email: "alpha@x.com", joined: new Date("2023-01-15") },
  { id: "3", name: "Bravo", dept: "Platform", score: 100, email: "bravo@x.com", joined: new Date("2023-09-10") },
  { id: "4", name: "Delta", dept: "Product", score: 9, email: "delta@x.com", joined: new Date("2024-06-20") },
];

const personColumns: DataTableColumn<Person>[] = [
  { id: "name", header: "Name", accessor: (row) => row.name },
  { id: "dept", header: "Dept", accessor: (row) => row.dept },
  { id: "score", header: "Score", accessor: (row) => row.score, sortType: "number" },
  { id: "email", header: "Email", accessor: (row) => row.email, searchable: false },
  { id: "joined", header: "Joined", accessor: (row) => row.joined, cell: (row) => row.joined.toISOString().slice(0, 10) },
];

function makeRows(count: number): Person[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `r${i}`,
    name: `Person ${i}`,
    dept: i % 2 === 0 ? "Platform" : "Product",
    score: i,
    email: `p${i}@x.com`,
    joined: new Date(2024, 0, (i % 28) + 1),
  }));
}

function bodyRowTexts(): string[] {
  const table = screen.getByRole("table");
  const body = table.querySelector("tbody");
  if (!body) return [];
  return within(body as HTMLElement)
    .queryAllByRole("row")
    .filter((row) => row.getAttribute("data-spacer") == null)
    .map((row) => row.textContent ?? "");
}

afterEach(() => {
  vi.useRealTimers();
});

describe("DataTable v2 sorting", () => {
  it("cycles header click asc -> desc -> none so users can always return to the source order", () => {
    render(
      <DataTable
        data={people}
        columns={personColumns}
        getRowId={(row) => row.id}
        sortable
      />
    );

    const nameButton = screen.getByRole("button", { name: "Name" });
    const nameHeader = nameButton.closest("th")!;

    fireEvent.click(nameButton);
    expect(nameHeader).toHaveAttribute("aria-sort", "ascending");
    expect(bodyRowTexts()[0]).toContain("Alpha");

    fireEvent.click(nameButton);
    expect(nameHeader).toHaveAttribute("aria-sort", "descending");
    expect(bodyRowTexts()[0]).toContain("Delta");

    fireEvent.click(nameButton);
    expect(nameHeader).not.toHaveAttribute("aria-sort");
    expect(bodyRowTexts()[0]).toContain("Charlie");
  });

  it("sorts numeric columns by value, not lexicographically", () => {
    render(
      <DataTable
        data={people}
        columns={personColumns}
        getRowId={(row) => row.id}
        sortable
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Score" }));
    const rows = bodyRowTexts();
    // Lexicographic order would be 100, 40, 5, 9 — numeric must be 5, 9, 40, 100.
    expect(rows[0]).toContain("Alpha");
    expect(rows[1]).toContain("Delta");
    expect(rows[2]).toContain("Charlie");
    expect(rows[3]).toContain("Bravo");
  });

  it("sorts date columns chronologically via the raw accessor value", () => {
    render(
      <DataTable
        data={people}
        columns={personColumns}
        getRowId={(row) => row.id}
        sortable
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Joined" }));
    const rows = bodyRowTexts();
    expect(rows[0]).toContain("Alpha"); // 2023-01-15
    expect(rows[1]).toContain("Bravo"); // 2023-09-10
    expect(rows[2]).toContain("Charlie"); // 2024-03-01
    expect(rows[3]).toContain("Delta"); // 2024-06-20
  });

  it("shift-click adds a secondary sort key so ties break predictably", () => {
    const onSort = vi.fn();
    render(
      <DataTable
        data={people}
        columns={personColumns}
        getRowId={(row) => row.id}
        sortable
        multiSort
        onSort={onSort}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Dept" }));
    fireEvent.click(screen.getByRole("button", { name: "Score" }), { shiftKey: true });

    const rows = bodyRowTexts();
    // Platform before Product; within each dept, score ascending.
    expect(rows[0]).toContain("Charlie"); // Platform 40
    expect(rows[1]).toContain("Bravo"); // Platform 100
    expect(rows[2]).toContain("Alpha"); // Product 5
    expect(rows[3]).toContain("Delta"); // Product 9

    expect(onSort).toHaveBeenLastCalledWith([
      { id: "dept", direction: "asc" },
      { id: "score", direction: "asc" },
    ]);

    // After multi-sort the priority is announced in the accessible name, so
    // match on the leading column label rather than an exact name.
    const deptHeader = screen
      .getByRole("button", { name: /^Dept\b/ })
      .closest("th")!;
    const scoreHeader = screen
      .getByRole("button", { name: /^Score\b/ })
      .closest("th")!;
    expect(deptHeader).toHaveAttribute("aria-sort", "ascending");
    expect(scoreHeader).toHaveAttribute("aria-sort", "ascending");
    // Priority is exposed to assistive tech for both keys.
    expect(
      screen.getByRole("button", { name: /Dept, sort priority 1/ })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Score, sort priority 2/ })
    ).toBeInTheDocument();
  });
});

describe("DataTable v2 search", () => {
  it("filters rows over searchable columns after the debounce window", () => {
    vi.useFakeTimers();
    render(
      <DataTable
        data={people}
        columns={personColumns}
        getRowId={(row) => row.id}
        searchable
      />
    );

    const input = screen.getByRole("searchbox");
    fireEvent.change(input, { target: { value: "alpha" } });

    // Still unfiltered before the debounce elapses.
    expect(bodyRowTexts()).toHaveLength(4);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    const rows = bodyRowTexts();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toContain("Alpha");
  });

  it("does not match values in searchable:false columns", () => {
    vi.useFakeTimers();
    render(
      <DataTable
        data={people}
        columns={personColumns}
        getRowId={(row) => row.id}
        searchable
      />
    );

    // Every email contains "@x.com" but email is searchable: false.
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "charlie@x.com" },
    });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(bodyRowTexts()).toHaveLength(0);
  });
});

describe("DataTable v2 selection", () => {
  it("select-all targets every filtered row, not just the visible page", () => {
    vi.useFakeTimers();
    const onSelectionChange = vi.fn();
    render(
      <DataTable
        data={people}
        columns={personColumns}
        getRowId={(row) => row.id}
        searchable
        selectable
        paginated
        pageSize={1}
        onSelectionChange={onSelectionChange}
      />
    );

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "platform" },
    });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    fireEvent.click(screen.getByRole("checkbox", { name: /select all/i }));

    expect(onSelectionChange).toHaveBeenLastCalledWith(
      expect.arrayContaining(["1", "3"])
    );
    expect(onSelectionChange.mock.lastCall?.[0]).toHaveLength(2);
  });

  it("select-all preserves selections hidden by an active search", () => {
    vi.useFakeTimers();
    const onSelectionChange = vi.fn();
    render(
      <DataTable
        data={people}
        columns={personColumns}
        getRowId={(row) => row.id}
        searchable
        selectable
        // "2" (Alpha, Product) is selected but will be filtered out below.
        selectedIds={["2"]}
        onSelectionChange={onSelectionChange}
      />
    );

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "platform" },
    });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    fireEvent.click(screen.getByRole("checkbox", { name: /select all/i }));

    // The hidden "2" must survive alongside the newly selected platform rows.
    expect(onSelectionChange).toHaveBeenLastCalledWith(
      expect.arrayContaining(["1", "2", "3"])
    );
    expect(onSelectionChange.mock.lastCall?.[0]).toHaveLength(3);
  });

  it("controlled selection reflects selectedIds and reports toggles without mutating itself", () => {
    const onSelectionChange = vi.fn();
    const { rerender } = render(
      <DataTable
        data={people}
        columns={personColumns}
        getRowId={(row) => row.id}
        selectable
        selectedIds={["2"]}
        onSelectionChange={onSelectionChange}
      />
    );

    const table = screen.getByRole("table");
    const selected = table.querySelectorAll('tbody tr[aria-selected="true"]');
    expect(selected).toHaveLength(1);
    expect(selected[0].textContent).toContain("Alpha");

    const rowCheckboxes = screen.getAllByRole("checkbox", { name: /select row/i });
    fireEvent.click(rowCheckboxes[0]); // Charlie, id "1"
    expect(onSelectionChange).toHaveBeenLastCalledWith(
      expect.arrayContaining(["2", "1"])
    );
    // Controlled: DOM unchanged until the prop changes.
    expect(table.querySelectorAll('tbody tr[aria-selected="true"]')).toHaveLength(1);

    rerender(
      <DataTable
        data={people}
        columns={personColumns}
        getRowId={(row) => row.id}
        selectable
        selectedIds={["2", "1"]}
        onSelectionChange={onSelectionChange}
      />
    );
    expect(table.querySelectorAll('tbody tr[aria-selected="true"]')).toHaveLength(2);
  });
});

describe("DataTable v2 expansion", () => {
  it("toggles the expanded panel and aria-expanded per row", () => {
    render(
      <DataTable
        data={people}
        columns={personColumns}
        getRowId={(row) => row.id}
        expandable
        renderExpanded={(row) => <div>Details for {row.name}</div>}
      />
    );

    const expandButtons = screen.getAllByRole("button", { name: /expand row/i });
    expect(expandButtons).toHaveLength(4);

    fireEvent.click(expandButtons[0]);
    expect(screen.getByText("Details for Charlie")).toBeInTheDocument();
    expect(expandButtons[0]).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(expandButtons[0]);
    expect(screen.queryByText("Details for Charlie")).not.toBeInTheDocument();
  });
});

describe("DataTable v2 pagination", () => {
  it("slices pages and clamps the current page when data shrinks", () => {
    const twelve = makeRows(12);
    const { rerender } = render(
      <DataTable
        data={twelve}
        columns={personColumns}
        getRowId={(row) => row.id}
        paginated
        pageSize={5}
      />
    );

    expect(bodyRowTexts()).toHaveLength(5);
    expect(screen.getByText("Showing 1-5 of 12")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "3" }));
    expect(bodyRowTexts()).toHaveLength(2);
    expect(screen.getByText("Showing 11-12 of 12")).toBeInTheDocument();

    rerender(
      <DataTable
        data={twelve.slice(0, 6)}
        columns={personColumns}
        getRowId={(row) => row.id}
        paginated
        pageSize={5}
      />
    );
    // Page 3 no longer exists; clamp to the last valid page.
    expect(screen.getByText("Showing 6-6 of 6")).toBeInTheDocument();
  });
});

describe("DataTable v2 engines", () => {
  it("auto-virtualizes large flat data and keeps only a window in the DOM with true aria-rowcount", () => {
    const rows = makeRows(1000);
    const { container } = render(
      <DataTable
        data={rows}
        columns={personColumns}
        getRowId={(row) => row.id}
        maxHeight={400}
        rowHeight={40}
      />
    );

    expect(container.querySelector('[data-engine="virtual"]')).not.toBeNull();
    const table = screen.getByRole("table");
    expect(table).toHaveAttribute("aria-rowcount", "1001");

    const rendered = bodyRowTexts();
    expect(rendered.length).toBeGreaterThan(0);
    expect(rendered.length).toBeLessThan(100);
    expect(rendered[0]).toContain("Person 0");
  });

  it("windows follow scroll position", () => {
    const rows = makeRows(1000);
    const { container } = render(
      <DataTable
        data={rows}
        columns={personColumns}
        getRowId={(row) => row.id}
        maxHeight={400}
        rowHeight={40}
      />
    );

    const viewport = container.querySelector("[data-table-viewport]")!;
    fireEvent.scroll(viewport, { target: { scrollTop: 4000 } });

    const rendered = bodyRowTexts();
    expect(rendered.some((text) => text.includes("Person 100"))).toBe(true);
    expect(rendered.join(" ")).not.toMatch(/\bPerson 0\b/);
  });

  it("uses the standard engine when groupBy is set, with collapsible group rows", () => {
    const rows = makeRows(150);
    const { container } = render(
      <DataTable
        data={rows}
        columns={personColumns}
        getRowId={(row) => row.id}
        groupBy="dept"
      />
    );

    expect(container.querySelector('[data-engine="standard"]')).not.toBeNull();

    const platformToggle = screen.getByRole("button", { name: /platform/i });
    expect(platformToggle).toHaveAttribute("aria-expanded", "true");
    expect(platformToggle.textContent).toContain("75");

    const before = bodyRowTexts().length;
    fireEvent.click(platformToggle);
    expect(bodyRowTexts().length).toBeLessThan(before);
    expect(platformToggle).toHaveAttribute("aria-expanded", "false");
  });

  it("preserves selection identity when the engine switches", () => {
    const rows = makeRows(150);
    const { container, rerender } = render(
      <DataTable
        data={rows}
        columns={personColumns}
        getRowId={(row) => row.id}
        selectable
        selectedIds={["r0"]}
        maxHeight={400}
        rowHeight={40}
      />
    );

    expect(container.querySelector('[data-engine="virtual"]')).not.toBeNull();
    expect(
      container.querySelectorAll('tbody tr[aria-selected="true"]').length
    ).toBe(1);

    rerender(
      <DataTable
        data={rows}
        columns={personColumns}
        getRowId={(row) => row.id}
        selectable
        selectedIds={["r0"]}
        groupBy="dept"
      />
    );
    expect(container.querySelector('[data-engine="standard"]')).not.toBeNull();
    expect(
      container.querySelectorAll('tbody tr[aria-selected="true"]').length
    ).toBe(1);
  });

  it("merges consecutive equal values into one rowspan cell in the standard engine", () => {
    const sorted = [...people].sort((a, b) => a.dept.localeCompare(b.dept));
    const columns: DataTableColumn<Person>[] = [
      { id: "dept", header: "Dept", accessor: (row) => row.dept, rowSpan: true },
      { id: "name", header: "Name", accessor: (row) => row.name },
    ];
    render(
      <DataTable data={sorted} columns={columns} getRowId={(row) => row.id} />
    );

    const table = screen.getByRole("table");
    const spanning = table.querySelectorAll("tbody td[rowspan='2']");
    expect(spanning).toHaveLength(2); // Platform x2, Product x2
    expect(table.querySelectorAll("tbody td")).toHaveLength(6); // 8 cells - 2 merged
  });
});

describe("DataTable v2 column groups", () => {
  it("renders nested columns as a two-level header", () => {
    const columns: DataTableColumn<Person>[] = [
      { id: "name", header: "Name", accessor: (row) => row.name },
      {
        id: "work",
        header: "Work",
        accessor: () => null,
        columns: [
          { id: "dept", header: "Dept", accessor: (row) => row.dept },
          { id: "score", header: "Score", accessor: (row) => row.score },
        ],
      },
    ];
    render(
      <DataTable data={people} columns={columns} getRowId={(row) => row.id} />
    );

    const table = screen.getByRole("table");
    const headerRows = table.querySelectorAll("thead tr");
    expect(headerRows).toHaveLength(2);

    const groupHeader = screen.getByRole("columnheader", { name: "Work" });
    expect(groupHeader).toHaveAttribute("colspan", "2");
    const nameHeader = screen.getByRole("columnheader", { name: "Name" });
    expect(nameHeader).toHaveAttribute("rowspan", "2");
  });
});

describe("DataTable v2 presets", () => {
  it("preset 'basic' enables search, pagination, and sorting by default", () => {
    render(
      <DataTable
        data={makeRows(30)}
        columns={personColumns}
        getRowId={(row) => row.id}
        preset="basic"
      />
    );

    expect(screen.getByRole("searchbox")).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: /pagination/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Name" })).toBeInTheDocument();
  });

  it("preset 'advanced' adds multi-select; explicit props still win over the preset", () => {
    render(
      <DataTable
        data={makeRows(10)}
        columns={personColumns}
        getRowId={(row) => row.id}
        preset="advanced"
        searchable={false}
      />
    );

    expect(screen.getAllByRole("checkbox").length).toBeGreaterThan(0);
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });

  it("preset 'enterprise' virtualizes large data", () => {
    const { container } = render(
      <DataTable
        data={makeRows(500)}
        columns={personColumns}
        getRowId={(row) => row.id}
        preset="enterprise"
        maxHeight={400}
      />
    );
    expect(container.querySelector('[data-engine="virtual"]')).not.toBeNull();
  });
});

describe("computeWindow", () => {
  it("returns the visible slice plus overscan with spacer heights that preserve total scroll size", () => {
    const win = computeWindow({
      scrollTop: 0,
      viewportHeight: 400,
      rowHeight: 40,
      rowCount: 1000,
      overscan: 5,
    });
    expect(win.start).toBe(0);
    expect(win.end).toBe(15); // 10 visible + 5 overscan
    expect(win.padTop).toBe(0);
    expect(win.padBottom).toBe((1000 - 15) * 40);
  });

  it("centers the window on the scroll offset", () => {
    const win = computeWindow({
      scrollTop: 4000,
      viewportHeight: 400,
      rowHeight: 40,
      rowCount: 1000,
      overscan: 5,
    });
    expect(win.start).toBe(95); // row 100 visible, minus overscan
    expect(win.end).toBe(115);
    expect(win.padTop).toBe(95 * 40);
    expect(win.padBottom).toBe((1000 - 115) * 40);
    // Spacers + window must always equal the full scroll height.
    expect(win.padTop + (win.end - win.start) * 40 + win.padBottom).toBe(
      1000 * 40
    );
  });

  it("clamps at the end of the list", () => {
    const win = computeWindow({
      scrollTop: 999999,
      viewportHeight: 400,
      rowHeight: 40,
      rowCount: 100,
      overscan: 5,
    });
    expect(win.end).toBe(100);
    expect(win.start).toBeLessThan(100);
    expect(win.padBottom).toBe(0);
  });
});
