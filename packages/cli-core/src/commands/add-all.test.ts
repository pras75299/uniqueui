import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { addAll } from "./add-all";
import fs from "fs-extra";
import path from "path";
import os from "os";

// Mock the `add` command so tests don't hit the network or filesystem writes.
vi.mock("./add", async (importOriginal) => {
    const original = await importOriginal<typeof import("./add")>();
    return {
        ...original,
        add: vi.fn(),
        warnIfUntrustedRegistry: vi.fn(),
    };
});

// Mock loadRegistryEntries so tests control which components are "in the registry".
vi.mock("./list", () => ({
    loadRegistryEntries: vi.fn(),
}));

import { add } from "./add";
import { loadRegistryEntries } from "./list";

const mockAdd = vi.mocked(add);
const mockLoadRegistryEntries = vi.mocked(loadRegistryEntries);

// --- helpers ---

function makeEntries(names: string[]) {
    return names.map((name) => ({ name }));
}

let tmp: string;

beforeEach(async () => {
    vi.clearAllMocks();
    process.env.UNIQUEUI_SKIP_REGISTRY_WARN = "1";
    process.exitCode = undefined;
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), "uniqueui-add-all-"));
});

afterEach(async () => {
    await fs.remove(tmp);
    process.exitCode = undefined;
});

// Silence console output during tests to keep output clean.
const consoleSpy = {
    log: vi.spyOn(console, "log").mockImplementation(() => {}),
    error: vi.spyOn(console, "error").mockImplementation(() => {}),
    warn: vi.spyOn(console, "warn").mockImplementation(() => {}),
};
// Also silence process.stdout.write (used for the progress line)
const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

