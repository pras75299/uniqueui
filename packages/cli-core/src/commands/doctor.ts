import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import { detectPackageManager, detectTailwindMajor, type PackageManager, type TailwindMajor } from "./add";

type Status = "ok" | "warn" | "fail" | "info";

export type Check = {
    label: string;
    status: Status;
    detail: string;
    hint?: string;
};

export type Framework = "next" | "vite" | "remix" | "astro" | "unknown";

type DepMap = Record<string, string>;

export function detectFramework(allDeps: DepMap): Framework {
    if ("next" in allDeps) return "next";
    if ("@remix-run/react" in allDeps || "@remix-run/node" in allDeps) return "remix";
    if ("astro" in allDeps) return "astro";
    if ("vite" in allDeps) return "vite";
    return "unknown";
}

function readJsonSafeSync(filePath: string): unknown | null {
    try {
        return fs.readJsonSync(filePath);
    } catch {
        return null;
    }
}

function readTextSafeSync(filePath: string): string | null {
    try {
        return fs.readFileSync(filePath, "utf8");
    } catch {
        return null;
    }
}

function nodeMajor(version: string): number | null {
    const m = version.match(/^v?(\d+)\./);
    return m ? Number(m[1]) : null;
}

export function checkNode(version: string = process.version): Check {
    const major = nodeMajor(version);
    if (major === null) {
        return { label: "Node.js", status: "warn", detail: `unrecognized version: ${version}` };
    }
    if (major < 18) {
        return {
            label: "Node.js",
            status: "fail",
            detail: `${version} — uniqueui-cli requires Node ≥18.`,
            hint: "Upgrade to Node 20 LTS or 22 LTS.",
        };
    }
    return { label: "Node.js", status: "ok", detail: `${version}` };
}

export function checkPackageManager(cwd: string): Check {
    const pm: PackageManager = detectPackageManager(cwd);
    // detectPackageManager returns "npm" when no lockfile matches — distinguish
    // a real detection ("pnpm via pnpm-lock.yaml") from the fallback so users
    // can see whether the CLI actually found their PM or guessed.
    const isFallback = pm === "npm" && !hasNpmLockfile(cwd);
    return {
        label: "Package manager",
        status: isFallback ? "info" : "ok",
        detail: isFallback
            ? "npm (no lockfile found — defaulting; `uniqueui add` will run `npm install`)"
            : `${pm} (detected via lockfile)`,
    };
}

function hasNpmLockfile(cwd: string): boolean {
    return fs.existsSync(path.join(cwd, "package-lock.json"));
}

export function checkFramework(cwd: string): Check {
    const pkg = readJsonSafeSync(path.join(cwd, "package.json")) as {
        dependencies?: DepMap;
        devDependencies?: DepMap;
    } | null;
    if (!pkg) {
        return {
            label: "Framework",
            status: "warn",
            detail: "package.json not found — cannot detect framework.",
            hint: "Run `uniqueui doctor` from your project root.",
        };
    }
    const allDeps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
    const fw = detectFramework(allDeps);
    if (fw === "unknown") {
        return {
            label: "Framework",
            status: "info",
            detail: "no known framework detected (Next/Vite/Remix/Astro).",
            hint: "UniqueUI components are framework-agnostic React; ensure your build supports JSX + Tailwind.",
        };
    }
    return { label: "Framework", status: "ok", detail: fw };
}

export type ComponentsConfig = {
    raw: Record<string, unknown>;
    tailwindConfigPath?: string;
    tailwindCssPath?: string;
    componentsDir?: string;
    libDir?: string;
};

