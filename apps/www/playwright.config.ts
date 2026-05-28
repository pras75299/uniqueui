import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3100;
const BASE_URL = `http://127.0.0.1:${PORT}`;

// Minimal smoke suite: prove that the four top-level routes still render
// after a production build (catches SSR/RSC regressions cheaply).
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  timeout: 30_000,
  expect: {
    timeout: 5_000,
    toHaveScreenshot: {
      // A few sub-pixel changes shouldn't fail us; fonts and AA jitter cheaply.
      maxDiffPixelRatio: 0.02,
      animations: "disabled",
    },
  },
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "smoke",
      testMatch: /smoke\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    // Visual regression runs only when explicitly opted into (via
    // `pnpm test:visual` / CI matrix entry) so missing baselines don't break
    // the default smoke job.
    {
      name: "visual",
      testMatch: /visual\.spec\.ts/,
      // Serialise screenshots — parallel workers can race on shared font
      // rendering / GPU layers and cause spurious sub-pixel diffs.
      workers: 1,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
        deviceScaleFactor: 1,
      },
    },
    // Accessibility audit — runs axe-core on 5 canonical pages.
    // Opt-in via `pnpm test:e2e:a11y` or the e2e-a11y CI job.
    {
      name: "a11y",
      testMatch: /a11y\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    // Performance budgets — LCP and CLS thresholds on key pages.
    // Opt-in via `pnpm test:e2e:perf` or the e2e-perf CI job.
    {
      name: "perf",
      testMatch: /perf\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `pnpm exec next start --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
