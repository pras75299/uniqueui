import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs-extra";
import path from "path";
import os from "os";
import { appendTailwindCss, detectTailwindMajor } from "./add";

// Covers the Tailwind v4 dual-artifact path:
//  - detection from package.json (preferred signal) and globals.css (fallback)
//  - CSS append helper: idempotent, marker-block wrapped, dry-run safe

describe("detectTailwindMajor", () => {
    let tmpDir: string;

    beforeEach(async () => {
        tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "uniqueui-tw-detect-"));
    });

    afterEach(async () => {
        await fs.remove(tmpDir);
    });

    it("returns 'v4' when @tailwindcss/postcss is in devDependencies — the canonical v4 signal", async () => {
        await fs.writeJson(path.join(tmpDir, "package.json"), {
            devDependencies: { "@tailwindcss/postcss": "^4.0.0" },
        });
        expect(detectTailwindMajor(tmpDir)).toBe("v4");
    });

    it("returns 'v4' when tailwindcss is pinned to a 4.x range", async () => {
        await fs.writeJson(path.join(tmpDir, "package.json"), {
            dependencies: { tailwindcss: "^4.1.0" },
        });
        expect(detectTailwindMajor(tmpDir)).toBe("v4");
    });

    it("returns 'v3' when tailwindcss is pinned to a 3.x range — must not trigger v4 CSS append", async () => {
        await fs.writeJson(path.join(tmpDir, "package.json"), {
            devDependencies: { tailwindcss: "^3.4.0" },
        });
        expect(detectTailwindMajor(tmpDir)).toBe("v3");
    });

    it("falls back to CSS sniff (@import 'tailwindcss') when package.json is silent", async () => {
        await fs.writeJson(path.join(tmpDir, "package.json"), {});
        const cssPath = path.join(tmpDir, "app", "globals.css");
        await fs.outputFile(cssPath, '@import "tailwindcss";\n');
        expect(detectTailwindMajor(tmpDir, "app/globals.css")).toBe("v4");
    });

    it("falls back to CSS sniff (@tailwind base) for v3 when package.json is silent", async () => {
        await fs.writeJson(path.join(tmpDir, "package.json"), {});
        const cssPath = path.join(tmpDir, "app", "globals.css");
        await fs.outputFile(cssPath, "@tailwind base;\n@tailwind utilities;\n");
        expect(detectTailwindMajor(tmpDir, "app/globals.css")).toBe("v3");
    });

    it("returns 'unknown' when neither package.json nor globals.css give a signal — caller uses the safe v3 default", async () => {
        await fs.writeJson(path.join(tmpDir, "package.json"), {});
        expect(detectTailwindMajor(tmpDir, "missing.css")).toBe("unknown");
    });
});

describe("appendTailwindCss", () => {
    let tmpDir: string;
    let cssPath: string;
    let logSpy: ReturnType<typeof vi.spyOn>;
    let warnSpy: ReturnType<typeof vi.spyOn>;

    const SNIPPET = `@theme {\n  --animate-x: x 1s linear infinite;\n}\n`;

    beforeEach(async () => {
        tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "uniqueui-tw-append-"));
        cssPath = path.join(tmpDir, "globals.css");
        logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
        warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    });

    afterEach(async () => {
        await fs.remove(tmpDir);
        logSpy.mockRestore();
        warnSpy.mockRestore();
    });

    it("returns 'missing-file' and warns when the CSS path does not exist — the user must wire tailwind.css", async () => {
        const outcome = await appendTailwindCss(cssPath, SNIPPET, "x-comp");
        expect(outcome).toBe("missing-file");
        expect(warnSpy).toHaveBeenCalled();
    });

    it("appends a slug-marker block on first run", async () => {
        await fs.writeFile(cssPath, '@import "tailwindcss";\n');
        const outcome = await appendTailwindCss(cssPath, SNIPPET, "x-comp");
        expect(outcome).toBe("appended");
        const content = await fs.readFile(cssPath, "utf8");
        expect(content).toContain("/* uniqueui:start x-comp */");
        expect(content).toContain("/* uniqueui:end x-comp */");
        expect(content).toContain("--animate-x: x 1s linear infinite");
    });

    it("is idempotent — re-running with the same slug does not duplicate the block", async () => {
        await fs.writeFile(cssPath, '@import "tailwindcss";\n');
        await appendTailwindCss(cssPath, SNIPPET, "x-comp");
        const outcome = await appendTailwindCss(cssPath, SNIPPET, "x-comp");
        expect(outcome).toBe("already-present");
        const content = await fs.readFile(cssPath, "utf8");
        const startCount = (content.match(/uniqueui:start x-comp/g) || []).length;
        expect(startCount).toBe(1);
    });

    it("does not write under dryRun — the file stays untouched", async () => {
        await fs.writeFile(cssPath, '@import "tailwindcss";\n');
        const before = await fs.readFile(cssPath, "utf8");
        const outcome = await appendTailwindCss(cssPath, SNIPPET, "x-comp", { dryRun: true });
        expect(outcome).toBe("dry-run");
        const after = await fs.readFile(cssPath, "utf8");
        expect(after).toBe(before);
    });

    it("appends multiple distinct slugs side-by-side without colliding", async () => {
        await fs.writeFile(cssPath, '@import "tailwindcss";\n');
        await appendTailwindCss(cssPath, SNIPPET, "first");
        await appendTailwindCss(cssPath, "@theme { --animate-y: y 2s linear infinite; }\n", "second");
        const content = await fs.readFile(cssPath, "utf8");
        expect(content).toContain("/* uniqueui:start first */");
        expect(content).toContain("/* uniqueui:start second */");
        expect(content).toContain("--animate-x:");
        expect(content).toContain("--animate-y:");
    });
});
