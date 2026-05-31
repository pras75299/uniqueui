import { describe, expect, it } from "vitest";

import {
    buildManifest,
    initialChangelog,
    parseArgs,
    resolveComponentPaths,
    titleFromSlug,
} from "./scaffold-component.mjs";

describe("parseArgs", () => {
    it("parses slug and default tags", () => {
        expect(parseArgs(["my-widget"])).toEqual({
            slug: "my-widget",
            hero: false,
            tags: ["ui"],
        });
    });

    it("parses hero flag and custom tags", () => {
        expect(parseArgs(["hero-wave", "--hero", "--tags", "hero,scroll"])).toEqual({
            slug: "hero-wave",
            hero: true,
            tags: ["hero", "scroll"],
        });
    });

    it("rejects invalid slugs", () => {
        expect(() => parseArgs(["Bad_Slug"])).toThrow(/Invalid slug/);
    });
});

describe("resolveComponentPaths", () => {
    it("uses flat layout for standard components", () => {
        expect(resolveComponentPaths("spotlight-card", false)).toEqual({
            registryFilePath: "spotlight-card/component.tsx",
            sourceDir: expect.stringContaining("registry/spotlight-card"),
        });
    });

    it("uses blocks/hero layout for hero blocks", () => {
        expect(resolveComponentPaths("hero-terminal", true)).toEqual({
            registryFilePath: "blocks/hero/terminal/component.tsx",
            sourceDir: expect.stringContaining("registry/blocks/hero/terminal"),
        });
    });
});

describe("buildManifest", () => {
    it("includes ADR 0003 metadata defaults", () => {
        const manifest = buildManifest({
            slug: "demo-card",
            hero: false,
            tags: ["card"],
            registryFilePath: "demo-card/component.tsx",
        });
        expect(manifest.tags).toEqual(["card"]);
        expect(manifest.accessibility).toEqual({ status: "unaudited" });
        expect(manifest.compatibility.react).toBe("18+");
        expect(manifest.peerDependencies).toContain("react");
    });

    it("includes a newest-first changelog stub on the manifest", () => {
        const manifest = buildManifest({
            slug: "demo-card",
            hero: false,
            tags: ["card"],
            registryFilePath: "demo-card/component.tsx",
        });
        expect(manifest.changelog).toEqual(initialChangelog("demo-card"));
        expect(manifest.changelog[0].version).toBe("1.0.0");
        expect(manifest.changelog[0].changes).toEqual(["Initial release."]);
    });
});

describe("titleFromSlug", () => {
    it("title-cases kebab slugs", () => {
        expect(titleFromSlug("hero-terminal")).toBe("Hero Terminal");
    });
});
