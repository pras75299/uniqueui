"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.add = add;
const node_fetch_1 = __importDefault(require("node-fetch"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const chalk_1 = __importDefault(require("chalk"));
const ts_morph_1 = require("ts-morph");
const child_process_1 = require("child_process");
async function add(componentName, options) {
    console.log(`Fetching ${componentName} from ${options.url}...`);
    // 1. Load config
    let config;
    try {
        config = await fs_extra_1.default.readJson("components.json");
    }
    catch (e) {
        console.error(chalk_1.default.red("components.json not found. Run 'init' first."));
        process.exit(1);
    }
    // 2. Fetch registry
    let registry;
    const FALLBACK_URL = "https://raw.githubusercontent.com/pras75299/uniqueui/main";
    async function fetchRegistryFromUrl(baseUrl) {
        try {
            const registryUrl = baseUrl.endsWith('.json') ? baseUrl : `${baseUrl}/registry.json`;
            const res = await (0, node_fetch_1.default)(registryUrl);
            if (!res.ok)
                return null;
            return await res.json();
        }
        catch {
            return null;
        }
    }
    try {
        // For local testing, if url is a file path, read it
        if (options.url.startsWith(".")) {
            registry = await fs_extra_1.default.readJson(options.url);
        }
        else {
            // Try primary URL first
            let result = await fetchRegistryFromUrl(options.url);
            // Try /api/registry endpoint as alternative
            if (!result) {
                console.log(chalk_1.default.yellow(`Could not fetch from ${options.url}/registry.json, trying API endpoint...`));
                result = await fetchRegistryFromUrl(`${options.url}/api/registry`);
            }
            // Try fallback GitHub raw URL
            if (!result && options.url !== FALLBACK_URL) {
                console.log(chalk_1.default.yellow(`Trying fallback URL: ${FALLBACK_URL}...`));
                result = await fetchRegistryFromUrl(FALLBACK_URL);
            }
            if (!result) {
                throw new Error(`Failed to fetch registry from ${options.url}.\n` +
                    `  Make sure the registry URL is accessible.\n` +
                    `  You can specify a custom URL with: uniqueui add <component> --url <url>`);
            }
            registry = result;
        }
    }
    catch (e) {
        console.error(chalk_1.default.red("Could not fetch registry.json"), e);
        process.exit(1);
    }
    const item = registry.find((c) => c.name === componentName);
    if (!item) {
        console.error(chalk_1.default.red(`Component ${componentName} not found.`));
        process.exit(1);
    }
    // 3. Install dependencies
    if (item.dependencies.length) {
        console.log(chalk_1.default.cyan(`Installing dependencies: ${item.dependencies.join(", ")}`));
        try {
            // Detect package manager - simplified
            const pm = fs_extra_1.default.existsSync("pnpm-lock.yaml") ? "pnpm" : fs_extra_1.default.existsSync("yarn.lock") ? "yarn" : "npm";
            const cmd = pm === "npm" ? "install" : "add"; // yarn add, pnpm add
            (0, child_process_1.execSync)(`${pm} ${cmd} ${item.dependencies.join(" ")}`, { stdio: "inherit" });
        }
        catch (e) {
            console.warn(chalk_1.default.yellow("Failed to install dependencies automatically. Please install them manually."));
        }
    }
    // 4. Update Tailwind Config
    if (item.tailwindConfig) {
        console.log(chalk_1.default.cyan("Updating tailwind.config..."));
        await updateTailwindConfig(config.tailwind.config, item.tailwindConfig);
    }
    // 5. Write Files
    const targetDir = path_1.default.resolve(config.paths.components || "components/ui");
    await fs_extra_1.default.ensureDir(targetDir);
    for (const file of item.files) {
        // We only handle ui components for now
        if (file.type === "registry:ui") {
            const fileName = path_1.default.basename(file.path);
            const targetPath = path_1.default.join(targetDir, fileName);
            await fs_extra_1.default.writeFile(targetPath, file.content);
            console.log(chalk_1.default.green(`Created ${fileName}`));
        }
        // Handle utils if needed, or other types
    }
}
async function updateTailwindConfig(configPath, newConfig) {
    const project = new ts_morph_1.Project({
        manipulationSettings: {
            quoteKind: ts_morph_1.QuoteKind.Double,
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
        objectLiteral = exportAssignment.getExpression().asKind(ts_morph_1.SyntaxKind.ObjectLiteralExpression);
    }
    else {
        // try module.exports
        const stmt = sourceFile.getStatement((s) => {
            if (s.getKind() === ts_morph_1.SyntaxKind.ExpressionStatement) {
                const expr = s.asKind(ts_morph_1.SyntaxKind.ExpressionStatement)?.getExpression();
                if (expr && expr.getKind() === ts_morph_1.SyntaxKind.BinaryExpression) {
                    const binary = expr.asKind(ts_morph_1.SyntaxKind.BinaryExpression);
                    const left = binary?.getLeft();
                    if (left?.getText() === "module.exports")
                        return true;
                }
            }
            return false;
        });
        if (stmt) {
            const binary = stmt.asKind(ts_morph_1.SyntaxKind.ExpressionStatement).getExpression().asKind(ts_morph_1.SyntaxKind.BinaryExpression);
            objectLiteral = binary.getRight().asKind(ts_morph_1.SyntaxKind.ObjectLiteralExpression);
        }
    }
    if (!objectLiteral) {
        console.warn(chalk_1.default.yellow("Could not parse tailwind config object. Skipping update."));
        return;
    }
    // Heuristics:
    // newConfig is { theme: { extend: { animation: {...}, keyframes: {...} } } }
    // Helper to get or create property object
    const getOrCreateObjectProperty = (parentObj, name) => {
        let prop = parentObj.getProperty(name);
        if (!prop) {
            parentObj.addPropertyAssignment({ name, initializer: "{}" });
            prop = parentObj.getProperty(name);
        }
        const init = prop?.asKind(ts_morph_1.SyntaxKind.PropertyAssignment)?.getInitializer();
        return init?.asKind(ts_morph_1.SyntaxKind.ObjectLiteralExpression);
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
    console.log(chalk_1.default.green("Tailwind config updated successfully."));
}
