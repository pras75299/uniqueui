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
