
import { promises as fs } from "fs";
import path from "path";
import prompts from "prompts";
import chalk from "chalk";

export async function init() {
    console.log(chalk.bold.green("Initializing UniqueUI..."));

    const cwd = process.cwd();

    const response = await prompts([
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

    await fs.writeFile(
        path.join(cwd, "components.json"),
        JSON.stringify(config, null, 2)
    );

    // Create utils/cn.ts if it doesn't exist
    const utilsDir = path.join(cwd, "utils");
    const cnPath = path.join(utilsDir, "cn.ts");

    const cnContent = `import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}`;

    if (!(await fs.stat(utilsDir).catch(() => null))) {
        await fs.mkdir(utilsDir, { recursive: true });
    }

    if (!(await fs.stat(cnPath).catch(() => null))) {
        await fs.writeFile(cnPath, cnContent);
        console.log(chalk.green("Created utils/cn.ts"));
    }

    console.log(chalk.green("Configuration saved to components.json"));
}
