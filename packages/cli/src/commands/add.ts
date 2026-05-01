
import { Command } from "commander";
import fetch from "node-fetch";
import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import { Project, SyntaxKind, QuoteKind } from "ts-morph";
import { spawnSync } from "child_process";
import { createInterface } from "readline/promises";
import { assertSafeNpmDependencies } from "../npm-dependency-name";

// Type definition for Registry (matching what we built)
type RegistryItem = {
    name: string;
    dependencies: string[];
    files: Array<{ path: string; type: string; content: string }>;
    tailwindConfig?: Record<string, any>;
};

type RegistryIndex = {
    components: string[];
};

type RegistryLookupResult =
    | { status: "found"; item: RegistryItem }
    | { status: "missing" }
    | { status: "unavailable" };

/** Reject malformed registry JSON before any property access (avoids throws from bad remote/local data). */
function validateRegistryPayload(data: unknown): RegistryItem[] | null {
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
        out.push({ name: o.name, dependencies, files, tailwindConfig });
    }
    return out;
}

function validateRegistryItemPayload(data: unknown): RegistryItem | null {
    const validated = validateRegistryPayload([data]);
    return validated?.[0] ?? null;
}

function validateRegistryIndexPayload(data: unknown): RegistryIndex | null {
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

function warnIfUntrustedRegistry(url: string) {
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

async function fetchJsonFromUrl(url: string): Promise<unknown | null> {
    let timeoutHandle: NodeJS.Timeout | undefined;
    try {
        const timeoutPromise = new Promise<never>((_, reject) => {
            timeoutHandle = setTimeout(() => reject(new Error("Request timed out")), FETCH_TIMEOUT_MS);
        });
        const res = (await Promise.race([fetch(url), timeoutPromise])) as Awaited<ReturnType<typeof fetch>>;
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
        if (typeof (res as { text?: () => Promise<string> }).text === "function") {
            const bodyText = await res.text();
            if (Buffer.byteLength(bodyText, "utf8") > MAX_REGISTRY_RESPONSE_BYTES) {
                throw new Error(`Registry response exceeds ${MAX_REGISTRY_RESPONSE_BYTES} bytes`);
            }
            return JSON.parse(bodyText);
        }
        if (typeof (res as { json?: () => Promise<unknown> }).json === "function") {
            const body = await res.json();
            if (Buffer.byteLength(JSON.stringify(body), "utf8") > MAX_REGISTRY_RESPONSE_BYTES) {
                throw new Error(`Registry response exceeds ${MAX_REGISTRY_RESPONSE_BYTES} bytes`);
            }
            return body;
        }
        throw new Error("Registry response body is unreadable");
    } catch (error) {
        console.error(chalk.yellow(`\nWarning: Failed to fetch from ${url}:`), error);
        return null;
    } finally {
        if (timeoutHandle) {
            clearTimeout(timeoutHandle);
        }
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

function getLegacyApiCandidates(basePath: string): string[] {
    if (basePath.endsWith("/registry/index.json")) {
        const registryDir = basePath.slice(0, -"/index.json".length);
        return [path.join(registryDir, "api/registry"), path.join(getLegacyRegistryBase(basePath), "api/registry")];
    }

    if (basePath.endsWith("/registry")) {
        return [path.join(basePath, "api/registry"), path.join(getLegacyRegistryBase(basePath), "api/registry")];
    }

    return [path.join(getLegacyRegistryBase(basePath), "api/registry")];
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

function isLocalRegistrySource(source: string): boolean {
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

export async function add(componentName: string, options: { url: string; yes?: boolean }) {
    console.log(`Fetching ${componentName} from ${options.url}...`);
    warnIfUntrustedRegistry(options.url);

    // 1. Load config
    let config;
    try {
        config = await fs.readJson("components.json");
    } catch (e) {
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
                const pm = fs.existsSync("pnpm-lock.yaml") ? "pnpm" : fs.existsSync("yarn.lock") ? "yarn" : "npm";
                const args = pm === "npm" ? ["install", ...item.dependencies] : ["add", ...item.dependencies];
                const result = spawnSync(pm, args, { stdio: "inherit", shell: false, env: process.env });
                if (result.error) throw result.error;
                if (result.signal) {
                    throw new Error(`package manager terminated by signal ${result.signal}`);
                }
                if (result.status !== 0) {
                    throw new Error(`package manager exited with code ${result.status}`);
                }
            } catch (e) {
                console.warn(chalk.yellow("Failed to install dependencies automatically. Please install them manually."));
            }
        }
    }

    // 4. Update Tailwind Config
    if (item.tailwindConfig) {
        console.log(chalk.cyan("Updating tailwind.config..."));
        await updateTailwindConfig(config.tailwind.config, item.tailwindConfig);
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
            await fs.writeFile(targetPath, file.content);
            console.log(chalk.green(`Created ${fileName}`));
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

            // Only create util if it doesn't exist
            if (!fs.existsSync(targetPath)) {
                await fs.writeFile(targetPath, file.content);
                console.log(chalk.green(`Created ${fileName}`));
            }
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
