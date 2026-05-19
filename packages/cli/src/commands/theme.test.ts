import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs-extra";
import path from "path";
import os from "os";
import { theme, aggregateV3, formatV3Preset, formatV4Snippet } from "./theme";

let tmp: string;
let cwd: string;
let logSpy: ReturnType<typeof vi.spyOn>;
let errSpy: ReturnType<typeof vi.spyOn>;

const ENTRY_V3 = {
    name: "moving-border",
    dependencies: [],
    files: [{ path: "moving-border/component.tsx", type: "registry:ui", content: "// stub" }],
    tailwindConfig: {
        theme: {
            extend: {
                animation: { "border-spin": "border-spin 3s linear infinite" },
                keyframes: { "border-spin": { "100%": { transform: "rotate(-360deg)" } } },
            },
        },
    },
    tailwindCss: "@theme { --animate-border-spin: border-spin 3s linear infinite; }",
};

const ENTRY_V3_B = {
    name: "shimmer-button",
    dependencies: [],
    files: [{ path: "shimmer-button/component.tsx", type: "registry:ui", content: "// stub" }],
    tailwindConfig: {
        theme: {
            extend: {
                animation: { shimmer: "shimmer 2s linear infinite" },
                keyframes: { shimmer: { "0%": { backgroundPosition: "0 0" } } },
            },
        },
    },
};

beforeEach(async () => {
    cwd = process.cwd();
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), "uniqueui-theme-"));
    process.chdir(tmp);
    process.env.UNIQUEUI_SKIP_REGISTRY_WARN = "1";

    await fs.outputJson(path.join(tmp, "registry/index.json"), {
        components: ["moving-border", "shimmer-button"],
    });
    await fs.outputJson(path.join(tmp, "registry/moving-border.json"), ENTRY_V3);
    await fs.outputJson(path.join(tmp, "registry/shimmer-button.json"), ENTRY_V3_B);

    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    process.exitCode = 0;
});

afterEach(async () => {
    process.chdir(cwd);
    await fs.remove(tmp);
    logSpy.mockRestore();
    errSpy.mockRestore();
    process.exitCode = 0;
});

describe("aggregateV3", () => {
    it("merges animations and keyframes across components without duplicating keys", () => {
        const items = [
            { name: "a", tailwindConfig: ENTRY_V3.tailwindConfig },
            { name: "b", tailwindConfig: ENTRY_V3_B.tailwindConfig },
            // Duplicate key from "a" — should keep first wins.
            { name: "c", tailwindConfig: { theme: { extend: { animation: { "border-spin": "different" } } } } },
        ];
        const { animation, keyframes } = aggregateV3(items);
        expect(Object.keys(animation).sort()).toEqual(["border-spin", "shimmer"]);
        expect(animation["border-spin"]).toBe("border-spin 3s linear infinite");
        expect(Object.keys(keyframes).sort()).toEqual(["border-spin", "shimmer"]);
    });
});

describe("formatters", () => {
    it("formatV3Preset emits a runnable module.exports config", () => {
        const out = formatV3Preset([{ name: "a", tailwindConfig: ENTRY_V3.tailwindConfig }]);
        expect(out).toContain("module.exports");
        expect(out).toContain("animation");
        expect(out).toContain("border-spin");
    });

    it("formatV4Snippet wraps each component in idempotent markers", () => {
        const out = formatV4Snippet([
            { name: "moving-border", tailwindCss: "@theme { --x: 1; }" },
            { name: "shimmer-button" }, // no tailwindCss — should be skipped
        ]);
        expect(out).toContain("/* uniqueui:start moving-border */");
        expect(out).toContain("/* uniqueui:end moving-border */");
        expect(out).not.toContain("shimmer-button");
    });
});

describe("theme command (local registry)", () => {
    it("emits a v3 preset by default for components with tailwindConfig", async () => {
        await theme({ url: tmp, format: "v3" });
        const out = logSpy.mock.calls.map((c: unknown[]) => String(c[0])).join("\n");
        expect(out).toContain("module.exports");
        expect(out).toContain("border-spin");
        expect(out).toContain("shimmer");
    });

    it("emits a v4 @theme snippet on --format v4", async () => {
        await theme({ url: tmp, format: "v4" });
        const out = logSpy.mock.calls.map((c: unknown[]) => String(c[0])).join("\n");
        expect(out).toContain("/* uniqueui:start moving-border */");
        expect(out).toContain("--animate-border-spin");
    });

    it("scopes to a single component with --component", async () => {
        await theme({ url: tmp, format: "v3", component: "moving-border" });
        const out = logSpy.mock.calls.map((c: unknown[]) => String(c[0])).join("\n");
        expect(out).toContain("border-spin");
        expect(out).not.toContain("shimmer");
    });

    it("writes to --out when provided", async () => {
        const outPath = path.join(tmp, "out/theme.css");
        await theme({ url: tmp, format: "v4", out: outPath });
        expect(await fs.pathExists(outPath)).toBe(true);
        const written = await fs.readFile(outPath, "utf8");
        expect(written).toContain("/* uniqueui:start moving-border */");
    });

    it("exits non-zero when no components are found", async () => {
        const empty = await fs.mkdtemp(path.join(os.tmpdir(), "uniqueui-theme-empty-"));
        await theme({ url: empty, format: "v3" });
        expect(process.exitCode).toBe(1);
        await fs.remove(empty);
    });

    it("warns and exits non-zero when --format v4 is requested but no component has tailwindCss", async () => {
        const dir = await fs.mkdtemp(path.join(os.tmpdir(), "uniqueui-theme-v3only-"));
        const noCss = { ...ENTRY_V3_B }; // ENTRY_V3_B has tailwindConfig but no tailwindCss
        await fs.outputJson(path.join(dir, "registry/index.json"), { components: ["shimmer-button"] });
        await fs.outputJson(path.join(dir, "registry/shimmer-button.json"), noCss);

        await theme({ url: dir, format: "v4" });

        expect(process.exitCode).toBe(1);
        expect(errSpy).toHaveBeenCalledWith(expect.stringContaining("v4 tailwindCss snippet"));
        await fs.remove(dir);
    });
});
