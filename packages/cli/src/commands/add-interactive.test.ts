import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs-extra";
import path from "path";
import os from "os";
import prompts from "prompts";
import { add } from "./add";

let tmp: string;
let cwd: string;
let logSpy: ReturnType<typeof vi.spyOn>;
let errSpy: ReturnType<typeof vi.spyOn>;
let exitSpy: ReturnType<typeof vi.spyOn>;
let originalTTYIn: boolean | undefined;
let originalTTYOut: boolean | undefined;

const ENTRY = {
    name: "moving-border",
    dependencies: [],
    files: [{ path: "moving-border/component.tsx", type: "registry:ui", content: "// stub" }],
};

beforeEach(async () => {
    cwd = process.cwd();
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), "uniqueui-add-int-"));
    process.chdir(tmp);

    // Minimal components.json so `add` doesn't bail before the picker logic.
    await fs.outputJson(path.join(tmp, "components.json"), {
        paths: { components: "components/ui", lib: "utils" },
        tailwind: { config: "tailwind.config.js" },
    });

    // Local registry with one component.
    await fs.outputJson(path.join(tmp, "registry/index.json"), { components: ["moving-border"] });
    await fs.outputJson(path.join(tmp, "registry/moving-border.json"), ENTRY);

    process.env.UNIQUEUI_SKIP_REGISTRY_WARN = "1";
    process.env.NODE_ENV = "test";

    originalTTYIn = process.stdin.isTTY;
    originalTTYOut = process.stdout.isTTY;

    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {
        throw new Error("__exit__");
    }) as never);
});

afterEach(async () => {
    process.chdir(cwd);
    await fs.remove(tmp);
    (process.stdin as { isTTY?: boolean }).isTTY = originalTTYIn;
    (process.stdout as { isTTY?: boolean }).isTTY = originalTTYOut;
    logSpy.mockRestore();
    errSpy.mockRestore();
    exitSpy.mockRestore();
});

describe("add --interactive", () => {
    it("errors with a clear message when no slug + no TTY", async () => {
        (process.stdin as { isTTY?: boolean }).isTTY = false;
        (process.stdout as { isTTY?: boolean }).isTTY = false;

        await expect(add(undefined, { url: tmp, interactive: true })).rejects.toThrow(
            "__exit__",
        );
        expect(errSpy).toHaveBeenCalledWith(expect.stringContaining("Interactive selection requires a TTY"));
    });

    it("loads the picker, accepts a slug, and proceeds to dry-run add", async () => {
        (process.stdin as { isTTY?: boolean }).isTTY = true;
        (process.stdout as { isTTY?: boolean }).isTTY = true;

        // prompts.inject queues answers for the next prompt(s). One answer per prompt question.
        prompts.inject(["moving-border"]);

        await add(undefined, {
            url: tmp,
            interactive: true,
            dryRun: true,
            yes: true,
        });

        // Should reach the dry-run fetch banner after the picker resolved.
        const logged = logSpy.mock.calls.map((c) => String(c[0])).join("\n");
        expect(logged).toContain("[dry-run] Fetching moving-border");
    });

    it("bails when the picker is cancelled (no slug chosen)", async () => {
        (process.stdin as { isTTY?: boolean }).isTTY = true;
        (process.stdout as { isTTY?: boolean }).isTTY = true;

        prompts.inject([undefined]);

        await expect(
            add(undefined, { url: tmp, interactive: true }),
        ).rejects.toThrow("__exit__");
    });
});
