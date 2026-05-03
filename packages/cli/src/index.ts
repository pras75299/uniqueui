#!/usr/bin/env node
import { Command } from "commander";
import { readFileSync } from "fs";
import { join } from "path";
import { init } from "./commands/init";
import { add } from "./commands/add";

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
    .action(add);

program.parse();
