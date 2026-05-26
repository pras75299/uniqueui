import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs-extra";
import path from "path";
import os from "os";
import { planRemove, remove } from "./remove";

let tmp: string;
let cwd: string;
let prevSkipRegistryWarn: string | undefined;
let logSpy: ReturnType<typeof vi.spyOn>;
let errSpy: ReturnType<typeof vi.spyOn>;

const ENTRY = {
    name: "moving-border",
    dependencies: ["motion", "clsx", "tailwind-merge"],
    files: [
        { path: "moving-border/component.tsx", type: "registry:ui", content: "export const A = () => null;\n" },
        { path: "utils/cn.ts", type: "registry:util", content: "export const cn = () => null;\n" },
    ],
};

beforeEach(async () => {
    cwd = process.cwd();
    prevSkipRegistryWarn = process.env.UNIQUEUI_SKIP_REGISTRY_WARN;
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), "uniqueui-remove-"));
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

describe("planRemove", () => {
    it("flags ui files for removal and skips shared utils", async () => {
        await fs.outputFile(path.join(tmp, "components/ui/moving-border.tsx"), ENTRY.files[0].content);
        await fs.outputFile(path.join(tmp, "utils/cn.ts"), ENTRY.files[1].content);

        const plan = await planRemove("moving-border", tmp);
        expect("error" in plan).toBe(false);
        if ("error" in plan) return;

        expect(plan.toRemove).toHaveLength(1);
        expect(plan.toRemove[0].targetPath.endsWith("components/ui/moving-border.tsx")).toBe(true);
        expect(plan.toRemove[0].exists).toBe(true);

        const sharedUtilSkipped = plan.skipped.find((s) => s.reason === "shared utility (kept)");
        expect(sharedUtilSkipped).toBeTruthy();
        expect(plan.npmDependencies).toEqual(["motion", "clsx", "tailwind-merge"]);
    });

    it("marks ui file as not-existing when component was never added", async () => {
        const plan = await planRemove("moving-border", tmp);
        if ("error" in plan) throw new Error("expected plan");
        expect(plan.toRemove[0].exists).toBe(false);
    });

    it("returns error when components.json is missing", async () => {
        await fs.remove(path.join(tmp, "components.json"));
        const plan = await planRemove("moving-border", tmp);
        expect("error" in plan && plan.error).toBe("no-config");
    });

    it("returns error when slug is not in the registry", async () => {
        const plan = await planRemove("nonexistent-slug", tmp);
        expect("error" in plan && plan.error).toBe("not-found");
    });
});

describe("remove command", () => {
    it("does not delete files in --dry-run mode", async () => {
        const target = path.join(tmp, "components/ui/moving-border.tsx");
        await fs.outputFile(target, ENTRY.files[0].content);

        await remove("moving-border", { url: tmp, dryRun: true, yes: true });

        expect(await fs.pathExists(target)).toBe(true);
        const allOutput = logSpy.mock.calls.flat().join(" ");
        expect(allOutput).toMatch(/Dry run/i);
    });

    it("deletes ui files when -y is passed", async () => {
        const target = path.join(tmp, "components/ui/moving-border.tsx");
        await fs.outputFile(target, ENTRY.files[0].content);

        await remove("moving-border", { url: tmp, yes: true });

        expect(await fs.pathExists(target)).toBe(false);
    });

    it("preserves shared util files even after removing the only consumer", async () => {
        const ui = path.join(tmp, "components/ui/moving-border.tsx");
        const util = path.join(tmp, "utils/cn.ts");
        await fs.outputFile(ui, ENTRY.files[0].content);
        await fs.outputFile(util, ENTRY.files[1].content);

        await remove("moving-border", { url: tmp, yes: true });

        expect(await fs.pathExists(ui)).toBe(false);
        expect(await fs.pathExists(util)).toBe(true);
    });

    it("prints an uninstall hint listing the component's npm dependencies", async () => {
        const target = path.join(tmp, "components/ui/moving-border.tsx");
        await fs.outputFile(target, ENTRY.files[0].content);

        await remove("moving-border", { url: tmp, yes: true });

        const allOutput = logSpy.mock.calls.flat().join("\n");
        expect(allOutput).toMatch(/npm uninstall motion clsx tailwind-merge/);
    });

    it("reports nothing-to-remove when no tracked files exist locally", async () => {
        await remove("moving-border", { url: tmp, yes: true });

        const allOutput = logSpy.mock.calls.flat().join(" ");
        expect(allOutput).toMatch(/nothing to remove/);
    });

    it("exits non-zero when components.json is missing", async () => {
        await fs.remove(path.join(tmp, "components.json"));
        await remove("moving-border", { url: tmp, yes: true });
        expect(process.exitCode).toBe(1);
    });

    it("exits non-zero when slug is not in the registry", async () => {
        await remove("nonexistent-slug", { url: tmp, yes: true });
        expect(process.exitCode).toBe(1);
    });
});
