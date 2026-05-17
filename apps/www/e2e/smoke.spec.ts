// Smoke E2E: each of the four top-level routes must respond 200 and render
// the headline we promise to users. Catches SSR/RSC regressions that unit
// tests don't see (e.g. a hook called at module scope, a server component
// importing a client-only module).

import { test, expect, type Page } from "@playwright/test";

const FATAL_CONSOLE_MARKERS = [
  "hydration",
  "did not match",
  "useLayoutEffect",
  "Maximum update depth",
];

function trackFatalConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (FATAL_CONSOLE_MARKERS.some((m) => text.toLowerCase().includes(m.toLowerCase()))) {
      errors.push(text);
    }
  });
  page.on("pageerror", (err) => {
    errors.push(`pageerror: ${err.message}`);
  });
  return errors;
}

test.describe("smoke", () => {
  test("/ renders the marketing headline", async ({ page }) => {
    const fatal = trackFatalConsoleErrors(page);
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: /Ship cinematic UI/i, level: 1 })).toBeVisible();
    expect(fatal).toEqual([]);
  });

  test("/components lists the registry", async ({ page }) => {
    const fatal = trackFatalConsoleErrors(page);
    const response = await page.goto("/components");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "Components", level: 1 })).toBeVisible();
    // At least one component card link should be rendered from componentsList.
    await expect(page.locator('a[href^="/components/"]').first()).toBeVisible();
    expect(fatal).toEqual([]);
  });

  test("/components/moving-border renders the slug page", async ({ page }) => {
    const fatal = trackFatalConsoleErrors(page);
    const response = await page.goto("/components/moving-border");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: /Moving Border/i, level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Preview", level: 2 })).toBeVisible();
    expect(fatal).toEqual([]);
  });

  test("/blocks lists composed sections", async ({ page }) => {
    const fatal = trackFatalConsoleErrors(page);
    const response = await page.goto("/blocks");
    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole("heading", { name: /Composed sections you can drop into any page/i, level: 1 }),
    ).toBeVisible();
    expect(fatal).toEqual([]);
  });

  test("/docs/compatibility renders the matrix", async ({ page }) => {
    const fatal = trackFatalConsoleErrors(page);
    const response = await page.goto("/docs/compatibility");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "Compatibility", level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Runtime", level: 2 })).toBeVisible();
    expect(fatal).toEqual([]);
  });
});
