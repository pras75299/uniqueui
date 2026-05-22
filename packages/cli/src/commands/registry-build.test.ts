import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs-extra";
import path from "path";
import os from "os";
import { buildRegistry, registryBuild } from "./registry-build";

let tmp: string;
let cwd: string;
let logSpy: ReturnType<typeof vi.spyOn>;
let errSpy: ReturnType<typeof vi.spyOn>;

const ENTRY_A = {
    name: "alpha",
    dependencies: ["motion"],
    files: [{ path: "alpha/component.tsx", type: "registry:ui", content: "export const A = () => null;\n" }],
};

const ENTRY_B = {
    name: "beta",
    dependencies: [],
    files: [{ path: "beta/component.tsx", type: "registry:ui", content: "export const B = () => null;\n" }],
};

beforeEach(async () => {
    cwd = process.cwd();
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), "uniqueui-rb-"));
    process.chdir(tmp);
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

describe("buildRegistry", () => {
    it("derives slugs from filesystem when no index.json is present and writes all three artifacts", async () => {
        await fs.outputJson(path.join(tmp, "src/alpha.json"), ENTRY_A);
        await fs.outputJson(path.join(tmp, "src/beta.json"), ENTRY_B);

        const report = await buildRegistry({ src: "src", out: "out" });

        expect(report.entries).toHaveLength(2);
        expect(report.entries.map((e) => e.name).sort()).toEqual(["alpha", "beta"]);

        const index = await fs.readJson(path.join(tmp, "out/index.json"));
        expect(index.components.sort()).toEqual(["alpha", "beta"]);

        const alphaOut = await fs.readJson(path.join(tmp, "out/alpha.json"));
        expect(alphaOut.name).toBe("alpha");

        const mono = await fs.readJson(path.join(tmp, "out/registry.json"));
        expect(mono).toHaveLength(2);
        expect(mono.map((e: { name: string }) => e.name).sort()).toEqual(["alpha", "beta"]);
    });

    it("honors an explicit index.json for ordering and slug list", async () => {
        await fs.outputJson(path.join(tmp, "src/index.json"), { components: ["beta", "alpha"] });
        await fs.outputJson(path.join(tmp, "src/alpha.json"), ENTRY_A);
        await fs.outputJson(path.join(tmp, "src/beta.json"), ENTRY_B);

        const report = await buildRegistry({ src: "src", out: "out" });

        // The order from index.json should be preserved.
        expect(report.entries.map((e) => e.name)).toEqual(["beta", "alpha"]);

        const index = await fs.readJson(path.join(tmp, "out/index.json"));
        expect(index.components).toEqual(["beta", "alpha"]);
    });

    it("fails when a slug in index.json has no matching entry file", async () => {
        await fs.outputJson(path.join(tmp, "src/index.json"), { components: ["alpha", "ghost"] });
        await fs.outputJson(path.join(tmp, "src/alpha.json"), ENTRY_A);

        await expect(buildRegistry({ src: "src", out: "out" })).rejects.toThrow(/Missing entry file.*ghost\.json/);
    });

    it("fails when the entry's name field disagrees with its filename slug", async () => {
        await fs.outputJson(path.join(tmp, "src/alpha.json"), { ...ENTRY_A, name: "different" });

        await expect(buildRegistry({ src: "src", out: "out" })).rejects.toThrow(
            /alpha\.json: name field "different" does not match filename slug "alpha"/,
        );
    });

    it("fails on schema-invalid entries (e.g. invalid file type)", async () => {
        await fs.outputJson(path.join(tmp, "src/alpha.json"), {
            ...ENTRY_A,
            files: [{ ...ENTRY_A.files[0], type: "registry:not-a-thing" }],
        });

        await expect(buildRegistry({ src: "src", out: "out" })).rejects.toThrow(/alpha: schema validation failed/);
    });

    it("fails when source directory does not exist", async () => {
        await expect(buildRegistry({ src: "nope", out: "out" })).rejects.toThrow(/Source directory does not exist/);
    });

    it("fails when source directory exists but contains no entry files", async () => {
        await fs.ensureDir(path.join(tmp, "src"));
        await expect(buildRegistry({ src: "src", out: "out" })).rejects.toThrow(/No registry entries found/);
    });
});

describe("registryBuild command", () => {
    it("sets exitCode=1 on failure and prints the error message", async () => {
        // Source dir does not exist — should fail loudly without throwing past the command.
        await registryBuild({ src: "missing", out: "out" });

        expect(process.exitCode).toBe(1);
        const errs = errSpy.mock.calls.flat().join("\n");
        expect(errs).toMatch(/Build failed/);
    });

    it("succeeds with exitCode 0 on a valid registry", async () => {
        await fs.outputJson(path.join(tmp, "src/alpha.json"), ENTRY_A);

        await registryBuild({ src: "src", out: "out" });

        expect(process.exitCode).toBe(0);
        expect(await fs.pathExists(path.join(tmp, "out/index.json"))).toBe(true);
        expect(await fs.pathExists(path.join(tmp, "out/alpha.json"))).toBe(true);
        expect(await fs.pathExists(path.join(tmp, "out/registry.json"))).toBe(true);
    });
});