describe("addAll", () => {
    describe("greenfield gate", () => {
        it("refuses when components/ui already has .tsx files (without --force)", async () => {
            // Set up a non-empty components/ui directory.
            const componentsDir = path.join(tmp, "components/ui");
            await fs.ensureDir(componentsDir);
            await fs.writeFile(path.join(componentsDir, "button.tsx"), "");

            await fs.writeJson(path.join(tmp, "components.json"), {
                paths: { components: "components/ui" },
            });

            mockLoadRegistryEntries.mockResolvedValue(makeEntries(["button", "modal"]));

            await addAll({ url: "http://example.com/registry", cwd: tmp });

            // Should error and set exitCode without installing anything.
            expect(process.exitCode).toBe(1);
            expect(mockAdd).not.toHaveBeenCalled();
        });

        it("refuses when components/ui has .ts files (without --force)", async () => {
            const componentsDir = path.join(tmp, "components/ui");
            await fs.ensureDir(componentsDir);
            await fs.writeFile(path.join(componentsDir, "utils.ts"), "");

            await fs.writeJson(path.join(tmp, "components.json"), {
                paths: { components: "components/ui" },
            });

            mockLoadRegistryEntries.mockResolvedValue(makeEntries(["card"]));

            await addAll({ url: "http://example.com/registry", cwd: tmp });

            expect(process.exitCode).toBe(1);
            expect(mockAdd).not.toHaveBeenCalled();
        });

        it("proceeds with --force even when components/ui is non-empty", async () => {
            const componentsDir = path.join(tmp, "components/ui");
            await fs.ensureDir(componentsDir);
            await fs.writeFile(path.join(componentsDir, "existing.tsx"), "");

            await fs.writeJson(path.join(tmp, "components.json"), {
                paths: { components: "components/ui" },
            });

            mockLoadRegistryEntries.mockResolvedValue(makeEntries(["card", "button"]));
            mockAdd.mockResolvedValue(undefined);

            await addAll({ url: "http://example.com/registry", cwd: tmp, force: true });

            // Should NOT set exitCode=1 and should install all components.
            expect(process.exitCode).not.toBe(1);
            expect(mockAdd).toHaveBeenCalledTimes(2);
        });

        it("proceeds with --dry-run even when components/ui is non-empty", async () => {
            const componentsDir = path.join(tmp, "components/ui");
            await fs.ensureDir(componentsDir);
            await fs.writeFile(path.join(componentsDir, "existing.tsx"), "");

            await fs.writeJson(path.join(tmp, "components.json"), {
                paths: { components: "components/ui" },
            });

            mockLoadRegistryEntries.mockResolvedValue(makeEntries(["card"]));
            mockAdd.mockResolvedValue(undefined);

            await addAll({ url: "http://example.com/registry", cwd: tmp, dryRun: true });

            expect(process.exitCode).not.toBe(1);
            expect(mockAdd).toHaveBeenCalledTimes(1);
        });

        it("proceeds when components/ui does not exist yet", async () => {
            await fs.writeJson(path.join(tmp, "components.json"), {
                paths: { components: "components/ui" },
            });
            // Do NOT create components/ui directory.

            mockLoadRegistryEntries.mockResolvedValue(makeEntries(["card"]));
            mockAdd.mockResolvedValue(undefined);

            await addAll({ url: "http://example.com/registry", cwd: tmp });

            expect(process.exitCode).not.toBe(1);
            expect(mockAdd).toHaveBeenCalledTimes(1);
        });

        it("proceeds when components.json does not exist", async () => {
            // No components.json → skip gate entirely.
            mockLoadRegistryEntries.mockResolvedValue(makeEntries(["card"]));
            mockAdd.mockResolvedValue(undefined);

            await addAll({ url: "http://example.com/registry", cwd: tmp });

            expect(process.exitCode).not.toBe(1);
            expect(mockAdd).toHaveBeenCalledTimes(1);
        });
    });

    describe("hero filter", () => {
        it("excludes components whose names start with 'hero-'", async () => {
            mockLoadRegistryEntries.mockResolvedValue(
                makeEntries(["button", "hero-landing", "card", "hero-cta"]),
            );
            mockAdd.mockResolvedValue(undefined);

            await addAll({ url: "http://example.com/registry", cwd: tmp });

            // Only non-hero components should be installed.
            expect(mockAdd).toHaveBeenCalledTimes(2);
            expect(mockAdd).toHaveBeenCalledWith("button", expect.anything());
            expect(mockAdd).toHaveBeenCalledWith("card", expect.anything());
            expect(mockAdd).not.toHaveBeenCalledWith("hero-landing", expect.anything());
            expect(mockAdd).not.toHaveBeenCalledWith("hero-cta", expect.anything());
        });

        it("passes the correct options to each inner add call", async () => {
            mockLoadRegistryEntries.mockResolvedValue(makeEntries(["button"]));
            mockAdd.mockResolvedValue(undefined);

            await addAll({
                url: "http://example.com/registry",
                cwd: tmp,
                yes: true,
                force: true,
                dryRun: true,
            });

            expect(mockAdd).toHaveBeenCalledWith("button", {
                url: "http://example.com/registry",
                yes: true,
                force: true,
                dryRun: true,
            });
        });
    });

    describe("progress counting", () => {
        it("counts successes and does not set exitCode on full success", async () => {
            mockLoadRegistryEntries.mockResolvedValue(makeEntries(["a", "b", "c"]));
            mockAdd.mockResolvedValue(undefined);

            await addAll({ url: "http://example.com/registry", cwd: tmp });

            expect(process.exitCode).not.toBe(1);
            expect(mockAdd).toHaveBeenCalledTimes(3);
        });

        it("sets exitCode=1 on partial failure and reports counts", async () => {
            mockLoadRegistryEntries.mockResolvedValue(makeEntries(["a", "b", "c"]));
            mockAdd
                .mockResolvedValueOnce(undefined) // a: success
                .mockRejectedValueOnce(new Error("network error")) // b: failure
                .mockResolvedValueOnce(undefined); // c: success

            await addAll({ url: "http://example.com/registry", cwd: tmp });

            expect(process.exitCode).toBe(1);
            // Verify the error summary was printed.
            expect(consoleSpy.error).toHaveBeenCalledWith(
                expect.stringContaining("1 failed"),
            );
            expect(consoleSpy.error).toHaveBeenCalledWith(
                expect.stringContaining("2 installed"),
            );
        });

        it("sets exitCode=1 and reports when all components fail", async () => {
            mockLoadRegistryEntries.mockResolvedValue(makeEntries(["a", "b"]));
            mockAdd.mockRejectedValue(new Error("always fails"));

            await addAll({ url: "http://example.com/registry", cwd: tmp });

            expect(process.exitCode).toBe(1);
        });

        it("catches process.exit(1) thrown by inner add and counts as failure", async () => {
            mockLoadRegistryEntries.mockResolvedValue(makeEntries(["good", "bad", "ugly"]));

            let callCount = 0;
            mockAdd.mockImplementation(() => {
                callCount++;
                if (callCount === 2) {
                    // Simulate inner add calling process.exit(1) — addAll intercepts this.
                    process.exit(1);
                }
                return Promise.resolve(undefined);
            });

            await addAll({ url: "http://example.com/registry", cwd: tmp });

            // 1 failure (bad), 2 successes (good, ugly).
            expect(process.exitCode).toBe(1);
            expect(consoleSpy.error).toHaveBeenCalledWith(
                expect.stringContaining("1 failed"),
            );
        });
    });

    describe("empty registry", () => {
        it("sets exitCode=1 when registry returns no components", async () => {
            mockLoadRegistryEntries.mockResolvedValue([]);

            await addAll({ url: "http://example.com/registry", cwd: tmp });

            expect(process.exitCode).toBe(1);
            expect(mockAdd).not.toHaveBeenCalled();
        });

        it("sets exitCode=1 when registry returns null", async () => {
            mockLoadRegistryEntries.mockResolvedValue(null);

            await addAll({ url: "http://example.com/registry", cwd: tmp });

            expect(process.exitCode).toBe(1);
            expect(mockAdd).not.toHaveBeenCalled();
        });
    });
});
