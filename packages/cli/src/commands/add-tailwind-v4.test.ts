import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs-extra";
import path from "path";
import os from "os";
import { appendTailwindCss, detectTailwindMajor, validateRegistryPayload } from "./add";

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

    // Edge-case coverage — these encode the priority order the function
    // documents (sibling-package > tailwindcss semver > CSS sniff > unknown)
    // so a future refactor can't quietly flip it.

    it("prefers @tailwindcss/postcss over a 3.x tailwindcss range — a mid-migration project should be treated as v4", async () => {
        await fs.writeJson(path.join(tmpDir, "package.json"), {
            dependencies: { tailwindcss: "^3.4.0" },
            devDependencies: { "@tailwindcss/postcss": "^4.0.0" },
        });
        expect(detectTailwindMajor(tmpDir)).toBe("v4");
    });

    it("treats a malformed package.json as 'unknown' — the JSON parse error must not crash the CLI", async () => {
        await fs.writeFile(path.join(tmpDir, "package.json"), "{ not valid json");
        expect(detectTailwindMajor(tmpDir)).toBe("unknown");
    });

    it("prefers the v4 CSS pattern when both @import and @tailwind directives are present", async () => {
        await fs.writeJson(path.join(tmpDir, "package.json"), {});
        const cssPath = path.join(tmpDir, "app", "globals.css");
        await fs.outputFile(cssPath, '@import "tailwindcss";\n@tailwind base;\n@tailwind utilities;\n');
        expect(detectTailwindMajor(tmpDir, "app/globals.css")).toBe("v4");
    });

    it("treats an empty CSS file as 'unknown' — nothing to sniff, do not guess", async () => {
        await fs.writeJson(path.join(tmpDir, "package.json"), {});
        const cssPath = path.join(tmpDir, "app", "globals.css");
        await fs.outputFile(cssPath, "   \n\t\n");
        expect(detectTailwindMajor(tmpDir, "app/globals.css")).toBe("unknown");
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

    it("is idempotent — re-running with the same slug leaves exactly one balanced marker block whose contents match the snippet", async () => {
        await fs.writeFile(cssPath, '@import "tailwindcss";\n');
        await appendTailwindCss(cssPath, SNIPPET, "x-comp");
        const outcome = await appendTailwindCss(cssPath, SNIPPET, "x-comp");
        expect(outcome).toBe("already-present");
        const content = await fs.readFile(cssPath, "utf8");
        // Start/end counts must agree — a mismatch would silently corrupt the
        // user's CSS over many runs.
        const startCount = (content.match(/uniqueui:start x-comp/g) || []).length;
        const endCount = (content.match(/uniqueui:end x-comp/g) || []).length;
        expect(startCount).toBe(1);
        expect(endCount).toBe(1);
        // The body inside the markers must equal the source snippet.
        const inner = content.match(/\/\* uniqueui:start x-comp \*\/\n([\s\S]*?)\/\* uniqueui:end x-comp \*\//);
        expect(inner).toBeTruthy();
        expect(inner![1].trim()).toBe(SNIPPET.trim());
    });

    it("replaces an existing block when called with force — picks up registry-side snippet updates", async () => {
        await fs.writeFile(cssPath, '@import "tailwindcss";\n');
        await appendTailwindCss(cssPath, SNIPPET, "x-comp");
        const updated = `@theme {\n  --animate-x: x 2s ease-in-out infinite;\n}\n`;
        const outcome = await appendTailwindCss(cssPath, updated, "x-comp", { force: true });
        expect(outcome).toBe("replaced");
        const content = await fs.readFile(cssPath, "utf8");
        // Only one marker pair, and the body must reflect the new snippet.
        expect((content.match(/uniqueui:start x-comp/g) || []).length).toBe(1);
        expect((content.match(/uniqueui:end x-comp/g) || []).length).toBe(1);
        expect(content).toContain("x 2s ease-in-out infinite");
        expect(content).not.toContain("x 1s linear infinite");
    });

    it("returns 'skipped' and does not write when force replace finds a start marker without a matching end marker", async () => {
        // Simulates a partially hand-edited file — the helper must refuse to guess.
        const corrupt = '@import "tailwindcss";\n/* uniqueui:start x-comp */\nlooks-truncated\n';
        await fs.writeFile(cssPath, corrupt);
        const outcome = await appendTailwindCss(cssPath, SNIPPET, "x-comp", { force: true });
        expect(outcome).toBe("skipped");
        const after = await fs.readFile(cssPath, "utf8");
        expect(after).toBe(corrupt);
    });

    it("force dryRun previews the replacement without writing", async () => {
        await fs.writeFile(cssPath, '@import "tailwindcss";\n');
        await appendTailwindCss(cssPath, SNIPPET, "x-comp");
        const before = await fs.readFile(cssPath, "utf8");
        const updated = `@theme {\n  --animate-x: x 2s ease infinite;\n}\n`;
        const outcome = await appendTailwindCss(cssPath, updated, "x-comp", { force: true, dryRun: true });
        expect(outcome).toBe("dry-run");
        const after = await fs.readFile(cssPath, "utf8");
        expect(after).toBe(before);
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

describe("validateRegistryPayload — tailwindCss size cap", () => {
    // The 16 KB cap is the security boundary — a hostile registry could
    // otherwise inflate globals.css indefinitely. Test the boundary in both
    // directions so a future refactor can't silently relax (or tighten) it
    // without us noticing.

    const baseEntry = {
        name: "x",
        dependencies: [],
        files: [
            {
                path: "x/component.tsx",
                content: "export {}",
                type: "registry:ui",
            },
        ],
    };

    it("accepts tailwindCss up to 16384 bytes", () => {
        const justUnder = "a".repeat(16_384);
        const result = validateRegistryPayload([{ ...baseEntry, tailwindCss: justUnder }]);
        expect(result).not.toBeNull();
        expect(result![0].tailwindCss).toHaveLength(16_384);
    });

    it("rejects tailwindCss larger than 16384 bytes — the registry could otherwise grow user CSS unbounded", () => {
        const over = "a".repeat(16_385);
        expect(validateRegistryPayload([{ ...baseEntry, tailwindCss: over }])).toBeNull();
    });

    it("rejects an empty tailwindCss string — an empty snippet is always a registry bug, not a no-op", () => {
        expect(validateRegistryPayload([{ ...baseEntry, tailwindCss: "" }])).toBeNull();
    });
});
