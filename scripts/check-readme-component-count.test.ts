import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
    countRegistryManifests,
    parseReadmeComponentCount,
} from "./check-readme-component-count.mjs";

const REPO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

// Why these tests matter: the README count is the library's headline claim to
// every first-time visitor. A stale number (it sat at 30 while the registry
// shipped 68) undersells the project, so the parse + count must stay wired to
// the real files and the marker must be treated as required.

describe("parseReadmeComponentCount", () => {
    it("extracts the advertised count from the bold marker", () => {
        expect(parseReadmeComponentCount("- 🎨 **68 animated components** — wow")).toBe(68);
    });

    it("returns null when the marker is missing so drift is reported, not skipped", () => {
        expect(parseReadmeComponentCount("- 68 animated components")).toBeNull();
        expect(parseReadmeComponentCount("")).toBeNull();
    });
});

describe("repo state", () => {
    it("README advertises exactly the number of registry manifests", () => {
        const advertised = parseReadmeComponentCount(
            fs.readFileSync(path.join(REPO_ROOT, "README.md"), "utf8"),
        );
        const actual = countRegistryManifests(path.join(REPO_ROOT, "registry", "components"));
        expect(actual).toBeGreaterThan(0);
        expect(advertised).toBe(actual);
    });
});
