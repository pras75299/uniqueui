import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const REPO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const CLI_PACKAGE = path.join(REPO_ROOT, "packages/cli/package.json");
const VERSION_FILE = path.join(REPO_ROOT, "apps/www/config/version.ts");

// The header version badge must always equal the published CLI version so users
// can read the exact `npx uniqueui` version from the docs site. If this fails,
// run `pnpm build:registry` (or `node scripts/sync-version.mjs`) to regenerate.
describe("library version badge", () => {
  it("matches the published CLI version", () => {
    const cliVersion = JSON.parse(fs.readFileSync(CLI_PACKAGE, "utf8")).version as string;
    const generated = fs.readFileSync(VERSION_FILE, "utf8");
    expect(generated).toContain(`export const LIBRARY_VERSION = "${cliVersion}";`);
  });
});
