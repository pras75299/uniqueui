import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs-extra";
import path from "path";
import os from "os";
import { validateRegistry } from "./registry";

let tmp: string;
let logSpy: ReturnType<typeof vi.spyOn>;
let errSpy: ReturnType<typeof vi.spyOn>;

const VALID_ENTRY = {
    name: "moving-border",
    dependencies: ["motion"],
    files: [{ path: "moving-border/component.tsx", type: "registry:ui", content: "// stub" }],
};

beforeEach(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), "uniqueui-validate-"));
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    process.exitCode = 0;
});

afterEach(async () => {
    await fs.remove(tmp);
    logSpy.mockRestore();
    errSpy.mockRestore();
    process.exitCode = 0;
});

describe("uniqueui registry validate (local)", () => {
    it("succeeds on a well-formed split registry", async () => {
        await fs.outputJson(path.join(tmp, "registry/index.json"), { components: ["moving-border"] });
        await fs.outputJson(path.join(tmp, "registry/moving-border.json"), VALID_ENTRY);

        await validateRegistry({ url: tmp });

        expect(process.exitCode).not.toBe(1);
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Registry OK"));
    });

    it("fails when an entry's name does not match the index slug", async () => {
        await fs.outputJson(path.join(tmp, "registry/index.json"), { components: ["moving-border"] });
        await fs.outputJson(path.join(tmp, "registry/moving-border.json"), { ...VALID_ENTRY, name: "wrong-name" });

        await validateRegistry({ url: tmp });

        expect(process.exitCode).toBe(1);
        expect(errSpy).toHaveBeenCalledWith(expect.stringContaining("does not match index slug"));
    });

    it("fails when a per-slug entry violates the schema", async () => {
        await fs.outputJson(path.join(tmp, "registry/index.json"), { components: ["moving-border"] });
        await fs.outputJson(path.join(tmp, "registry/moving-border.json"), {
            name: "moving-border",
            dependencies: ["motion"],
            files: [], // empty — schema requires min(1)
        });

        await validateRegistry({ url: tmp });

        expect(process.exitCode).toBe(1);
        expect(errSpy).toHaveBeenCalledWith(expect.stringContaining("Registry validation failed"));
    });

    it("fails when the split index is missing", async () => {
        await validateRegistry({ url: tmp });
        expect(process.exitCode).toBe(1);
    });

    it("cross-checks mono registry.json slug parity with split index", async () => {
        await fs.outputJson(path.join(tmp, "registry/index.json"), { components: ["moving-border"] });
        await fs.outputJson(path.join(tmp, "registry/moving-border.json"), VALID_ENTRY);
        await fs.outputJson(path.join(tmp, "registry.json"), [
            VALID_ENTRY,
            { ...VALID_ENTRY, name: "extra-component" },
        ]);

        await validateRegistry({ url: tmp });

        expect(process.exitCode).toBe(1);
        expect(errSpy).toHaveBeenCalledWith(expect.stringContaining("cross-check"));
    });

    it("accepts a source that already points at registry/index.json", async () => {
        await fs.outputJson(path.join(tmp, "registry/index.json"), { components: ["moving-border"] });
        await fs.outputJson(path.join(tmp, "registry/moving-border.json"), VALID_ENTRY);

        await validateRegistry({ url: path.join(tmp, "registry/index.json") });

        expect(process.exitCode).not.toBe(1);
    });

    it("validates a mono-only registry (no split index)", async () => {
        // Some third-party registries ship only registry.json. The CLI's `add`
        // command already supports this shape — `registry validate` must too.
        await fs.outputJson(path.join(tmp, "registry.json"), [VALID_ENTRY]);

        await validateRegistry({ url: tmp });

        expect(process.exitCode).not.toBe(1);
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Registry OK"));
    });

    it("normalises a trailing-slash source so the base doesn't carry stray /", async () => {
        await fs.outputJson(path.join(tmp, "registry/index.json"), { components: ["moving-border"] });
        await fs.outputJson(path.join(tmp, "registry/moving-border.json"), VALID_ENTRY);

        // Passing the directory with a trailing slash used to slice from the
        // raw URL and leak the slash into the derived base.
        await validateRegistry({ url: `${tmp}/` });

        expect(process.exitCode).not.toBe(1);
    });
});
