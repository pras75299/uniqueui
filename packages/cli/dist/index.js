#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const init_1 = require("./commands/init");
const add_1 = require("./commands/add");
const program = new commander_1.Command();
program
    .name("uniqueui")
    .description("Add components from UniqueUI to your project")
    .version("0.1.0");
program
    .command("init")
    .description("Configure your project for UniqueUI")
    .action(init_1.init);
program
    .command("add")
    .description("Add a component to your project")
    .argument("<component>", "the component to add")
    .option("--url <url>", "the base URL of the registry", "https://raw.githubusercontent.com/prashantkumarsingh/uniqueui/main")
    .action(add_1.add);
program.parse();
