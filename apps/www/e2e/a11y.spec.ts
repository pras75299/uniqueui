// Accessibility audit: run axe-core on 5 canonical pages and assert zero violations.
// Critical/serious violations are hard failures; moderate/minor are surfaced as
// warnings so the suite stays green while known low-severity issues are tracked.

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PAGES = [
  { route: "/", label: "home" },
  { route: "/components", label: "components index" },
  { route: "/components/moving-border", label: "component slug" },
  { route: "/blocks", label: "blocks" },
  { route: "/docs/theming", label: "docs/theming" },
];

test.describe("axe a11y", () => {
  // Ensure prefers-reduced-motion:reduce so motion/react transitions are instant
  // (opacity:0 initial → opacity:1 animate completes in one frame). Without this,
  // axe can sample cards/thumbnails mid-animation and report false contrast failures
  // because the composited colour of semi-transparent text appears too dark.
  test.use({ reducedMotion: "reduce" });

  for (const { route, label } of PAGES) {
    test(`${label} (${route}) has no critical/serious axe violations`, async ({ page }) => {
      await page.goto(route);
      // Wait for main content to be visible before scanning.
      await page.waitForSelector("main", { timeout: 10_000 }).catch(() => {
        // some pages may not have a <main> — that's fine, axe still scans.
      });
      // Give motion one extra tick to apply instant-mode transitions before axe scans.
      await page.waitForTimeout(300);

      const results = await new AxeBuilder({ page })
        // Exclude known third-party iframes and Next.js dev overlays.
        .exclude("#__next-build-watcher")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "best-practice"])
        .analyze();

      const critical = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious",
      );

      if (results.violations.length > 0) {
        const summary = results.violations
          .map((v) => `[${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} node(s))`)
          .join("\n  ");
        console.warn(`  axe violations on ${route}:\n  ${summary}`);
      }

      expect(
        critical,
        `Critical/serious a11y violations on ${route}:\n` +
          critical
            .map((v) => `  [${v.impact}] ${v.id}: ${v.description}\n    nodes: ${v.nodes.map((n) => n.html).join(", ")}`)
            .join("\n"),
      ).toHaveLength(0);
    });
  }
});