export function readComponentsJson(cwd: string): { check: Check; config: ComponentsConfig | null } {
    const filePath = path.join(cwd, "components.json");
    if (!fs.existsSync(filePath)) {
        return {
            check: {
                label: "components.json",
                status: "fail",
                detail: "not found",
                hint: "Run `npx uniqueui init` to scaffold one.",
            },
            config: null,
        };
    }
    const raw = readJsonSafeSync(filePath);
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
        return {
            check: {
                label: "components.json",
                status: "fail",
                detail: "present but not valid JSON object",
                hint: "Delete it and re-run `npx uniqueui init`, or fix the JSON manually.",
            },
            config: null,
        };
    }
    const obj = raw as Record<string, unknown>;
    const tw = (obj.tailwind ?? {}) as Record<string, unknown>;
    const paths = (obj.paths ?? {}) as Record<string, unknown>;
    return {
        check: { label: "components.json", status: "ok", detail: "valid" },
        config: {
            raw: obj,
            tailwindConfigPath: typeof tw.config === "string" ? tw.config : undefined,
            tailwindCssPath: typeof tw.css === "string" ? tw.css : undefined,
            componentsDir: typeof paths.components === "string" ? paths.components : undefined,
            libDir: typeof paths.lib === "string" ? paths.lib : undefined,
        },
    };
}

export function checkTailwind(cwd: string, cfg: ComponentsConfig | null): Check {
    const cssPath = cfg?.tailwindCssPath;
    const major: TailwindMajor = detectTailwindMajor(cwd, cssPath);
    if (major === "unknown") {
        return {
            label: "Tailwind",
            status: "warn",
            detail: "could not detect Tailwind version.",
            hint: "Install tailwindcss (v3 or v4) — UniqueUI components rely on Tailwind utility classes.",
        };
    }

    if (major === "v4") {
        // v4 path: need a CSS file with @import "tailwindcss".
        if (!cssPath) {
            return {
                label: "Tailwind",
                status: "warn",
                detail: "v4 detected, but components.json#tailwind.css is unset.",
                hint: "Set tailwind.css in components.json to your globals.css so v4 token snippets can be appended.",
            };
        }
        const abs = path.isAbsolute(cssPath) ? cssPath : path.join(cwd, cssPath);
        if (!fs.existsSync(abs)) {
            return {
                label: "Tailwind",
                status: "warn",
                detail: `v4 detected, but ${cssPath} does not exist.`,
                hint: "Create the file or fix tailwind.css in components.json.",
            };
        }
        return { label: "Tailwind", status: "ok", detail: `v4 (css: ${cssPath})` };
    }

    // v3 path: need a tailwind.config.{ts,js,mjs,cjs}.
    const configPath = cfg?.tailwindConfigPath ?? "tailwind.config.ts";
    const exts = [".ts", ".js", ".mjs", ".cjs"];
    const base = configPath.replace(/\.(ts|js|mjs|cjs)$/i, "");
    const found =
        fs.existsSync(path.join(cwd, configPath)) ||
        exts.some((e) => fs.existsSync(path.join(cwd, base + e)));
    if (!found) {
        return {
            label: "Tailwind",
            status: "warn",
            detail: `v3 detected, but no config file at ${configPath}.`,
            hint: "Create tailwind.config.ts or update tailwind.config in components.json.",
        };
    }
    return { label: "Tailwind", status: "ok", detail: `v3 (config: ${configPath})` };
}

export function checkTsconfigAliases(cwd: string, cfg: ComponentsConfig | null): Check {
    const tsconfigPath = path.join(cwd, "tsconfig.json");
    if (!fs.existsSync(tsconfigPath)) {
        return {
            label: "tsconfig paths",
            status: "info",
            detail: "no tsconfig.json — skipping path-alias check.",
        };
    }
    const text = readTextSafeSync(tsconfigPath);
    if (!text) {
        return { label: "tsconfig paths", status: "warn", detail: "tsconfig.json unreadable." };
    }
    // tsconfig is JSONC; we don't strip comments — but a simple includes() check
    // for "@/*" survives both formats and tells us the alias resolves.
    if (!/"@\/\*"\s*:/.test(text)) {
        return {
            label: "tsconfig paths",
            status: "warn",
            detail: 'no "@/*" path alias defined.',
            hint: 'Add "paths": { "@/*": ["./*"] } under compilerOptions so registry imports like `@/utils/cn` resolve.',
        };
    }
    void cfg;
    return { label: "tsconfig paths", status: "ok", detail: '"@/*" alias present' };
}

