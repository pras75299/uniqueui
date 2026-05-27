// Performance budgets — LCP and CLS thresholds on key pages.
// Targets from the backlog:
//   LCP on /components < 2.5s on desktop Chrome (proxy for mid-mobile)
//   CLS < 0.05 on component slug pages
//
// Tests navigate, idle until paint is stable, then read Web Vitals
// via the PerformanceObserver API injected into the page context.

import { test, expect } from "@playwright/test";

const LCP_BUDGET_MS = 2500;
const CLS_BUDGET = 0.05;

async function measureLCP(page: import("@playwright/test").Page): Promise<number> {
  return page.evaluate(() => {
    return new Promise<number>((resolve) => {
      let lcp = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
        lcp = last.startTime;
      });
      observer.observe({ type: "largest-contentful-paint", buffered: true });
      // Give the browser 5 s to paint before resolving.
      setTimeout(() => {
        observer.disconnect();
        resolve(lcp);
      }, 5_000);
    });
  });
}

async function measureCLS(page: import("@playwright/test").Page): Promise<number> {
  return page.evaluate(() => {
    return new Promise<number>((resolve) => {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const le = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
          if (!le.hadRecentInput) clsValue += le.value;
        }
      });
      observer.observe({ type: "layout-shift", buffered: true });
      setTimeout(() => {
        observer.disconnect();
        resolve(clsValue);
      }, 5_000);
    });
  });
}

test.describe("perf budgets", () => {
  test("/components LCP < 2.5s", async ({ page }) => {
    await page.goto("/components", { waitUntil: "networkidle" });
    const lcp = await measureLCP(page);
    expect(
      lcp,
      `/components LCP ${lcp.toFixed(0)}ms exceeds budget of ${LCP_BUDGET_MS}ms`,
    ).toBeLessThan(LCP_BUDGET_MS);
  });

  test("/components/moving-border CLS < 0.05", async ({ page }) => {
    await page.goto("/components/moving-border", { waitUntil: "networkidle" });
    const cls = await measureCLS(page);
    expect(
      cls,
      `/components/moving-border CLS ${cls.toFixed(4)} exceeds budget of ${CLS_BUDGET}`,
    ).toBeLessThan(CLS_BUDGET);
  });
});
