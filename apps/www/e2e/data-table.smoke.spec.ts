import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/components/data-table");
});

test("frozen columns stay aligned on both edges while real content scrolls", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const id of ["freeze-left", "freeze-right", "freeze-multiple-left", "freeze-multiple-right", "freeze-both", "freeze-virtualized", "freeze-groups"]) {
    const section = page.locator(`section[aria-labelledby="variant-${id}"]`);
    const viewport = section.locator("[data-table-viewport]");
    await viewport.scrollIntoViewIfNeeded();
    const geometry = () => viewport.evaluate((el) => {
      const cells = Array.from(el.querySelectorAll("tbody tr[data-row]:first-child td"));
      const frozen = cells.filter((cell) => getComputedStyle(cell).position === "sticky");
      return {
        overflow: el.scrollWidth - el.clientWidth,
        positions: frozen.map((cell) => ({ left: cell.getBoundingClientRect().left, right: cell.getBoundingClientRect().right })),
      };
    });
    const before = await geometry();
    expect(before.overflow, id).toBeGreaterThan(0);
    expect(before.positions.length, id).toBeGreaterThan(0);
    await viewport.evaluate((el) => { el.scrollLeft = el.scrollWidth; });
    await expect.poll(async () => {
      const after = await geometry();
      return Math.max(...after.positions.map((cell, i) => Math.abs(cell.left - before.positions[i].left)));
    }, { message: `${id}: frozen cells must not move horizontally` }).toBeLessThan(2);
    const after = await geometry();
    for (let i = 1; i < after.positions.length; i++) {
      expect(after.positions[i].left, `${id}: adjacent frozen cells must not overlap`).toBeGreaterThanOrEqual(after.positions[i - 1].right - 2);
    }
  }
  expect(errors).toEqual([]);
});

test("frozen grouped headers keep both levels visible after vertical and horizontal scrolling", async ({ page }) => {
  const viewport = page.locator('section[aria-labelledby="variant-freeze-groups"] [data-table-viewport]');
  await viewport.scrollIntoViewIfNeeded();
  await viewport.evaluate((el) => { el.scrollTop = 200; el.scrollLeft = 300; });
  const parent = viewport.getByRole("columnheader", { name: "Identity", exact: true });
  const child = viewport.getByRole("columnheader", { name: "Name", exact: true });
  await expect.poll(async () => {
    const a = await parent.boundingBox();
    const b = await child.boundingBox();
    return Math.abs(b!.y - (a!.y + a!.height));
  }).toBeLessThan(2);
  const left = await parent.boundingBox();
  const name = await child.boundingBox();
  expect(Math.abs(left!.x - name!.x)).toBeLessThan(2);
});

test("multiple pinned rows remain stacked below the header", async ({ page }) => {
  const viewport = page.locator('section[aria-labelledby="variant-pinned-rows"] [data-table-viewport]');
  await viewport.scrollIntoViewIfNeeded();
  await viewport.evaluate((el) => { el.scrollTop = 350; el.scrollLeft = 200; });
  await expect.poll(async () => {
    return viewport.evaluate((el) => {
      const headerBottom = Math.max(...Array.from(el.querySelectorAll("thead th"),
        (cell) => cell.getBoundingClientRect().bottom));
      const rows = Array.from(el.querySelectorAll("[data-pinned-row]"),
        (row) => row.getBoundingClientRect());
      return Math.max(
        Math.abs(rows[0].top - headerBottom),
        Math.abs(rows[1].top - rows[0].bottom),
      );
    });
  }).toBeLessThan(2);
});
