
import fetch from "node-fetch";
import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import prompts from "prompts";
import { Project, SyntaxKind, QuoteKind } from "ts-morph";
import { spawnSync } from "child_process";
import { createInterface } from "readline/promises";
import { assertSafeNpmDependencies } from "../npm-dependency-name";
import { writeCachedItem } from "../cache";

// Type definition for Registry (matching what we built)
type RegistryItem = {
    name: string;
    dependencies: string[];
    files: Array<{ path: string; type: string; content: string }>;
    tailwindConfig?: Record<string, any>;
    tailwindCss?: string;
};

type RegistryIndex = {
    components: string[];
};

type RegistryLookupResult =
    | { status: "found"; item: RegistryItem }
    | { status: "missing" }
    | { status: "unavailable" };

/** Reject malformed registry JSON before any property access (avoids throws from bad remote/local data). */
export function validateRegistryPayload(data: unknown): RegistryItem[] | null {
    if (!Array.isArray(data)) {
        return null;
    }
    const out: RegistryItem[] = [];
    for (const entry of data) {
        if (entry === null || typeof entry !== "object" || Array.isArray(entry)) {
            return null;
        }
        const o = entry as Record<string, unknown>;
        if (typeof o.name !== "string" || o.name.length === 0) {
            return null;
        }
        let dependencies: string[] = [];
        if (o.dependencies !== undefined) {
            if (!Array.isArray(o.dependencies)) {
                return null;
            }
            for (const d of o.dependencies) {
                if (typeof d !== "string") {
                    return null;
                }
            }
            dependencies = o.dependencies;
        }
        if (!Array.isArray(o.files)) {
            return null;
        }
        const files: RegistryItem["files"] = [];
        for (const f of o.files) {
            if (f === null || typeof f !== "object" || Array.isArray(f)) {
                return null;
            }
            const fo = f as Record<string, unknown>;
            if (typeof fo.path !== "string" || typeof fo.type !== "string" || typeof fo.content !== "string") {
                return null;
            }
            files.push({ path: fo.path, type: fo.type, content: fo.content });
        }
        let tailwindConfig: Record<string, any> | undefined;
        if (o.tailwindConfig !== undefined) {
            if (o.tailwindConfig === null || typeof o.tailwindConfig !== "object" || Array.isArray(o.tailwindConfig)) {
                return null;
            }
            tailwindConfig = o.tailwindConfig as Record<string, any>;
        }
        let tailwindCss: string | undefined;
        if (o.tailwindCss !== undefined) {
            if (typeof o.tailwindCss !== "string" || o.tailwindCss.length === 0) {
                return null;
            }
            // Cap snippet size — appended to a user CSS file, so a hostile
            // registry could otherwise inflate globals.css indefinitely.
            if (o.tailwindCss.length > 16_384) {
                return null;
            }
            tailwindCss = o.tailwindCss;
        }
        out.push({ name: o.name, dependencies, files, tailwindConfig, tailwindCss });
    }
    return out;
}

function validateRegistryItemPayload(data: unknown): RegistryItem | null {
    const validated = validateRegistryPayload([data]);
    return validated?.[0] ?? null;
}

export function validateRegistryIndexPayload(data: unknown): RegistryIndex | null {
    if (data === null || typeof data !== "object" || Array.isArray(data)) {
        return null;
    }

    const components = (data as Record<string, unknown>).components;
    if (!Array.isArray(components) || components.some((entry) => typeof entry !== "string" || entry.length === 0)) {
        return null;
    }

    return { components };
}

/** Local file path (./...) or official registry hosts only. */
function isTrustedRegistryUrl(url: string): boolean {
    if (url.startsWith(".")) return true;
    try {
        const u = new URL(url);
        if (u.hostname === "uniqueui-platform.vercel.app") return true;
        if (
            u.hostname === "raw.githubusercontent.com" &&
            (u.pathname === "/pras75299/uniqueui" || u.pathname.startsWith("/pras75299/uniqueui/"))
        ) {
            return true;
        }
        return false;
    } catch {
        return false;
    }
}

export function warnIfUntrustedRegistry(url: string) {
    if (process.env.UNIQUEUI_SKIP_REGISTRY_WARN) return;
    if (isLocalRegistrySource(url)) return;
    if (isTrustedRegistryUrl(url)) return;
    console.warn(
        chalk.yellow(
            "Warning: custom registry URL — only use sources you trust. The registry controls package installs and files written to your project. See SECURITY.md in the UniqueUI repository.",
        ),
    );
}

const FALLBACK_URL = "https://uniqueui-platform.vercel.app/registry";
const FETCH_TIMEOUT_MS = 15_000;
const MAX_REGISTRY_RESPONSE_BYTES = 2 * 1024 * 1024; // 2MB
const SAFE_FILE_SEGMENT_REGEX = /^[a-z0-9-]+$/;
const SAFE_TAILWIND_TOKEN_REGEX = /^[a-zA-Z0-9_-]+$/;

function isSafeFileSegment(value: string): boolean {
    return SAFE_FILE_SEGMENT_REGEX.test(value);
}

function assertPathWithin(targetDir: string, targetPath: string): void {
    const relativePath = path.relative(targetDir, targetPath);
    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
        throw new Error(`Refusing to write outside target directory: ${targetPath}`);
    }
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

export type PackageManager = "bun" | "pnpm" | "yarn" | "npm";

