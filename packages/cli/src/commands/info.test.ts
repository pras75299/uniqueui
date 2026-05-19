import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import path from "path";
import os from "os";
import { loadRegistryInfo, formatInfo } from "./info";

let tmp: string;

beforeEach(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), "uniqueui-info-"));
});

afterEach(async () => {
    await fs.remove(tmp);
});

const SAMPLE_ITEM = {
    name: "moving-border",
    dependencies: ["motion", "clsx"],
    files: [
        { path: "moving-border/component.tsx", type: "registry:ui", content: "// stub" },
        { path: "utils/cn.ts", type: "registry:util", content: "// stub" },
    ],
    tailwindConfig: {
        theme: {
            extend: {
                animation: { "border-spin": "border-spin 3s linear infinite" },
                keyframes: { "border-spin": { "100%": { transform: "rotate(-360deg)" } } },
            },
        },
    },
    tailwindCss: "@theme { --animate-border-spin: border-spin 3s linear infinite; }\n",
};

describe("loadRegistryInfo — local source", () => {
    it("loads split registry item and merges shadcn title/description", async () => {
        await fs.outputJson(path.join(tmp, "registry/index.json"), { components: ["moving-border"] });
        await fs.outputJson(path.join(tmp, "registry/moving-border.json"), SAMPLE_ITEM);
        await fs.outputJson(path.join(tmp, "r/registry.json"), {
            name: "uniqueui",
            items: [
                {
                    name: "moving-border",
                    type: "registry:ui",
                    title: "Moving Border",
                    description: "SVG-path-tracing animated border.",
                    files: [],
                },
            ],
        });

        const record = await loadRegistryInfo(tmp, "moving-border");
        expect(record).not.toBeNull();
        expect(record!.item.name).toBe("moving-border");
        expect(record!.title).toBe("Moving Border");
        expect(record!.description).toBe("SVG-path-tracing animated border.");
    });

    it("falls back to legacy monolithic registry.json when split is missing", async () => {
        await fs.outputJson(path.join(tmp, "registry.json"), [SAMPLE_ITEM]);
        const record = await loadRegistryInfo(tmp, "moving-border");
        expect(record).not.toBeNull();
        expect(record!.item.name).toBe("moving-border");
        // No shadcn metadata available — title/description should be undefined.
        expect(record!.title).toBeUndefined();
    });

    it("returns null for unknown slug", async () => {
        await fs.outputJson(path.join(tmp, "registry/index.json"), { components: [] });
        const record = await loadRegistryInfo(tmp, "missing");
        expect(record).toBeNull();
    });

    it("loads from a direct .json file path", async () => {
        const direct = path.join(tmp, "moving-border.json");
        await fs.outputJson(direct, SAMPLE_ITEM);
        const record = await loadRegistryInfo(direct, "moving-border");
        expect(record).not.toBeNull();
        expect(record!.item.dependencies).toEqual(["motion", "clsx"]);
    });

    it("resolves split index when source points directly at registry/index.json", async () => {
        await fs.outputJson(path.join(tmp, "registry/index.json"), { components: ["moving-border"] });
        await fs.outputJson(path.join(tmp, "registry/moving-border.json"), SAMPLE_ITEM);
        const record = await loadRegistryInfo(path.join(tmp, "registry/index.json"), "moving-border");
        expect(record).not.toBeNull();
        expect(record!.item.name).toBe("moving-border");
    });
});

describe("formatInfo", () => {
    it("renders dependencies, files, and tailwind summary", () => {
        const out = formatInfo({
            item: SAMPLE_ITEM,
            title: "Moving Border",
            description: "test desc",
            source: "stub",
        });
        expect(out).toContain("Moving Border");
        expect(out).toContain("test desc");
        expect(out).toContain("motion");
        expect(out).toContain("clsx");
        expect(out).toContain("registry:ui");
        expect(out).toContain("registry:util");
        expect(out).toContain("v3 JS config");
        expect(out).toContain("border-spin");
        expect(out).toContain("v4 CSS snippet");
        expect(out).toContain("npx uniqueui add moving-border");
    });

    it("handles items with no dependencies and no tailwind sections", () => {
        const out = formatInfo({
            item: { name: "bare", dependencies: [], files: [{ path: "a.tsx", type: "registry:ui", content: "" }] },
            source: "stub",
        });
        expect(out).toContain("(none)");
        expect(out).not.toContain("Tailwind\n");
    });
});