export function checkCnHelper(cwd: string, cfg: ComponentsConfig | null): Check {
    const libDir = cfg?.libDir ?? "utils";
    const candidates = [
        path.join(cwd, libDir, "cn.ts"),
        path.join(cwd, libDir, "cn.tsx"),
        path.join(cwd, libDir, "cn.js"),
        path.join(cwd, libDir, "utils.ts"), // shadcn convention
        path.join(cwd, libDir, "utils.js"),
    ];
    const found = candidates.find((p) => fs.existsSync(p));
    if (!found) {
        return {
            label: "cn helper",
            status: "warn",
            detail: `not found under ${libDir}/.`,
            hint: "Run `npx uniqueui init` or `add` any component — the helper will be created from registry:util.",
        };
    }
    return { label: "cn helper", status: "ok", detail: path.relative(cwd, found) };
}

export function checkComponentsDir(cwd: string, cfg: ComponentsConfig | null): Check {
    const dir = cfg?.componentsDir ?? "components/ui";
    const abs = path.join(cwd, dir);
    if (!fs.existsSync(abs)) {
        return {
            label: "components dir",
            status: "info",
            detail: `${dir} does not exist yet (will be created on first add).`,
        };
    }
    return { label: "components dir", status: "ok", detail: dir };
}

export type DoctorReport = {
    checks: Check[];
    summary: { ok: number; warn: number; fail: number; info: number };
    exitCode: 0 | 1;
};

export function buildReport(cwd: string): DoctorReport {
    const { check: componentsCheck, config } = readComponentsJson(cwd);
    const checks: Check[] = [
        checkNode(),
        checkPackageManager(cwd),
        checkFramework(cwd),
        componentsCheck,
        checkTailwind(cwd, config),
        checkTsconfigAliases(cwd, config),
        checkCnHelper(cwd, config),
        checkComponentsDir(cwd, config),
    ];

    const summary = { ok: 0, warn: 0, fail: 0, info: 0 };
    for (const c of checks) summary[c.status]++;

    return { checks, summary, exitCode: summary.fail > 0 ? 1 : 0 };
}

function symbolFor(status: Status): string {
    switch (status) {
        case "ok":
            return chalk.green("✔");
        case "warn":
            return chalk.yellow("!");
        case "fail":
            return chalk.red("✖");
        case "info":
            return chalk.cyan("i");
    }
}

export function formatReport(report: DoctorReport): string {
    const lines: string[] = [chalk.bold("\nUniqueUI doctor — project diagnostics\n")];
    const labelWidth = report.checks.reduce((m, c) => Math.max(m, c.label.length), 0);
    for (const c of report.checks) {
        const sym = symbolFor(c.status);
        const label = c.label.padEnd(labelWidth);
        lines.push(`${sym} ${label}  ${c.detail}`);
        if (c.hint) lines.push(chalk.gray(`    → ${c.hint}`));
    }
    const { ok, warn, fail, info: infoCount } = report.summary;
    lines.push("");
    lines.push(
        chalk.bold("Summary: ") +
            `${chalk.green(`${ok} ok`)}, ${chalk.yellow(`${warn} warn`)}, ${chalk.red(`${fail} fail`)}, ${chalk.cyan(`${infoCount} info`)}`,
    );
    if (fail === 0 && warn === 0) {
        lines.push(chalk.green("Your project looks ready for `npx uniqueui add`."));
    } else if (fail > 0) {
        lines.push(chalk.red("Resolve the failing checks before running `npx uniqueui add`."));
    } else {
        lines.push(chalk.yellow("Warnings are non-blocking, but worth addressing for the smoothest experience."));
    }
    return lines.join("\n");
}

export async function doctor(_options: Record<string, unknown> = {}) {
    const report = buildReport(process.cwd());
    console.log(formatReport(report));
    if (report.exitCode !== 0) process.exitCode = report.exitCode;
}
