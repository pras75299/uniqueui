import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import path from "path";
import os from "os";
import {
    buildReport,
    checkNode,
    checkPackageManager,
    detectFramework,
    readComponentsJson,
    checkTailwind,
    checkTsconfigAliases,
    checkCnHelper,
    formatReport,
} from "./doctor";

let tmp: string;

beforeEach(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), "uniqueui-doctor-"));
});

afterEach(async () => {
    await fs.remove(tmp);
});

describe("checkNode", () => {
    it("passes on Node 20", () => {
        expect(checkNode("v20.10.0").status).toBe("ok");
    });
    it("fails on Node 16", () => {
        const c = checkNode("v16.20.0");
        expect(c.status).toBe("fail");
        expect(c.hint).toMatch(/Node 20 LTS/);
    });
    it("warns on unrecognized version string", () => {
        expect(checkNode("garbage").status).toBe("warn");
    });
});

describe("detectFramework", () => {
    it("detects Next", () => {
        expect(detectFramework({ next: "16.0.0" })).toBe("next");
    });
    it("detects Vite", () => {
        expect(detectFramework({ vite: "5.0.0" })).toBe("vite");
    });
    it("detects Remix", () => {
        expect(detectFramework({ "@remix-run/react": "2.0.0" })).toBe("remix");
    });
    it("detects Astro", () => {
        expect(detectFramework({ astro: "4.0.0" })).toBe("astro");
    });
    it("returns unknown when no signals", () => {
        expect(detectFramework({ react: "19.0.0" })).toBe("unknown");
    });
});

describe("checkPackageManager", () => {
    it("reports info status when no lockfile (npm is a fallback)", () => {
        const c = checkPackageManager(tmp);
        expect(c.status).toBe("info");
        expect(c.detail).toMatch(/no lockfile found/);
    });

    it("reports ok when an explicit lockfile is present (pnpm)", async () => {
        await fs.writeFile(path.join(tmp, "pnpm-lock.yaml"), "lockfileVersion: 9\n");
        const c = checkPackageManager(tmp);
        expect(c.status).toBe("ok");
        expect(c.detail).toMatch(/^pnpm/);
    });

    it("reports ok when a real npm lockfile is present (not a fallback)", async () => {
        await fs.writeFile(path.join(tmp, "package-lock.json"), "{}");
        const c = checkPackageManager(tmp);
        expect(c.status).toBe("ok");
        expect(c.detail).toMatch(/^npm/);
    });
});

describe("readComponentsJson", () => {
    it("returns fail when missing", () => {
        const { check, config } = readComponentsJson(tmp);
        expect(check.status).toBe("fail");
        expect(config).toBeNull();
    });

    it("parses valid components.json and extracts tailwind paths", async () => {
        await fs.outputJson(path.join(tmp, "components.json"), {
            tailwind: { config: "tailwind.config.ts", css: "app/globals.css" },
            paths: { components: "components/ui", lib: "utils" },
        });
        const { check, config } = readComponentsJson(tmp);
        expect(check.status).toBe("ok");
        expect(config?.tailwindConfigPath).toBe("tailwind.config.ts");
        expect(config?.tailwindCssPath).toBe("app/globals.css");
        expect(config?.componentsDir).toBe("components/ui");
        expect(config?.libDir).toBe("utils");
    });

    it("rejects components.json that is an array", async () => {
        await fs.outputJson(path.join(tmp, "components.json"), []);
        const { check } = readComponentsJson(tmp);
        expect(check.status).toBe("fail");
    });
});

describe("checkTailwind", () => {
    it("passes for v3 with config file present", async () => {
        await fs.outputJson(path.join(tmp, "package.json"), { devDependencies: { tailwindcss: "^3.4.0" } });
        await fs.writeFile(path.join(tmp, "tailwind.config.ts"), "export default {}");
        const c = checkTailwind(tmp, { raw: {}, tailwindConfigPath: "tailwind.config.ts" });
        expect(c.status).toBe("ok");
        expect(c.detail).toMatch(/v3/);
    });

    it("warns when v3 detected but no config file", async () => {
        await fs.outputJson(path.join(tmp, "package.json"), { devDependencies: { tailwindcss: "^3.4.0" } });
        const c = checkTailwind(tmp, { raw: {}, tailwindConfigPath: "tailwind.config.ts" });
        expect(c.status).toBe("warn");
    });

    it("passes for v4 with globals.css present", async () => {
        await fs.outputJson(path.join(tmp, "package.json"), { devDependencies: { tailwindcss: "^4.0.0" } });
        await fs.outputFile(path.join(tmp, "app/globals.css"), '@import "tailwindcss";\n');
        const c = checkTailwind(tmp, { raw: {}, tailwindCssPath: "app/globals.css" });
        expect(c.status).toBe("ok");
        expect(c.detail).toMatch(/v4/);
    });

    it("warns when v4 detected but tailwind.css path missing", async () => {
        await fs.outputJson(path.join(tmp, "package.json"), { devDependencies: { "@tailwindcss/postcss": "^4.0.0" } });
        const c = checkTailwind(tmp, { raw: {} });
        expect(c.status).toBe("warn");
    });
});

describe("checkTsconfigAliases", () => {
    it("warns when @/* alias absent", async () => {
        await fs.writeFile(path.join(tmp, "tsconfig.json"), JSON.stringify({ compilerOptions: { paths: {} } }));
        const c = checkTsconfigAliases(tmp, null);
        expect(c.status).toBe("warn");
    });

    it("passes when @/* alias present", async () => {
        await fs.writeFile(
            path.join(tmp, "tsconfig.json"),
            JSON.stringify({ compilerOptions: { paths: { "@/*": ["./*"] } } }),
        );
        const c = checkTsconfigAliases(tmp, null);
        expect(c.status).toBe("ok");
    });

    it("info when no tsconfig present", () => {
        const c = checkTsconfigAliases(tmp, null);
        expect(c.status).toBe("info");
    });
});

describe("checkCnHelper", () => {
    it("warns when neither cn.ts nor utils.ts exists", () => {
        const c = checkCnHelper(tmp, { raw: {}, libDir: "utils" });
        expect(c.status).toBe("warn");
    });

    it("passes when utils/cn.ts exists", async () => {
        await fs.outputFile(path.join(tmp, "utils/cn.ts"), "export function cn(){}\n");
        const c = checkCnHelper(tmp, { raw: {}, libDir: "utils" });
        expect(c.status).toBe("ok");
    });

    it("passes when shadcn-style utils.ts exists", async () => {
        await fs.outputFile(path.join(tmp, "lib/utils.ts"), "export function cn(){}\n");
        const c = checkCnHelper(tmp, { raw: {}, libDir: "lib" });
        expect(c.status).toBe("ok");
    });
});

describe("buildReport + formatReport", () => {
    it("returns exitCode 1 when components.json is missing (a fail)", () => {
        const report = buildReport(tmp);
        expect(report.exitCode).toBe(1);
        expect(report.summary.fail).toBeGreaterThan(0);
    });

    it("renders symbols and hint lines for each check", async () => {
        await fs.outputJson(path.join(tmp, "components.json"), {
            tailwind: { config: "tailwind.config.ts", css: "app/globals.css" },
            paths: { components: "components/ui", lib: "utils" },
        });
        const report = buildReport(tmp);
        const text = formatReport(report);
        expect(text).toContain("UniqueUI doctor");
        expect(text).toContain("Node.js");
        expect(text).toContain("Summary:");
    });
});
