// Visual regression suite (opt-in). Run via:
//   pnpm test:visual              # validate against committed baselines
//   pnpm test:visual:update       # regenerate baselines (review the diff before committing!)
//
// Baselines live under apps/www/e2e/visual.spec.ts-snapshots/ and ARE committed
// so CI can fail on unintended visual drift. Animations are disabled via the
// playwright.config `toHaveScreenshot.animations` setting. Heroes that key
// off real time or `Math.random()` will produce flaky diffs — convert them
// to deterministic input (a seeded value, a pinned timestamp) before adding
// them to the matrix below.

import { test, expect } from "@playwright/test";

// Disabling animations is not enough on its own — heroes that key off
// `useMotionValue(scrollY)` still react to layout shift. We freeze the
// viewport scroll position before each shot.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    // Stop the scroll-driven heroes from drifting between runs.
    Object.defineProperty(window, "scrollY", { configurable: true, get: () => 0 });
  });
});

test.describe("visual: marketing", () => {
  test("home hero", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("heading", { level: 1 }).first().waitFor();
    await expect(page).toHaveScreenshot("home-hero.png", { fullPage: false });
  });

  test("components index", async ({ page }) => {
    await page.goto("/components");
    await page.getByRole("heading", { name: "Components", level: 1 }).waitFor();
    await expect(page).toHaveScreenshot("components-index.png", { fullPage: false });
  });

  test("blocks index", async ({ page }) => {
    await page.goto("/blocks");
    await page.getByRole("heading", { level: 1 }).first().waitFor();
    await expect(page).toHaveScreenshot("blocks-index.png", { fullPage: false });
  });
});

const componentSlugs = [
  "moving-border",
  "typewriter-text",
];

test.describe("visual: components", () => {
  for (const slug of componentSlugs) {
    test(`slug page: ${slug}`, async ({ page }) => {
      await page.goto(`/components/${slug}`);
      await page.getByRole("heading", { level: 1 }).waitFor();
      // Preview lives in a heading == "Preview" section — wait for it specifically.
      await page.getByRole("heading", { name: "Preview", level: 2 }).waitFor();
      await expect(page).toHaveScreenshot(`component-${slug}.png`, { fullPage: false });
    });
  }
});

test.describe("visual: docs", () => {
  test("compatibility matrix", async ({ page }) => {
    await page.goto("/docs/compatibility");
    await page.getByRole("heading", { name: "Compatibility", level: 1 }).waitFor();
    await expect(page).toHaveScreenshot("docs-compatibility.png", { fullPage: false });
  });

  test("theming guide", async ({ page }) => {
    await page.goto("/docs/theming");
    await page.getByRole("heading", { name: "Theming", level: 1 }).waitFor();
    await expect(page).toHaveScreenshot("docs-theming.png", { fullPage: false });
  });
});
