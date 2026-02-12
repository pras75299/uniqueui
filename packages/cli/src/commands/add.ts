
import { Command } from "commander";
import fetch from "node-fetch";
import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import { Project, SyntaxKind, QuoteKind } from "ts-morph";
import { execSync } from "child_process";

// Type definition for Registry (matching what we built)
type RegistryItem = {
    name: string;
    dependencies: string[];
    files: Array<{ path: string; type: string; content: string }>;
    tailwindConfig?: Record<string, any>;
};

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
    let registry: RegistryItem[];
    const FALLBACK_URL = "https://raw.githubusercontent.com/pras75299/uniqueui/main";

    async function fetchRegistryFromUrl(baseUrl: string): Promise<RegistryItem[] | null> {
        try {
            const registryUrl = baseUrl.endsWith('.json') ? baseUrl : `${baseUrl}/registry.json`;
            const res = await fetch(registryUrl);
            if (!res.ok) return null;
            return await res.json() as RegistryItem[];
        } catch {
            return null;
        }
    }

    try {
        // For local testing, if url is a file path, read it
        if (options.url.startsWith(".")) {
            registry = await fs.readJson(options.url);
        } else {
            // Try primary URL first
            let result = await fetchRegistryFromUrl(options.url);

            // Try /api/registry endpoint as alternative
            if (!result) {
                console.log(chalk.yellow(`Could not fetch from ${options.url}/registry.json, trying API endpoint...`));
                result = await fetchRegistryFromUrl(`${options.url}/api/registry`);
            }

            // Try fallback GitHub raw URL
            if (!result && options.url !== FALLBACK_URL) {
                console.log(chalk.yellow(`Trying fallback URL: ${FALLBACK_URL}...`));
                result = await fetchRegistryFromUrl(FALLBACK_URL);
            }

            if (!result) {
                throw new Error(
                    `Failed to fetch registry from ${options.url}.\n` +
                    `  Make sure the registry URL is accessible.\n` +
                    `  You can specify a custom URL with: uniqueui add <component> --url <url>`
                );
            }
            registry = result;
        }
    } catch (e) {
        console.error(chalk.red("Could not fetch registry.json"), e);
        process.exit(1);
    }

    const item = registry.find((c) => c.name === componentName);
    if (!item) {
        console.error(chalk.red(`Component ${componentName} not found.`));
        process.exit(1);
    }

    // 3. Install dependencies
    if (item.dependencies.length) {
        console.log(chalk.cyan(`Installing dependencies: ${item.dependencies.join(", ")}`));
        try {
            // Detect package manager - simplified
            const pm = fs.existsSync("pnpm-lock.yaml") ? "pnpm" : fs.existsSync("yarn.lock") ? "yarn" : "npm";
            const cmd = pm === "npm" ? "install" : "add"; // yarn add, pnpm add
            execSync(`${pm} ${cmd} ${item.dependencies.join(" ")}`, { stdio: "inherit" });
        } catch (e) {
            console.warn(chalk.yellow("Failed to install dependencies automatically. Please install them manually."));
        }
    }

    // 4. Update Tailwind Config
    if (item.tailwindConfig) {
        console.log(chalk.cyan("Updating tailwind.config..."));
        await updateTailwindConfig(config.tailwind.config, item.tailwindConfig);
    }

    // 5. Write Files
    const targetDir = path.resolve(config.paths.components || "components/ui");
    await fs.ensureDir(targetDir);

    for (const file of item.files) {
        // We only handle ui components for now
        if (file.type === "registry:ui") {
            const fileName = path.basename(file.path);
            const targetPath = path.join(targetDir, fileName);
            await fs.writeFile(targetPath, file.content);
            console.log(chalk.green(`Created ${fileName}`));
        }
        // Handle utils if needed, or other types
    }
}

async function updateTailwindConfig(configPath: string, newConfig: any) {
    const project = new Project({
        manipulationSettings: {
            quoteKind: QuoteKind.Double,
        }
    });

    // Attempt to add the file
    const sourceFile = project.addSourceFileAtPath(configPath);

    // Simplistic handling: look for export default or module.exports
    // We expect the config to be an object literal.

    // We need to merge `newConfig.theme.extend` into the existing config.
    // logic: find 'theme' property -> find 'extend' property -> merge properties.

    const exportAssignment = sourceFile.getExportAssignment((e) => !e.isExportEquals()); // export default
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

    if (newConfig.theme?.extend) {
        const themeObj = getOrCreateObjectProperty(objectLiteral, "theme");
        if (themeObj) {
            const extendObj = getOrCreateObjectProperty(themeObj, "extend");
            if (extendObj) {
                // Merge animations
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

                // Merge keyframes
                const keyframes = newConfig.theme.extend.keyframes;
                if (keyframes) {
                    const keyframesObj = getOrCreateObjectProperty(extendObj, "keyframes");
                    if (keyframesObj) {
                        for (const [key, value] of Object.entries(keyframes)) {
                            if (!keyframesObj.getProperty(key)) {
                                // value is an object, strictly JSON stringify might be valid JS valid object literal needed?
                                // "JSON.stringify(value)" produces valid JSON which is valid JS object literal initializer if keys are quoted.
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
