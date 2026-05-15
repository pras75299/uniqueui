import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import path from "path";
import os from "os";
import { loadRegistryEntries } from "./list";

let tmp: string;

beforeEach(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), "uniqueui-list-"));
});

afterEach(async () => {
    await fs.remove(tmp);
});

describe("loadRegistryEntries — local source", () => {
    it("loads shadcn /r/registry.json with title + description", async () => {
        await fs.outputJson(path.join(tmp, "r/registry.json"), {
            $schema: "https://ui.shadcn.com/schema/registry.json",
            name: "uniqueui",
            items: [
                {
                    name: "moving-border",
                    type: "registry:ui",
                    title: "Moving Border",
                    description: "SVG-path-tracing animated border.",
                    dependencies: ["motion"],
                    files: [],
                },
                {
                    name: "aurora-background",
                    type: "registry:ui",
                    title: "Aurora Background",
                    description: "Conic gradient backdrop.",
                    dependencies: [],
                    files: [],
                },
            ],
        });

        const entries = await loadRegistryEntries(tmp);
        expect(entries).toEqual([
            {
                name: "moving-border",
                title: "Moving Border",
                description: "SVG-path-tracing animated border.",
            },
            {
                name: "aurora-background",
                title: "Aurora Background",
                description: "Conic gradient backdrop.",
            },
        ]);
    });

    it("falls back to split /registry/index.json when shadcn missing", async () => {
        await fs.outputJson(path.join(tmp, "registry/index.json"), {
            components: ["moving-border", "aurora-background"],
        });

        const entries = await loadRegistryEntries(tmp);
        expect(entries).toEqual([{ name: "moving-border" }, { name: "aurora-background" }]);
    });

    it("falls back to legacy /registry.json when nothing else", async () => {
        await fs.outputJson(path.join(tmp, "registry.json"), [
            { name: "moving-border", dependencies: [], files: [] },
        ]);

        const entries = await loadRegistryEntries(tmp);
        expect(entries).toEqual([{ name: "moving-border" }]);
    });

    it("prefers shadcn over split when both exist", async () => {
        await fs.outputJson(path.join(tmp, "r/registry.json"), {
            name: "uniqueui",
            items: [
                {
                    name: "moving-border",
                    type: "registry:ui",
                    description: "rich",
                    dependencies: [],
                    files: [],
                },
            ],
        });
        await fs.outputJson(path.join(tmp, "registry/index.json"), {
            components: ["moving-border", "extra-from-split"],
        });

        const entries = await loadRegistryEntries(tmp);
        expect(entries).toEqual([{ name: "moving-border", description: "rich" }]);
    });

    it("returns null when no registry files are present", async () => {
        const entries = await loadRegistryEntries(tmp);
        expect(entries).toBeNull();
    });

    it("rejects malformed shadcn JSON and falls through to split", async () => {
        // Missing required 'items' array
        await fs.outputJson(path.join(tmp, "r/registry.json"), { name: "x" });
        await fs.outputJson(path.join(tmp, "registry/index.json"), {
            components: ["only-in-split"],
        });

        const entries = await loadRegistryEntries(tmp);
        expect(entries).toEqual([{ name: "only-in-split" }]);
    });
});
