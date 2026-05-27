// Performance budgets — LCP and CLS thresholds on key pages.
// Targets from the backlog:
//   LCP on /components < 2.5s on desktop Chrome (proxy for mid-mobile)
//   CLS < 0.05 on component slug pages
//
// Observers are injected via addInitScript BEFORE navigation so they capture
// entries from the very first paint — a post-navigate evaluate() would miss
// LCP entries already dispatched by the time the script runs.

import { test, expect } from "@playwright/test";

const LCP_BUDGET_MS = 2500;
const CLS_BUDGET = 0.05;

declare global {
  interface Window {
    __lcp: number;
    __cls: number;
  }
}

test.describe("perf budgets", () => {
  test("/components LCP < 2.5s", async ({ page }) => {
    // Inject the LCP observer before the page loads so it captures the first
    // paint from the very beginning — post-navigate evaluate() misses entries
    // already dispatched by the time the script runs.
    await page.addInitScript(() => {
      window.__lcp = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
        if (last) window.__lcp = last.startTime;
      });
      observer.observe({ type: "largest-contentful-paint", buffered: true });
    });

    await page.goto("/components", { waitUntil: "load" });
    // Allow a short drain for any deferred LCP candidates.
    await page.waitForTimeout(500);

    const lcp = await page.evaluate(() => window.__lcp);
    expect(
      lcp,
      `/components LCP ${lcp.toFixed(0)}ms exceeds budget of ${LCP_BUDGET_MS}ms`,
    ).toBeLessThan(LCP_BUDGET_MS);
  });

  test("/components/moving-border CLS < 0.05", async ({ page }) => {
    // Inject the CLS observer before navigation for the same reason as LCP.
    await page.addInitScript(() => {
      window.__cls = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const le = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
          if (!le.hadRecentInput) window.__cls += le.value;
        }
      });
      observer.observe({ type: "layout-shift", buffered: true });
    });

    await page.goto("/components/moving-border", { waitUntil: "load" });
    // Allow layout to stabilise after load.
    await page.waitForTimeout(1000);

    const cls = await page.evaluate(() => window.__cls);
    expect(
      cls,
      `/components/moving-border CLS ${cls.toFixed(4)} exceeds budget of ${CLS_BUDGET}`,
    ).toBeLessThan(CLS_BUDGET);
  });
});
