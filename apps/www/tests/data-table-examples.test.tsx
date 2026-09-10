// @vitest-environment jsdom
import React from "react";
import { render, screen, cleanup, fireEvent, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { componentDemos } from "../config/demos";
import manifest from "../../../registry/components/data-table.json";

beforeEach(() => {
  vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it.each(["basic","advanced","virtualized","grouped","column-groups","freeze-left","freeze-right","freeze-multiple-left","freeze-multiple-right","freeze-both","freeze-virtualized","freeze-groups","pinned-rows","controlled","page-sizes","sticky-header","light","custom-colors","empty"])("ships a working, copyable %s example", (id) => {
  const variant = manifest.docs.variants.find((entry) => entry.id === id);
  expect(variant, "Every supported scenario needs a visible docs example").toBeDefined();
  expect(variant?.usageCode).toContain("export default function");
  const Demo = componentDemos[variant!.demoKey];
  expect(Demo, "The published example must have a live preview").toBeDefined();
  render(<Demo theme="dark" />);
  expect(screen.getByRole("table")).toBeInTheDocument();
});

it("lets customers exercise controlled selection and expansion", () => {
  const Demo = componentDemos["data-table/controlled"];
  render(<Demo theme="dark" />);
  const row = screen.getByRole("table").querySelector("tbody tr[data-row]") as HTMLElement;
  const checkbox = within(row).getByRole("checkbox");
  expect(checkbox).toBeChecked();
  fireEvent.click(checkbox);
  expect(checkbox).not.toBeChecked();
  const expand = within(row).getByRole("button", { name: "Expand row" });
  expect(expand).toHaveAttribute("aria-expanded", "true");
  fireEvent.click(expand);
  expect(expand).toHaveAttribute("aria-expanded", "false");
  expect(screen.queryByText("Details for Alex Kim")).not.toBeInTheDocument();
});

it("lets customers change the number of rows per page", () => {
  const Demo = componentDemos["data-table/page-sizes"];
  render(<Demo theme="dark" />);
  const rows = () => screen.getByRole("table").querySelectorAll("tbody tr[data-row]").length;
  expect(rows()).toBe(5);
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "10" } });
  expect(rows()).toBe(10);
});
