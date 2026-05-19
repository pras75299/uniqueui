import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";

describe("next.config security headers", () => {
  it("allows the inline scripts Next.js app router requires", async () => {
    const headers = await nextConfig.headers?.();
    const rootHeaders = headers?.find((entry) => entry.source === "/:path*")?.headers ?? [];
    const csp = rootHeaders.find((header) => header.key === "Content-Security-Policy")?.value;

    expect(csp).toContain("script-src 'self' 'unsafe-inline'");
  });
});

describe("next.config /docs redirect", () => {
  // The legacy redirect forwards /docs/<component-slug> to /components/<slug>.
  // First-class docs pages must be excluded — when the exclusion list missed
  // /docs/theming, the page 308'd to /components/theming and 404'd.
  it("does not capture first-class /docs/* pages in the legacy redirect", async () => {
    const redirects = await nextConfig.redirects?.();
    const legacy = redirects?.find((r) => r.destination === "/components/:slug");
    expect(legacy).toBeDefined();
    // The negative lookahead must list every reserved /docs/* route name.
    expect(legacy?.source).toContain("compatibility$");
    expect(legacy?.source).toContain("theming$");
  });

  it("does redirect /docs/<component-slug> to /components/<slug>", async () => {
    // Sanity: confirm the regex still matches arbitrary component slugs so
    // the legacy URL forwarding doesn't silently regress.
    const redirects = await nextConfig.redirects?.();
    const legacy = redirects?.find((r) => r.destination === "/components/:slug");
    const sourcePattern = legacy?.source ?? "";
    const innerPattern = sourcePattern.replace(/^\/docs\/:slug\((.+)\)$/, "$1");
    const re = new RegExp(`^${innerPattern}$`);
    expect(re.test("moving-border")).toBe(true);
    expect(re.test("typewriter-text")).toBe(true);
    expect(re.test("compatibility")).toBe(false);
    expect(re.test("theming")).toBe(false);
  });

  it("excludes only the exact reserved name, not prefixes", async () => {
    // Defensive: the `$` anchor in `(?!compatibility$|theming$)` is what makes
    // the exclusion exact. Without it, `compatibility-deprecated` would also
    // be excluded and 404. This guards against the anchor being dropped.
    const redirects = await nextConfig.redirects?.();
    const legacy = redirects?.find((r) => r.destination === "/components/:slug");
    const sourcePattern = legacy?.source ?? "";
    const innerPattern = sourcePattern.replace(/^\/docs\/:slug\((.+)\)$/, "$1");
    const re = new RegExp(`^${innerPattern}$`);
    expect(re.test("compatibility-deprecated")).toBe(true);
    expect(re.test("theming-tokens")).toBe(true);
  });
});
