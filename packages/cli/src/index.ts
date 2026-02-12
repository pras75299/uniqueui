#!/usr/bin/env node
import { Command } from "commander";
import { init } from "./commands/init";
import { add } from "./commands/add";

const program = new Command();

program
    .name("uniqueui")
    .description("Add components from UniqueUI to your project")
    .version("0.1.1");

program
    .command("init")
    .description("Configure your project for UniqueUI")
    .action(init);

program
    .command("add")
    .description("Add a component to your project")
    .argument("<component>", "the component to add")
    .option("--url <url>", "the base URL of the registry", "https://raw.githubusercontent.com/pras75299/uniqueui/main")
    .action(add);

program.parse();
