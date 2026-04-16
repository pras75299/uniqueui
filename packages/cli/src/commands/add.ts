
import { Command } from "commander";
import fetch from "node-fetch";
import path from "path";
import os from "os";
import fs from "fs-extra";
import chalk from "chalk";
import { Project, SyntaxKind, QuoteKind } from "ts-morph";
import { spawnSync } from "child_process";

// Type definition for Registry (matching what we built)
type RegistryItem = {
    name: string;
    dependencies: string[];
    files: Array<{ path: string; type: string; content: string }>;
    tailwindConfig?: Record<string, any>;
};

type RegistryCache = {
    timestamp: number;
    data: RegistryItem[];
};

const CACHE_PATH = path.join(os.homedir(), ".uniqueui", "registry-cache.json");
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function add(componentName: string, options: { url: string }) {
    console.log(`Fetching ${componentName} from ${options.url}...`);

    // 1. Load config
    let config;
    try {
        config = await fs.readJson("components.json");
    } catch (e) {
        console.error(chalk.red("components.json not found. Run 'init' first."));
        process.exit(1);
    }

    // 2. Fetch registry
    const FALLBACK_URL = "https://raw.githubusercontent.com/pras75299/uniqueui/main";

    // --- Per-component split fetch (fast path: ~3 KB instead of 304 KB) ---
    async function fetchComponentFromSplit(baseUrl: string, slug: string): Promise<RegistryItem | null> {
        try {
            const indexRes = await fetch(`${baseUrl}/registry/index.json`);
            if (!indexRes.ok) return null;
            const index = await indexRes.json() as { components: string[] };
            if (!Array.isArray(index.components) || !index.components.includes(slug)) return null;

            const componentRes = await fetch(`${baseUrl}/registry/${slug}.json`);
            if (!componentRes.ok) return null;
            return await componentRes.json() as RegistryItem;
        } catch {
            return null;
        }
    }

    // --- Monolith fetch (fallback) ---
    async function fetchRegistryFromUrl(baseUrl: string): Promise<RegistryItem[] | null> {
        try {
            const registryUrl = baseUrl.endsWith('.json') ? baseUrl : `${baseUrl}/registry.json`;
            const res = await fetch(registryUrl);
            if (!res.ok) return null;
            return await res.json() as RegistryItem[];
        } catch (error) {
            console.error(chalk.yellow(`\nWarning: Failed to fetch from ${baseUrl}:`), error);
            return null;
        }
    }

    // --- Cache helpers ---
    async function readCache(): Promise<RegistryItem[] | null> {
        try {
            const cache = await fs.readJson(CACHE_PATH) as RegistryCache;
            if (Date.now() - cache.timestamp < CACHE_TTL_MS) {
                return cache.data;
            }
        } catch {
            // Cache miss or corrupt — proceed to fetch
        }
        return null;
    }

    async function writeCache(data: RegistryItem[]): Promise<void> {
        try {
            await fs.ensureDir(path.dirname(CACHE_PATH));
            await fs.writeJson(CACHE_PATH, { timestamp: Date.now(), data } as RegistryCache);
        } catch {
            // Cache write failure is non-fatal
        }
    }

    let item: RegistryItem | undefined;

    try {
        if (options.url.startsWith(".")) {
            // Local file path — read directly, no cache
            const registry = await fs.readJson(options.url) as RegistryItem[];
            item = registry.find((c) => c.name === componentName);
        } else {
            // 1. Try split per-component fetch (fast path)
            const splitResult = await fetchComponentFromSplit(options.url, componentName);
            if (splitResult) {
                item = splitResult;
            } else {
                // 2. Fall back to monolith — check cache first
                let registry = await readCache();

                if (!registry) {
                    // Cache miss — fetch monolith
                    registry = await fetchRegistryFromUrl(options.url);

                    // Try /api/registry endpoint
                    if (!registry) {
                        console.log(chalk.yellow(`Trying API endpoint...`));
                        registry = await fetchRegistryFromUrl(`${options.url}/api/registry`);
                    }

                    // Try GitHub raw fallback
                    if (!registry && options.url !== FALLBACK_URL) {
                        console.log(chalk.yellow(`Trying fallback URL: ${FALLBACK_URL}...`));
                        registry = await fetchRegistryFromUrl(FALLBACK_URL);
                    }

                    if (!registry) {
                        throw new Error(
                            `Failed to fetch registry from ${options.url}.\n` +
                            `  Make sure the registry URL is accessible.\n` +
                            `  You can specify a custom URL with: uniqueui add <component> --url <url>`
                        );
                    }

                    await writeCache(registry);
                }

                item = registry.find((c) => c.name === componentName);
            }
        }
    } catch (e) {
        console.error(chalk.red("Could not fetch registry"), e);
        process.exit(1);
    }

    if (!item) {
        console.error(chalk.red(`Component ${componentName} not found.`));
        process.exit(1);
    }

    // 3. Install dependencies
    if (item.dependencies.length) {
        console.log(chalk.cyan(`Installing dependencies: ${item.dependencies.join(", ")}`));
        // Use spawnSync with shell: false to prevent shell injection
        const pm = fs.existsSync("pnpm-lock.yaml") ? "pnpm" : fs.existsSync("yarn.lock") ? "yarn" : "npm";
        const cmd = pm === "npm" ? "install" : "add";
        const result = spawnSync(pm, [cmd, ...item.dependencies], {
            stdio: "inherit",
            shell: false,
        });
        if (result.status !== 0) {
            console.warn(chalk.yellow("Failed to install dependencies automatically. Please install them manually."));
        }
    }

    // 4. Update Tailwind Config
    if (item.tailwindConfig) {
        console.log(chalk.cyan("Updating tailwind.config..."));
        await updateTailwindConfig(config.tailwind.config, item.tailwindConfig);
    }

    // 5. Write Files
    for (const file of item.files) {
        if (file.type === "registry:ui") {
            const targetDir = path.resolve(config.paths.components || "components/ui");
            await fs.ensureDir(targetDir);
            const fileName = path.basename(file.path);
            const targetPath = path.join(targetDir, fileName);
            await fs.writeFile(targetPath, file.content);
            console.log(chalk.green(`Created ${fileName}`));
        } else if (file.type === "registry:util") {
            const targetDir = path.resolve(config.paths.lib || "utils");
            await fs.ensureDir(targetDir);
            const fileName = path.basename(file.path);
            const targetPath = path.join(targetDir, fileName);

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

    let sourceFile;
    try {
        sourceFile = project.addSourceFileAtPath(finalConfigPath);
    } catch (e) {
        console.error(chalk.yellow(`Failed to parse tailwind config at ${finalConfigPath}. Skipping update.`), e);
        return;
    }

    const exportAssignment = sourceFile.getExportAssignment((e) => !e.isExportEquals());
    let objectLiteral;

    if (exportAssignment) {
        objectLiteral = exportAssignment.getExpression().asKind(SyntaxKind.ObjectLiteralExpression);
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

    const getOrCreateObjectProperty = (parentObj: any, name: string) => {
        let prop = parentObj.getProperty(name);
        if (!prop) {
            parentObj.addPropertyAssignment({ name, initializer: "{}" });
            prop = parentObj.getProperty(name);
        }
        const init = prop?.asKind(SyntaxKind.PropertyAssignment)?.getInitializer();
        return init?.asKind(SyntaxKind.ObjectLiteralExpression);
    };

    if (newConfig.theme?.extend) {
        const themeObj = getOrCreateObjectProperty(objectLiteral, "theme");
        if (themeObj) {
            const extendObj = getOrCreateObjectProperty(themeObj, "extend");
            if (extendObj) {
                const animations = newConfig.theme.extend.animation;
                if (animations) {
                    const animObj = getOrCreateObjectProperty(extendObj, "animation");
                    if (animObj) {
                        for (const [key, value] of Object.entries(animations)) {
                            if (!animObj.getProperty(key)) {
                                animObj.addPropertyAssignment({ name: `"${key}"`, initializer: `"${value}"` });
                            }
                        }
                    }
                }

                const keyframes = newConfig.theme.extend.keyframes;
                if (keyframes) {
                    const keyframesObj = getOrCreateObjectProperty(extendObj, "keyframes");
                    if (keyframesObj) {
                        for (const [key, value] of Object.entries(keyframes)) {
                            if (!keyframesObj.getProperty(key)) {
                                keyframesObj.addPropertyAssignment({ name: `"${key}"`, initializer: JSON.stringify(value) });
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
