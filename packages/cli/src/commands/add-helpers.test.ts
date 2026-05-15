import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs-extra";
import path from "path";
import os from "os";
import prompts from "prompts";
import {
    detectPackageManager,
    printUnifiedDiff,
    writeRegistryUiFile,
} from "./add";

let tmp: string;
let logs: string[] = [];

beforeEach(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), "uniqueui-add-"));
    logs = [];
    vi.spyOn(console, "log").mockImplementation((...args: unknown[]) => {
        logs.push(args.map(String).join(" "));
    });
    vi.spyOn(console, "warn").mockImplementation(() => {});
    process.env.NODE_ENV = "test";
});

afterEach(async () => {
    vi.restoreAllMocks();
    await fs.remove(tmp);
});

describe("detectPackageManager", () => {
    it("returns 'bun' when bun.lock exists", async () => {
        await fs.outputFile(path.join(tmp, "bun.lock"), "");
        expect(detectPackageManager(tmp)).toBe("bun");
    });

    it("returns 'bun' when bun.lockb exists", async () => {
        await fs.outputFile(path.join(tmp, "bun.lockb"), "");
        expect(detectPackageManager(tmp)).toBe("bun");
    });

    it("prefers bun over pnpm when both lockfiles exist", async () => {
        await fs.outputFile(path.join(tmp, "bun.lock"), "");
        await fs.outputFile(path.join(tmp, "pnpm-lock.yaml"), "");
        expect(detectPackageManager(tmp)).toBe("bun");
    });

    it("returns 'pnpm' for pnpm-lock.yaml", async () => {
        await fs.outputFile(path.join(tmp, "pnpm-lock.yaml"), "");
        expect(detectPackageManager(tmp)).toBe("pnpm");
    });

    it("returns 'yarn' for yarn.lock when no higher-priority lockfile is present", async () => {
        await fs.outputFile(path.join(tmp, "yarn.lock"), "");
        expect(detectPackageManager(tmp)).toBe("yarn");
    });

    it("defaults to 'npm' when no lockfile is found", async () => {
        expect(detectPackageManager(tmp)).toBe("npm");
    });
});

describe("printUnifiedDiff", () => {
    it("marks lines unique to one side with +/-", () => {
        printUnifiedDiff("a\nb\nc", "a\nB\nc", "x.tsx");
        const out = logs.join("\n");
        expect(out).toContain("- b");
        expect(out).toContain("+ B");
        expect(out).toContain("  a");
        expect(out).toContain("  c");
    });

    it("does not emit +/- markers when content is identical", () => {
        printUnifiedDiff("same", "same", "x.tsx");
        const body = logs
            .join("\n")
            .split("\n")
            .filter((l) => /^[+\-]\s/.test(l.replace(/\x1b\[[0-9;]*m/g, "")));
        expect(body).toEqual([]);
    });
});

describe("writeRegistryUiFile", () => {
    it("creates a new file when target does not exist", async () => {
        const target = path.join(tmp, "components/ui/foo.tsx");
        await fs.ensureDir(path.dirname(target));
        const outcome = await writeRegistryUiFile(target, "hello");
        expect(outcome).toBe("written");
        expect(await fs.readFile(target, "utf8")).toBe("hello");
    });

    it("does not write under --dry-run, even when file is new", async () => {
        const target = path.join(tmp, "components/ui/foo.tsx");
        await fs.ensureDir(path.dirname(target));
        const outcome = await writeRegistryUiFile(target, "hello", { dryRun: true });
        expect(outcome).toBe("dry-run");
        expect(await fs.pathExists(target)).toBe(false);
        expect(logs.join("\n")).toMatch(/\[dry-run\] Would create/);
    });

    it("reports overwrite intent under --dry-run when target exists", async () => {
        const target = path.join(tmp, "components/ui/foo.tsx");
        await fs.outputFile(target, "old");
        const outcome = await writeRegistryUiFile(target, "new", { dryRun: true });
        expect(outcome).toBe("dry-run");
        expect(await fs.readFile(target, "utf8")).toBe("old");
        expect(logs.join("\n")).toMatch(/\[dry-run\] Would overwrite/);
    });

    it("overwrites silently when --force is passed", async () => {
        const target = path.join(tmp, "components/ui/foo.tsx");
        await fs.outputFile(target, "old");
        const outcome = await writeRegistryUiFile(target, "new", { force: true });
        expect(outcome).toBe("overwritten");
        expect(await fs.readFile(target, "utf8")).toBe("new");
    });

    it("prompts on conflict and skips when user answers 'skip'", async () => {
        const target = path.join(tmp, "components/ui/foo.tsx");
        await fs.outputFile(target, "old");
        prompts.inject(["skip"]);
        const outcome = await writeRegistryUiFile(target, "new");
        expect(outcome).toBe("skipped");
        expect(await fs.readFile(target, "utf8")).toBe("old");
    });

    it("prompts on conflict and overwrites when user answers 'overwrite'", async () => {
        const target = path.join(tmp, "components/ui/foo.tsx");
        await fs.outputFile(target, "old");
        prompts.inject(["overwrite"]);
        const outcome = await writeRegistryUiFile(target, "new");
        expect(outcome).toBe("overwritten");
        expect(await fs.readFile(target, "utf8")).toBe("new");
    });

    it("prompts on conflict, shows diff on 'diff', then overwrites on follow-up", async () => {
        const target = path.join(tmp, "components/ui/foo.tsx");
        await fs.outputFile(target, "a\nb");
        prompts.inject(["diff", "overwrite"]);
        const outcome = await writeRegistryUiFile(target, "a\nB");
        expect(outcome).toBe("overwritten");
        expect(await fs.readFile(target, "utf8")).toBe("a\nB");
        const out = logs.join("\n");
        expect(out).toContain("- b");
        expect(out).toContain("+ B");
    });
});
