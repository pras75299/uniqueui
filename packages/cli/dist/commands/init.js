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
            css: "app/globals.css", // simplifying assumption or could ask
            baseColor: "slate",
            cssVariables: true,
        },
        aliases: {
            components: "@/components",
            utils: "@/lib/utils",
        },
        paths: {
            components: response.componentsDir,
            lib: "lib" // simplifying
        }
    };
    await fs_1.promises.writeFile(path_1.default.join(cwd, "components.json"), JSON.stringify(config, null, 2));
    console.log(chalk_1.default.green("Configuration saved to components.json"));
}