/** Detect the project's package manager by lockfile, ordered bun > pnpm > yarn > npm. */
export function detectPackageManager(cwd: string = process.cwd()): PackageManager {
    if (fs.existsSync(path.join(cwd, "bun.lock")) || fs.existsSync(path.join(cwd, "bun.lockb"))) return "bun";
    if (fs.existsSync(path.join(cwd, "pnpm-lock.yaml"))) return "pnpm";
    if (fs.existsSync(path.join(cwd, "yarn.lock"))) return "yarn";
    return "npm";
}

export type TailwindMajor = "v3" | "v4" | "unknown";

/**
 * Detect whether the user's project uses Tailwind v3 or v4 — used to choose
 * between the JS-config merge path and the CSS-append path.
 *
 * Signals, in priority order:
 *  1. `package.json` declares `@tailwindcss/postcss` / `@tailwindcss/vite` /
 *     `@tailwindcss/cli` — those packages are v4-only.
 *  2. `package.json` declares `tailwindcss` and the version range starts with
 *     "4" (e.g. ^4, ~4.0, 4.0.0, >=4).
 *  3. Same `tailwindcss` field starting with "3" or "2" → v3.
 *  4. Fallback: inspect the configured CSS file. `@import "tailwindcss"` is
 *     the v4 entrypoint; `@tailwind base` / `@tailwind utilities` are v3.
 *  5. Otherwise "unknown" — caller should default to the v3 path.
 *
 * `cssPath` is optional; pass `components.json#tailwind.css` when available so
 * detection can fall back to the CSS file when package.json is ambiguous.
 */
