import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs-extra";
import path from "path";
import os from "os";
import { diff, computeDiff } from "./diff";

let tmp: string;
let cwd: string;
let prevSkipRegistryWarn: string | undefined;
let logSpy: ReturnType<typeof vi.spyOn>;
let errSpy: ReturnType<typeof vi.spyOn>;

const ENTRY = {
    name: "moving-border",
    dependencies: [],
    files: [
        { path: "moving-border/component.tsx", type: "registry:ui", content: "export const A = () => null;\n" },
    ],
};

beforeEach(async () => {
    cwd = process.cwd();
    prevSkipRegistryWarn = process.env.UNIQUEUI_SKIP_REGISTRY_WARN;
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), "uniqueui-diff-"));
    process.chdir(tmp);
    process.env.UNIQUEUI_SKIP_REGISTRY_WARN = "1";

    await fs.outputJson(path.join(tmp, "components.json"), {
        paths: { components: "components/ui", lib: "utils" },
        tailwind: { config: "tailwind.config.js" },
    });
    await fs.outputJson(path.join(tmp, "registry/index.json"), { components: ["moving-border"] });
    await fs.outputJson(path.join(tmp, "registry/moving-border.json"), ENTRY);

    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    process.exitCode = 0;
});

afterEach(async () => {
    process.chdir(cwd);
    await fs.remove(tmp);
    if (prevSkipRegistryWarn === undefined) delete process.env.UNIQUEUI_SKIP_REGISTRY_WARN;
    else process.env.UNIQUEUI_SKIP_REGISTRY_WARN = prevSkipRegistryWarn;
    logSpy.mockRestore();
    errSpy.mockRestore();
    process.exitCode = 0;
});

describe("computeDiff", () => {
    it("flags every file as missing when nothing has been added yet", async () => {
        const result = await computeDiff("moving-border", tmp);
        expect(result?.perFile).toHaveLength(1);
        expect(result?.perFile[0].status).toBe("missing");
    });

    it("returns same when on-disk file matches upstream byte-for-byte", async () => {
        await fs.outputFile(
            path.join(tmp, "components/ui/moving-border.tsx"),
            ENTRY.files[0].content,
        );
        const result = await computeDiff("moving-border", tmp);
        expect(result?.perFile[0].status).toBe("same");
    });

    it("returns changed when on-disk file diverges from upstream", async () => {
        await fs.outputFile(
            path.join(tmp, "components/ui/moving-border.tsx"),
            "export const A = () => 1;\n",
        );
        const result = await computeDiff("moving-border", tmp);
        expect(result?.perFile[0].status).toBe("changed");
    });
});

describe("diff command", () => {
    it("exits non-zero and prints diff when local diverges from upstream", async () => {
        await fs.outputFile(
            path.join(tmp, "components/ui/moving-border.tsx"),
            "export const A = () => 'local-edit';\n",
        );
        await diff("moving-border", { url: tmp });
        expect(process.exitCode).toBe(1);
        const out = logSpy.mock.calls.map((c: unknown[]) => String(c[0])).join("\n");
        expect(out).toContain("differ from upstream");
    });

    it("reports in-sync when no diff", async () => {
        await fs.outputFile(
            path.join(tmp, "components/ui/moving-border.tsx"),
            ENTRY.files[0].content,
        );
        await diff("moving-border", { url: tmp });
        expect(process.exitCode).not.toBe(1);
        const out = logSpy.mock.calls.map((c: unknown[]) => String(c[0])).join("\n");
        expect(out).toContain("in sync");
    });

    it("errors when the registry doesn't know the slug", async () => {
        await diff("nonexistent-slug", { url: tmp });
        expect(process.exitCode).toBe(1);
        expect(errSpy).toHaveBeenCalledWith(expect.stringContaining("not found in registry"));
    });
});
