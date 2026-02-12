"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = init;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const prompts_1 = __importDefault(require("prompts"));
const chalk_1 = __importDefault(require("chalk"));
async function init() {
    console.log(chalk_1.default.bold.green("Initializing UniqueUI..."));
    const cwd = process.cwd();
    const response = await (0, prompts_1.default)([
        {
            type: "text",
            name: "componentsDir",
            message: "Where would you like to install components?",
            initial: "components/ui",
        },
        {
            type: "toggle",
            name: "typescript",
            message: "Are you using TypeScript?",
            initial: true,
            active: "yes",
            inactive: "no",
        },
        {
            type: "text",
            name: "tailwindConfig",
            message: "Where is your tailwind.config.js located?",
            initial: "tailwind.config.ts",
        },
    ]);
    const config = {
        $schema: "https://uniqueui.com/schema.json",
        style: "default",
        rsc: true,
        tsx: response.typescript,
        tailwind: {
            config: response.tailwindConfig,
            css: "app/globals.css",
            baseColor: "slate",
            cssVariables: true,
        },
        aliases: {
            components: "@/components",
            utils: "@/utils",
        },
        paths: {
            components: response.componentsDir,
            lib: "utils"
        }
    };
    await fs_1.promises.writeFile(path_1.default.join(cwd, "components.json"), JSON.stringify(config, null, 2));
    // Create utils/cn.ts if it doesn't exist
    const utilsDir = path_1.default.join(cwd, "utils");
    const cnPath = path_1.default.join(utilsDir, "cn.ts");
    const cnContent = `import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}`;
    if (!(await fs_1.promises.stat(utilsDir).catch(() => null))) {
        await fs_1.promises.mkdir(utilsDir, { recursive: true });
    }
    if (!(await fs_1.promises.stat(cnPath).catch(() => null))) {
        await fs_1.promises.writeFile(cnPath, cnContent);
        console.log(chalk_1.default.green("Created utils/cn.ts"));
    }
    console.log(chalk_1.default.green("Configuration saved to components.json"));
}