export function detectTailwindMajor(cwd: string = process.cwd(), cssPath?: string): TailwindMajor {
    const pkgPath = path.join(cwd, "package.json");
    if (fs.existsSync(pkgPath)) {
        try {
            const pkg = fs.readJsonSync(pkgPath) as {
                dependencies?: Record<string, string>;
                devDependencies?: Record<string, string>;
            };
            const allDeps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
            // v4-only sibling packages — strongest signal.
            if (
                "@tailwindcss/postcss" in allDeps ||
                "@tailwindcss/vite" in allDeps ||
                "@tailwindcss/cli" in allDeps
            ) {
                return "v4";
            }
            const twRange = allDeps["tailwindcss"];
            if (typeof twRange === "string") {
                const m = twRange.match(/(\d+)/);
                if (m) {
                    const major = Number(m[1]);
                    if (major >= 4) return "v4";
                    if (major <= 3) return "v3";
                }
            }
        } catch {
            // ignore — fall through to CSS sniff
        }
    }

    if (cssPath) {
        const absCss = path.isAbsolute(cssPath) ? cssPath : path.join(cwd, cssPath);
        if (fs.existsSync(absCss)) {
            try {
                const css = fs.readFileSync(absCss, "utf8");
                if (/@import\s+["']tailwindcss["']/.test(css)) return "v4";
                if (/@tailwind\s+(base|components|utilities)\b/.test(css)) return "v3";
            } catch {
                // ignore — fall through
            }
        }
    }

    return "unknown";
}

const TAILWIND_CSS_MARKER_PREFIX = "/* uniqueui:start";

function buildMarkerBlock(slug: string, snippet: string): string {
    const trimmed = snippet.endsWith("\n") ? snippet : `${snippet}\n`;
    return `\n/* uniqueui:start ${slug} */\n${trimmed}/* uniqueui:end ${slug} */\n`;
}

export type AppendCssOutcome =
    | "appended"
    | "replaced"
    | "already-present"
    | "dry-run"
    | "missing-file"
    | "skipped";

/**
 * Append a registry-provided Tailwind v4 snippet to the user's globals CSS,
 * wrapped in uniqueui:start/end markers so re-runs are idempotent.
 *
 * Behavior on an existing slug marker:
 *  - default → return "already-present" (skip, preserve any local edits inside the block).
 *  - force   → splice the old block out and write the new one ("replaced"); honors dryRun.
 *
 * Other outcomes:
 *  - File missing → "missing-file" (caller logs guidance).
 *  - dryRun on a brand-new slug → "dry-run".
 *  - First write → "appended".
 *
 * Skip-on-present is the safe default: a user may have hand-tuned values inside
 * the block, and silently overwriting them on every `add` would frustrate them.
 * `--force` opts in to authoritative replacement, matching writeRegistryUiFile.
 */
export async function appendTailwindCss(
    cssPath: string,
    snippet: string,
    slug: string,
    opts: { dryRun?: boolean; force?: boolean } = {},
): Promise<AppendCssOutcome> {
    const rel = path.relative(process.cwd(), cssPath) || cssPath;

    if (!fs.existsSync(cssPath)) {
        console.warn(
            chalk.yellow(
                `Tailwind globals CSS not found at ${rel}. Skipping v4 token append — copy the snippet manually into your @theme block:\n${snippet}`,
            ),
        );
        return "missing-file";
    }

    const existing = await fs.readFile(cssPath, "utf8");
    const startMarker = `${TAILWIND_CSS_MARKER_PREFIX} ${slug} */`;
    const endMarker = `/* uniqueui:end ${slug} */`;
    const startIdx = existing.indexOf(startMarker);

    if (startIdx !== -1) {
        // Marker present — either skip (default) or replace (force).
        if (!opts.force) {
            return "already-present";
        }

        const endIdx = existing.indexOf(endMarker, startIdx);
        if (endIdx === -1) {
            // Truncated/edited marker pair — refuse to guess, leave the file alone.
            console.warn(
                chalk.yellow(
                    `Found "${startMarker}" in ${rel} but no matching end marker. Leaving the file untouched — remove the partial block manually and re-run.`,
                ),
            );
            return "skipped";
        }

        const block = buildMarkerBlock(slug, snippet);
        const before = existing.slice(0, startIdx);
        const after = existing.slice(endIdx + endMarker.length);
        // buildMarkerBlock already brackets with newlines; collapse any
        // accidental triple-newline at the seam to avoid creeping whitespace
        // after repeated --force runs.
        const stitched = `${before.replace(/\n+$/, "\n")}${block.replace(/^\n+/, "\n")}${after.replace(/^\n+/, "\n")}`;

        if (opts.dryRun) {
            console.log(chalk.cyan(`[dry-run] Would replace existing block for "${slug}" in ${rel} with:`));
            console.log(block.trimEnd());
            return "dry-run";
        }

        await fs.writeFile(cssPath, stitched);
        console.log(chalk.yellow(`Replaced Tailwind v4 tokens for "${slug}" in ${rel}`));
        return "replaced";
    }

    const block = buildMarkerBlock(slug, snippet);

    if (opts.dryRun) {
        console.log(chalk.cyan(`[dry-run] Would append the following CSS to ${rel}:`));
        console.log(block.trimEnd());
        return "dry-run";
    }

    // Ensure separation from prior content even if the user's file has no
    // trailing newline.
    const sep = existing.endsWith("\n") ? "" : "\n";
    await fs.writeFile(cssPath, `${existing}${sep}${block}`);
    console.log(chalk.green(`Appended Tailwind v4 tokens for "${slug}" to ${rel}`));
    return "appended";
}

/**
 * Per-index line diff (no external dep). Noisier than an LCS-based diff but
 * faithful — every differing index emits its old and new line. Set-based
 * dedup was intentionally removed because it silently hid changes whenever
 * a line appeared anywhere on the other side (e.g. blank lines, repeated
 * imports, JSX closers — common in `components/ui/*.tsx`).
 */
export function printUnifiedDiff(oldContent: string, newContent: string, label: string): void {
    const oldLines = oldContent.split("\n");
    const newLines = newContent.split("\n");
    console.log(chalk.gray(`--- ${label} (current)`));
    console.log(chalk.gray(`+++ ${label} (registry)`));
    const max = Math.max(oldLines.length, newLines.length);
    for (let i = 0; i < max; i++) {
        const o = oldLines[i];
        const n = newLines[i];
        if (o === n) {
            if (o !== undefined) console.log(`  ${o}`);
            continue;
        }
        if (o !== undefined) console.log(chalk.red(`- ${o}`));
        if (n !== undefined) console.log(chalk.green(`+ ${n}`));
    }
}

export type WriteOutcome = "written" | "overwritten" | "skipped" | "dry-run";

/**
 * Write a `registry:ui` file with conflict-aware behavior.
 *  - dryRun → no fs write; reports intended action.
 *  - force  → overwrite without prompting.
 *  - default on conflict → prompt y/N/diff. 'N' skips; 'diff' shows a diff then re-prompts.
 *  - non-interactive terminal + no force + conflict → skip with warning.
 */
export async function writeRegistryUiFile(
    targetPath: string,
    content: string,
    opts: { dryRun?: boolean; force?: boolean } = {},
): Promise<WriteOutcome> {
    const exists = fs.existsSync(targetPath);
    const rel = path.relative(process.cwd(), targetPath) || targetPath;

    if (opts.dryRun) {
        if (exists) console.log(chalk.yellow(`[dry-run] Would overwrite ${rel}`));
        else console.log(chalk.cyan(`[dry-run] Would create ${rel}`));
        return "dry-run";
    }

    if (!exists) {
        await fs.writeFile(targetPath, content);
        console.log(chalk.green(`Created ${rel}`));
        return "written";
    }

    if (opts.force) {
        await fs.writeFile(targetPath, content);
        console.log(chalk.yellow(`Overwrote ${rel}`));
        return "overwritten";
    }

    // CI / piped shells can't answer a prompt — skip with a clear hint instead
    // of hanging. Tests that need to exercise the prompt path must explicitly
    // set `process.stdin.isTTY = true` / `process.stdout.isTTY = true` (and use
    // `prompts.inject()` for answers) so production code never has a test-env
    // backdoor that could be tripped accidentally by `NODE_ENV=test` in CI.
    const isInteractive = Boolean(process.stdin.isTTY && process.stdout.isTTY);
    if (!isInteractive) {
        console.warn(
            chalk.yellow(
                `Skipping existing file ${rel}. Re-run with --force to overwrite or --dry-run to inspect.`,
            ),
        );
        return "skipped";
    }

    let oldContent = "";
    try {
        oldContent = await fs.readFile(targetPath, "utf8");
    } catch {
        // proceed without diff
    }

    // Loop so 'diff' can show the diff and re-prompt.
    for (;;) {
        const { choice } = (await prompts({
            type: "select",
            name: "choice",
            message: `${rel} exists. Overwrite?`,
            choices: [
                { title: "No, skip", value: "skip" },
                { title: "Yes, overwrite", value: "overwrite" },
                { title: "Show diff first", value: "diff" },
            ],
            initial: 0,
        })) as { choice?: "skip" | "overwrite" | "diff" };

        if (choice === "overwrite") {
            await fs.writeFile(targetPath, content);
            console.log(chalk.yellow(`Overwrote ${rel}`));
            return "overwritten";
        }
        if (choice === "diff") {
            printUnifiedDiff(oldContent, content, rel);
            continue;
        }
        // default / skip / Ctrl-C
        console.log(chalk.gray(`Skipped ${rel}`));
        return "skipped";
    }
}

export async function fetchJsonFromUrl(url: string): Promise<unknown | null> {
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
        const res = (await fetch(url, { signal: controller.signal })) as Awaited<
            ReturnType<typeof fetch>
        >;
        if (!res.ok) return null;
        const contentLengthHeader =
            typeof (res as { headers?: { get?: (name: string) => string | null } }).headers?.get === "function"
                ? res.headers.get("content-length")
                : null;
        if (contentLengthHeader) {
            const contentLength = Number(contentLengthHeader);
            if (Number.isFinite(contentLength) && contentLength > MAX_REGISTRY_RESPONSE_BYTES) {
                throw new Error(`Registry response exceeds ${MAX_REGISTRY_RESPONSE_BYTES} bytes`);
            }
        }

        const body = (res as unknown as {
            body?: { getReader?: () => {
                read: () => Promise<{ done: boolean; value?: Uint8Array }>;
                cancel: () => Promise<void>;
            } } | null;
        }).body;
        if (body && typeof body.getReader === "function") {
            const reader = body.getReader();
            const decoder = new TextDecoder("utf-8");
            let received = 0;
            let bodyText = "";
            for (;;) {
                const { done, value } = await reader.read();
                if (done) break;
                if (!value) continue;
                received += value.byteLength;
                if (received > MAX_REGISTRY_RESPONSE_BYTES) {
                    try {
                        await reader.cancel();
                    } catch {
                        // best-effort cancel
                    }
                    throw new Error(`Registry response exceeds ${MAX_REGISTRY_RESPONSE_BYTES} bytes`);
                }
                bodyText += decoder.decode(value, { stream: true });
            }
            bodyText += decoder.decode();
            return JSON.parse(bodyText);
        }

        if (typeof (res as { text?: () => Promise<string> }).text !== "function") {
            throw new Error("Registry response body is unreadable");
        }
        const bodyText = await res.text();
        if (Buffer.byteLength(bodyText, "utf8") > MAX_REGISTRY_RESPONSE_BYTES) {
            throw new Error(`Registry response exceeds ${MAX_REGISTRY_RESPONSE_BYTES} bytes`);
        }
        return JSON.parse(bodyText);
    } catch (error) {
        console.error(chalk.yellow(`\nWarning: Failed to fetch from ${url}:`), error);
        return null;
    } finally {
        clearTimeout(timeoutHandle);
    }
}

async function confirmDependencyInstall(
    dependencies: string[],
    options: { yes?: boolean },
): Promise<boolean> {
    if (options.yes || process.env.CI === "true" || process.env.UNIQUEUI_ASSUME_YES === "1") {
        return true;
    }
    if (process.env.NODE_ENV === "test") {
        return true;
    }

    if (!process.stdin.isTTY || !process.stdout.isTTY) {
        console.warn(
            chalk.yellow(
                "Non-interactive terminal detected: skipping automatic dependency install. Re-run with --yes to allow auto-install.",
            ),
        );
        return false;
    }

    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    try {
        console.log(chalk.cyan(`Dependencies requested by registry: ${dependencies.join(", ")}`));
        const answer = (await rl.question(chalk.cyan("Install these dependencies now? [y/N]: "))).trim().toLowerCase();
        return answer === "y" || answer === "yes";
    } finally {
        rl.close();
    }
}

function getSplitRegistryBases(basePath: string): string[] {
    if (basePath.endsWith("/index.json")) {
        return [basePath.slice(0, -"/index.json".length)];
    }

    return basePath.endsWith("/registry") ? [basePath] : [`${basePath}/registry`, basePath];
}

function getLegacyRegistryBase(basePath: string): string {
    if (basePath.endsWith("/registry/index.json")) {
        return basePath.slice(0, -"/registry/index.json".length);
    }

    if (basePath.endsWith("/index.json")) {
        return basePath.slice(0, -"/index.json".length);
    }

    if (basePath.endsWith("/registry")) {
        return basePath.slice(0, -"/registry".length);
    }

    return basePath;
}

function getLegacyRegistryJsonCandidates(basePath: string): string[] {
    if (basePath.endsWith("/registry/index.json")) {
        const registryDir = basePath.slice(0, -"/index.json".length);
        return [path.join(registryDir, "registry.json"), path.join(getLegacyRegistryBase(basePath), "registry.json")];
    }

    if (basePath.endsWith("/index.json")) {
        const registryDir = basePath.slice(0, -"/index.json".length);
        return [path.join(registryDir, "registry.json")];
    }

    if (basePath.endsWith("/registry")) {
        return [path.join(basePath, "registry.json"), path.join(getLegacyRegistryBase(basePath), "registry.json")];
    }

    if (basePath.endsWith(".json")) {
        return [basePath];
    }

    return [path.join(basePath, "registry.json")];
}

function joinUrlPath(baseUrl: string, suffix: string): string {
    return `${baseUrl.replace(/\/+$/, "")}/${suffix.replace(/^\/+/, "")}`;
}

function getRemoteLegacyRegistryJsonCandidates(baseUrl: string): string[] {
    if (baseUrl.endsWith("/registry/index.json")) {
        const registryDir = baseUrl.slice(0, -"/index.json".length);
        return [joinUrlPath(registryDir, "registry.json"), joinUrlPath(getLegacyRegistryBase(baseUrl), "registry.json")];
    }

    if (baseUrl.endsWith("/index.json")) {
        const registryDir = baseUrl.slice(0, -"/index.json".length);
        return [joinUrlPath(registryDir, "registry.json")];
    }

    if (baseUrl.endsWith("/registry")) {
        return [joinUrlPath(baseUrl, "registry.json"), joinUrlPath(getLegacyRegistryBase(baseUrl), "registry.json")];
    }

    if (baseUrl.endsWith(".json")) {
        return [baseUrl];
    }

    return [joinUrlPath(baseUrl, "registry.json")];
}

function getRemoteLegacyApiCandidates(baseUrl: string): string[] {
    if (baseUrl.endsWith("/registry/index.json")) {
        const registryDir = baseUrl.slice(0, -"/index.json".length);
        return [joinUrlPath(registryDir, "api/registry"), joinUrlPath(getLegacyRegistryBase(baseUrl), "api/registry")];
    }

    if (baseUrl.endsWith("/registry")) {
        return [joinUrlPath(baseUrl, "api/registry"), joinUrlPath(getLegacyRegistryBase(baseUrl), "api/registry")];
    }

    return [joinUrlPath(getLegacyRegistryBase(baseUrl), "api/registry")];
}

export function isLocalRegistrySource(source: string): boolean {
    if (source.startsWith(".") || path.isAbsolute(source)) {
        return true;
    }

    try {
        const parsed = new URL(source);
        return parsed.protocol === "file:";
    } catch {
        return true;
    }
}

async function readLocalRegistryItem(basePath: string, componentName: string): Promise<RegistryLookupResult> {
    if (basePath.endsWith(".json") && !basePath.endsWith("/index.json")) {
        const payload = await fs.readJson(basePath);
        const directItem = validateRegistryItemPayload(payload);
        if (directItem) {
            return directItem.name === componentName ? { status: "found", item: directItem } : { status: "missing" };
        }

        const legacyRegistry = validateRegistryPayload(payload);
        if (!legacyRegistry) {
            return { status: "unavailable" };
        }

        const item = legacyRegistry.find((entry) => entry.name === componentName);
        return item ? { status: "found", item } : { status: "missing" };
    }

    let loadedRegistry = false;
    for (const candidateBasePath of getSplitRegistryBases(basePath)) {
        try {
            const index = validateRegistryIndexPayload(await fs.readJson(path.join(candidateBasePath, "index.json")));
            if (!index) {
                continue;
            }

            loadedRegistry = true;
            if (!index?.components.includes(componentName)) {
                continue;
            }

            const item = validateRegistryItemPayload(
                await fs.readJson(path.join(candidateBasePath, `${componentName}.json`)),
            );
            if (item) {
                return { status: "found", item };
            }
        } catch {
            // Try the next candidate base path.
        }
    }

    for (const legacyRegistryPath of getLegacyRegistryJsonCandidates(basePath)) {
        try {
            const legacyRegistry = validateRegistryPayload(await fs.readJson(legacyRegistryPath));
            if (!legacyRegistry) {
                continue;
            }

            loadedRegistry = true;
            const item = legacyRegistry.find((entry) => entry.name === componentName);
            return item ? { status: "found", item } : { status: "missing" };
        } catch {
            // Try the next candidate legacy path.
        }
    }

    return loadedRegistry ? { status: "missing" } : { status: "unavailable" };
}

async function fetchRemoteRegistryItem(baseUrl: string, componentName: string): Promise<RegistryLookupResult> {
    const normalized = baseUrl.replace(/\/+$/, "");

    if (normalized.endsWith(".json") && !normalized.endsWith("/index.json")) {
        const payload = await fetchJsonFromUrl(normalized);
        const directItem = validateRegistryItemPayload(payload);
        if (directItem) {
            return directItem.name === componentName ? { status: "found", item: directItem } : { status: "missing" };
        }

        const legacyRegistry = validateRegistryPayload(payload);
        if (!legacyRegistry) {
            return { status: "unavailable" };
        }

        const item = legacyRegistry.find((entry) => entry.name === componentName);
        return item ? { status: "found", item } : { status: "missing" };
    }

    let loadedRegistry = false;
    for (const candidateBaseUrl of getSplitRegistryBases(normalized)) {
        const index = validateRegistryIndexPayload(await fetchJsonFromUrl(`${candidateBaseUrl}/index.json`));
        if (!index) {
            continue;
        }

        loadedRegistry = true;

        if (index?.components.includes(componentName)) {
            const item = validateRegistryItemPayload(await fetchJsonFromUrl(`${candidateBaseUrl}/${componentName}.json`));
            if (item) {
                return { status: "found", item };
            }
        }
    }

    for (const legacyRegistryUrl of [...new Set(getRemoteLegacyRegistryJsonCandidates(normalized))]) {
        const legacyRegistry = validateRegistryPayload(await fetchJsonFromUrl(legacyRegistryUrl));
        if (!legacyRegistry) {
            continue;
        }

        loadedRegistry = true;
        const item = legacyRegistry.find((entry) => entry.name === componentName);
        return item ? { status: "found", item } : { status: "missing" };
    }

    for (const apiRegistryUrl of [...new Set(getRemoteLegacyApiCandidates(normalized))]) {
        const apiRegistry = validateRegistryPayload(await fetchJsonFromUrl(apiRegistryUrl));
        if (apiRegistry) {
            loadedRegistry = true;
            const item = apiRegistry.find((entry) => entry.name === componentName);
            return item ? { status: "found", item } : { status: "missing" };
        }
    }

    return loadedRegistry ? { status: "missing" } : { status: "unavailable" };
}

async function pickComponentInteractively(url: string): Promise<string | null> {
    const { loadRegistryEntries } = await import("./list");
    console.log(chalk.cyan(`Loading components from ${url}...`));
    const entries = await loadRegistryEntries(url);
    if (!entries || entries.length === 0) {
        console.error(chalk.red(`No components available at ${url}.`));
        return null;
    }
    const sorted = [...entries].sort((a, b) => a.name.localeCompare(b.name));
    const { slug } = (await prompts({
        type: "autocomplete",
        name: "slug",
        message: "Pick a component to add",
        choices: sorted.map((e) => ({
            title: e.title ? `${e.name} — ${e.title}` : e.name,
            description: e.description,
            value: e.name,
        })),
    })) as { slug?: string };
    return slug ?? null;
}

export async function add(
    componentName: string | undefined,
    options: { url: string; yes?: boolean; dryRun?: boolean; force?: boolean; interactive?: boolean },
) {
    const isInteractive = Boolean(process.stdin.isTTY && process.stdout.isTTY);
    // Picker fires only when no slug was provided. `-i` documents intent but
    // never overrides an explicit slug — that surprised users in early
    // testing and made non-TTY automation flag falsely.
    if (!componentName) {
        if (!isInteractive) {
            console.error(
                chalk.red("Interactive selection requires a TTY. Pass a component slug or run in a real terminal."),
            );
            process.exit(1);
        }
        const picked = await pickComponentInteractively(options.url);
        if (!picked) {
            process.exit(1);
        }
        componentName = picked;
    }

    if (options.dryRun) {
        console.log(chalk.cyan(`[dry-run] Fetching ${componentName} from ${options.url}...`));
    } else {
        console.log(`Fetching ${componentName} from ${options.url}...`);
    }
    warnIfUntrustedRegistry(options.url);

    // 1. Load config
    let config;
    try {
        config = await fs.readJson("components.json");
    } catch {
        console.error(chalk.red("components.json not found. Run 'init' first."));
        process.exit(1);
    }

    // 2. Fetch registry
    let lookupResult: RegistryLookupResult = { status: "unavailable" };
    let sourceLabel = options.url;

    try {
        if (isLocalRegistrySource(options.url)) {
            lookupResult = await readLocalRegistryItem(options.url, componentName);
        } else {
            lookupResult = await fetchRemoteRegistryItem(options.url, componentName);
            if (lookupResult.status !== "found" && options.url !== FALLBACK_URL) {
                console.log(chalk.yellow(`Trying fallback URL: ${FALLBACK_URL}...`));
                lookupResult = await fetchRemoteRegistryItem(FALLBACK_URL, componentName);
                sourceLabel = FALLBACK_URL;
            }
        }
    } catch (e) {
        console.error(chalk.red("Could not fetch registry data"), e);
        process.exit(1);
    }

    if (lookupResult.status === "unavailable") {
        console.error(chalk.red(`Could not fetch registry data from ${sourceLabel}.`));
        process.exit(1);
    }

    if (lookupResult.status === "missing") {
        console.error(chalk.red(`Component ${componentName} not found in registry source ${sourceLabel}.`));
        process.exit(1);
    }

    const item = lookupResult.item;

    // 3. Install dependencies (validated names + no shell — avoids injection from a malicious registry)
    if (item.dependencies.length) {
        const depCheck = assertSafeNpmDependencies(item.dependencies);
        if (!depCheck.ok) {
            console.error(
                chalk.red(
                    `Refusing to install: invalid dependency name(s) from registry: ${depCheck.invalid.join(", ")}`,
                ),
            );
            process.exit(1);
        }
        if (options.dryRun) {
            const pm = detectPackageManager();
            const args = pm === "npm" ? ["install", ...item.dependencies] : ["add", ...item.dependencies];
            console.log(chalk.cyan(`[dry-run] Would run: ${pm} ${args.join(" ")}`));
        } else {
            const shouldInstall = await confirmDependencyInstall(item.dependencies, options);
            if (!shouldInstall) {
                console.log(
                    chalk.yellow(
                        `Skipping dependency installation. Install manually: ${
                            item.dependencies.join(" ")
                        }`,
                    ),
                );
            } else {
                console.log(chalk.cyan(`Installing dependencies: ${item.dependencies.join(", ")}`));
                try {
                    const pm = detectPackageManager();
                    const args = pm === "npm" ? ["install", ...item.dependencies] : ["add", ...item.dependencies];
                    const result = spawnSync(pm, args, { stdio: "inherit", shell: false, env: process.env });
                    if (result.error) throw result.error;
                    if (result.signal) {
                        throw new Error(`package manager terminated by signal ${result.signal}`);
                    }
                    if (result.status !== 0) {
                        throw new Error(`package manager exited with code ${result.status}`);
                    }
                } catch (error) {
                    console.warn(chalk.yellow("Failed to install dependencies automatically. Please install them manually."));
                    const errorDetails = error instanceof Error ? error.message : String(error);
                    console.warn(chalk.yellow(`Error details: ${errorDetails}`));
                }
            }
        }
    }

    // 4. Update Tailwind tokens — dual-path:
    //    - v4 project + registry ships tailwindCss → append CSS snippet to globals.
    //    - v3 project (or no v4 signal) + registry ships tailwindConfig → JS-config merge.
    //    - Mismatch (v4 user, only tailwindConfig OR vice versa) → warn with copy/paste hint.
    if (item.tailwindCss || item.tailwindConfig) {
        const cssRel: string | undefined = config?.tailwind?.css;
        const major = detectTailwindMajor(process.cwd(), cssRel);

        if (major === "v4" && item.tailwindCss) {
            const cssAbs = path.resolve(cssRel || "app/globals.css");
            await appendTailwindCss(cssAbs, item.tailwindCss, item.name, {
                dryRun: options.dryRun,
                force: options.force,
            });
        } else if (major === "v4" && !item.tailwindCss && item.tailwindConfig) {
            console.warn(
                chalk.yellow(
                    `Tailwind v4 detected, but "${item.name}" only ships a JS-config snippet. ` +
                    `Translate the keyframes/animation below into your @theme block manually:\n` +
                    JSON.stringify(item.tailwindConfig, null, 2),
                ),
            );
        } else if (item.tailwindConfig) {
            // v3 (or unknown — safe default is the JS-config merge).
            if (options.dryRun) {
                const preview = JSON.stringify(item.tailwindConfig, null, 2).split("\n");
                const head = preview.slice(0, 12).join("\n");
                const trailer = preview.length > 12 ? `\n${chalk.gray(`… (+${preview.length - 12} more lines)`)}` : "";
                console.log(chalk.cyan(`[dry-run] Would merge into tailwind.config:`));
                console.log(`${head}${trailer}`);
            } else {
                console.log(chalk.cyan("Updating tailwind.config..."));
                await updateTailwindConfig(config.tailwind.config, item.tailwindConfig);
            }
        } else if (item.tailwindCss) {
            // v3 user, registry only ships v4 snippet — rare, but explain.
            console.warn(
                chalk.yellow(
                    `"${item.name}" ships Tailwind v4 CSS tokens but no v3 JS-config equivalent. ` +
                    `If you are on Tailwind v3, translate the snippet into theme.extend manually:\n${item.tailwindCss}`,
                ),
            );
        }
    }

    const allowedRegistryFile = (name: string) => /\.(tsx?|jsx?|mjs|cjs)$/i.test(name);

    // 5. Write Files
    for (const file of item.files) {
        if (file.type === "registry:ui") {
            const targetDir = path.resolve(config.paths.components || "components/ui");
            await fs.ensureDir(targetDir);
            const sourceFileName = path.basename(file.path);
            const fileName =
                /^component\.(tsx|ts|jsx|js)$/i.test(sourceFileName)
                    ? `${item.name}${path.extname(sourceFileName)}`
                    : sourceFileName;
            if (!isSafeFileSegment(item.name)) {
                console.error(chalk.red(`Refusing unsafe component name from registry: ${item.name}`));
                process.exit(1);
            }
            if (!allowedRegistryFile(fileName)) {
                console.error(chalk.red(`Refusing to write disallowed file name from registry: ${fileName}`));
                process.exit(1);
            }
            const targetPath = path.join(targetDir, fileName);
            try {
                assertPathWithin(targetDir, targetPath);
            } catch (error) {
                console.error(chalk.red(String(error)));
                process.exit(1);
            }
            await writeRegistryUiFile(targetPath, file.content, {
                dryRun: options.dryRun,
                force: options.force,
            });
        } else if (file.type === "registry:util") {
            const targetDir = path.resolve(config.paths.lib || "utils");
            await fs.ensureDir(targetDir);
            const fileName = path.basename(file.path);
            if (!allowedRegistryFile(fileName)) {
                console.error(chalk.red(`Refusing to write disallowed util file name from registry: ${fileName}`));
                process.exit(1);
            }
            const targetPath = path.join(targetDir, fileName);
            try {
                assertPathWithin(targetDir, targetPath);
            } catch (error) {
                console.error(chalk.red(String(error)));
                process.exit(1);
            }

            // Only create util if it doesn't exist (skip-if-exists is intentional — never clobber user's cn)
            if (!fs.existsSync(targetPath)) {
                if (options.dryRun) {
                    const rel = path.relative(process.cwd(), targetPath) || targetPath;
                    console.log(chalk.cyan(`[dry-run] Would create ${rel}`));
                } else {
                    await fs.writeFile(targetPath, file.content);
                    console.log(chalk.green(`Created ${fileName}`));
                }
            }
        }
    }

    // 6. Record the canonical upstream snapshot so `uniqueui diff` / `update` can compare
    // user-on-disk vs last-fetched without re-fetching. Skipped on dry-run.
    if (!options.dryRun) {
        try {
            await writeCachedItem(item.name, item, sourceLabel);
        } catch {
            // Cache write is best-effort — never fail the add over it.
        }
    }
}

export async function updateTailwindConfig(configPath: string, newConfig: any) {
    // Check for config file existence and handle fallback
    let finalConfigPath = configPath;
    if (!fs.existsSync(finalConfigPath)) {
        // Try alternatives
        const ext = path.extname(configPath);
        const base = configPath.slice(0, -ext.length);
        const altExts = [".ts", ".js", ".mjs", ".cjs"];

        const found = altExts.find(e => fs.existsSync(base + e));
        if (found) {
            console.log(chalk.yellow(`Config ${configPath} not found, using ${base + found} instead.`));
            finalConfigPath = base + found;
        } else {
            console.warn(chalk.yellow(`Tailwind config not found at ${configPath}. Skipping update.`));
            return;
        }
    }

    const project = new Project({
        manipulationSettings: {
            quoteKind: QuoteKind.Double,
        }
    });

    // Attempt to add the file
    let sourceFile;
    try {
        sourceFile = project.addSourceFileAtPath(finalConfigPath);
    } catch (e) {
        console.error(chalk.yellow(`Failed to parse tailwind config at ${finalConfigPath}. Skipping update.`), e);
        return;
    }

    // Simplistic handling: look for export default or module.exports
    // We expect the config to be an object literal.

    // We need to merge `newConfig.theme.extend` into the existing config.
    // logic: find 'theme' property -> find 'extend' property -> merge properties.

    const exportAssignment = sourceFile.getExportAssignment((e) => !e.isExportEquals()); // export default
    let objectLiteral;

    if (exportAssignment) {
        const expr = exportAssignment.getExpression();
        if (expr.getKind() === SyntaxKind.ObjectLiteralExpression) {
            objectLiteral = expr.asKind(SyntaxKind.ObjectLiteralExpression);
        } else if (expr.getKind() === SyntaxKind.Identifier) {
            // handle: const config = { ... }; export default config;
            // (the pattern create-next-app generates)
            const varDecl = sourceFile.getVariableDeclaration(expr.getText());
            const initializer = varDecl?.getInitializer();
            objectLiteral =
                initializer?.asKind(SyntaxKind.ObjectLiteralExpression) ??
                initializer
                    ?.asKind(SyntaxKind.SatisfiesExpression)
                    ?.getExpression()
                    .asKind(SyntaxKind.ObjectLiteralExpression) ??
                initializer
                    ?.asKind(SyntaxKind.AsExpression)
                    ?.getExpression()
                    .asKind(SyntaxKind.ObjectLiteralExpression);
        }
    } else {
        // try module.exports
        const stmt = sourceFile.getStatement((s) => {
            if (s.getKind() === SyntaxKind.ExpressionStatement) {
                const expr = s.asKind(SyntaxKind.ExpressionStatement)?.getExpression();
                if (expr && expr.getKind() === SyntaxKind.BinaryExpression) {
                    const binary = expr.asKind(SyntaxKind.BinaryExpression);
                    const left = binary?.getLeft();
                    if (left?.getText() === "module.exports") return true;
                }
            }
            return false;
        });
        if (stmt) {
            const binary = stmt.asKind(SyntaxKind.ExpressionStatement)!.getExpression().asKind(SyntaxKind.BinaryExpression)!;
            objectLiteral = binary.getRight().asKind(SyntaxKind.ObjectLiteralExpression);
        }
    }

    if (!objectLiteral) {
        console.warn(chalk.yellow("Could not parse tailwind config object. Skipping update."));
        return;
    }

    // Heuristics:
    // newConfig is { theme: { extend: { animation: {...}, keyframes: {...} } } }

    // Helper to get or create property object
    const getOrCreateObjectProperty = (parentObj: any, name: string) => {
        let prop = parentObj.getProperty(name);
        if (!prop) {
            parentObj.addPropertyAssignment({ name, initializer: "{}" });
            prop = parentObj.getProperty(name);
        }
        const init = prop?.asKind(SyntaxKind.PropertyAssignment)?.getInitializer();
        return init?.asKind(SyntaxKind.ObjectLiteralExpression);
    };

    const hasProperty = (objectLiteralExpression: any, name: string) =>
        objectLiteralExpression
            .getProperties()
            .some((property: any) =>
                property.asKind(SyntaxKind.PropertyAssignment)?.getNameNode().getText().replace(/^["']|["']$/g, "") === name,
            );

    if (newConfig.theme?.extend) {
        const themeObj = getOrCreateObjectProperty(objectLiteral, "theme");
        if (themeObj) {
            const extendObj = getOrCreateObjectProperty(themeObj, "extend");
            if (extendObj) {
                // Merge animations
                const animations = newConfig.theme.extend.animation;
                if (isObjectRecord(animations)) {
                    const animObj = getOrCreateObjectProperty(extendObj, "animation");
                    if (animObj) {
                        for (const [key, value] of Object.entries(animations)) {
                            if (!SAFE_TAILWIND_TOKEN_REGEX.test(key)) {
                                continue;
                            }
                            if (typeof value !== "string") {
                                continue;
                            }
                            if (!hasProperty(animObj, key)) {
                                animObj.addPropertyAssignment({
                                    name: JSON.stringify(key),
                                    initializer: JSON.stringify(value),
                                });
                            }
                        }
                    }
                }

                // Merge keyframes
                const keyframes = newConfig.theme.extend.keyframes;
                if (isObjectRecord(keyframes)) {
                    const keyframesObj = getOrCreateObjectProperty(extendObj, "keyframes");
                    if (keyframesObj) {
                        for (const [key, value] of Object.entries(keyframes)) {
                            if (!SAFE_TAILWIND_TOKEN_REGEX.test(key)) {
                                continue;
                            }
                            if (!isObjectRecord(value)) {
                                continue;
                            }
                            if (!hasProperty(keyframesObj, key)) {
                                keyframesObj.addPropertyAssignment({
                                    name: JSON.stringify(key),
                                    initializer: JSON.stringify(value),
                                });
                            }
                        }
                    }
                }
            }
        }
    }

    await sourceFile.save();
    console.log(chalk.green("Tailwind config updated successfully."));
}
