import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import path from "path";
import os from "os";
import { cachePath, writeCachedItem, readCachedItem, resolveOnDiskFileName, CACHE_DIR } from "./cache";

let tmp: string;

beforeEach(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), "uniqueui-cache-"));
});

afterEach(async () => {
    await fs.remove(tmp);
});

describe("cachePath", () => {
    it("places entries under .uniqueui/cache/<slug>.json relative to cwd", () => {
        const p = cachePath("moving-border", tmp);
        expect(p).toBe(path.join(tmp, CACHE_DIR, "moving-border.json"));
    });

    it("rejects unsafe slugs to keep the cache inside its directory", () => {
        expect(() => cachePath("../escape", tmp)).toThrow(/unsafe slug/i);
        expect(() => cachePath("/abs", tmp)).toThrow(/unsafe slug/i);
        expect(() => cachePath("UPPER", tmp)).toThrow(/unsafe slug/i);
    });
});

describe("writeCachedItem / readCachedItem round-trip", () => {
    it("persists the registry item along with fetchedAt and sourceUrl", async () => {
        await writeCachedItem(
            "moving-border",
            {
                name: "moving-border",
                dependencies: ["motion"],
                files: [{ path: "moving-border/component.tsx", type: "registry:ui", content: "// stub" }],
            },
            "https://example.com",
            tmp,
        );

        const back = await readCachedItem("moving-border", tmp);
        expect(back?.name).toBe("moving-border");
        expect(back?.dependencies).toEqual(["motion"]);
        expect(back?.sourceUrl).toBe("https://example.com");
        expect(typeof back?.fetchedAt).toBe("string");
    });

    it("returns null when the cache file is missing", async () => {
        const back = await readCachedItem("ghost", tmp);
        expect(back).toBeNull();
    });
});

describe("resolveOnDiskFileName", () => {
    it("renames component.tsx to <slug>.tsx", () => {
        expect(resolveOnDiskFileName("moving-border", "moving-border/component.tsx")).toBe(
            "moving-border.tsx",
        );
    });

    it("keeps non-component file names as-is", () => {
        expect(resolveOnDiskFileName("moving-border", "utils/cn.ts")).toBe("cn.ts");
    });
});
