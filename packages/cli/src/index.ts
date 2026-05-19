#!/usr/bin/env node
import { Command } from "commander";
import { readFileSync } from "fs";
import { join } from "path";
import { init } from "./commands/init";
import { add } from "./commands/add";
import { list } from "./commands/list";
import { info } from "./commands/info";
import { doctor } from "./commands/doctor";
import { search } from "./commands/search";

const pkg = JSON.parse(readFileSync(join(__dirname, "../package.json"), "utf-8"));

const program = new Command();

program
    .name("uniqueui")
    .description("Add components from UniqueUI to your project")
    .version(pkg.version);

program
    .command("init")
    .description("Configure your project for UniqueUI")
    .option("-y, --yes", "Skip prompts and use defaults")
    .option("--dir <path>", "Components install directory")
    .option("--typescript", "Use TypeScript", true)
    .option("--no-typescript", "Generate JavaScript config instead of TypeScript")
    .action((opts) => init({ yes: opts.yes, dir: opts.dir, typescript: opts.typescript }));

program
    .command("add")
    .description("Add a component to your project")
    .argument("<component>", "the component to add")
    .option("--url <url>", "the base URL of the registry", "https://uniqueui-platform.vercel.app")
    .option("-y, --yes", "Skip dependency install confirmation prompt")
    .option("--dry-run", "Show what would be written and installed without modifying anything")
    .option("--force", "Overwrite existing component files without prompting")
    .action((componentName, opts) =>
        add(componentName, {
            url: opts.url,
            yes: opts.yes,
            dryRun: opts.dryRun,
            force: opts.force,
        }),
    );

program
    .command("list")
    .description("List components available in the registry")
    .option("--url <url>", "the base URL of the registry", "https://uniqueui-platform.vercel.app")
    .action((opts) => list({ url: opts.url }));

program
    .command("info")
    .description("Show metadata for a registry component")
    .argument("<component>", "the component slug")
    .option("--url <url>", "the base URL of the registry", "https://uniqueui-platform.vercel.app")
    .action((componentName, opts) => info(componentName, { url: opts.url }));

program
    .command("doctor")
    .description("Diagnose your project's setup for UniqueUI (Node, Tailwind, components.json, aliases)")
    .action(() => doctor());

program
    .command("search")
    .description("Search registry components by name, title, or description")
    .argument("<query>", "search query")
    .option("--url <url>", "the base URL of the registry", "https://uniqueui-platform.vercel.app")
    .option("--limit <n>", "max results to show (default 20)", (v) => Number.parseInt(v, 10))
    .action((query, opts) => search(query, { url: opts.url, limit: opts.limit }));

program.parse();
