import { describe, expect, it } from "vitest";

import {
    collectCliCommands,
    diffCommandSets,
    helpDescribesActionableCommand,
    parseHelpCommands,
    parseReadmeCommands,
} from "./check-cli-readme-drift.mjs";

describe("parseHelpCommands", () => {
    it("returns command names from a Commander --help block, dropping help and aliases", () => {
        const help = [
            "Usage: cli [options] [command]",
            "",
            "Options:",
            "  -h, --help  display help",
            "",
            "Commands:",
            "  init [options]                   Configure your project",
            "  add [options] [component]        Add a component to your project",
            "  remove|rm [options] <component>  Remove a previously-added component",
            "  registry                         Registry maintenance commands",
            "  help [command]                   display help for command",
            "",
        ].join("\n");

        expect(parseHelpCommands(help)).toEqual(["init", "add", "remove", "registry"]);
    });

    it("ignores wrapped description continuation lines", () => {
        const help = [
            "Commands:",
            "  doctor                           Diagnose your project's setup for UniqueUI",
            "                                   (Node, Tailwind, components.json, aliases)",
            "  search [options] <query>         Search registry components by name, title,",
            "                                   or description",
            "",
        ].join("\n");

        expect(parseHelpCommands(help)).toEqual(["doctor", "search"]);
    });

    it("returns an empty list when the Commands: block is absent", () => {
        expect(parseHelpCommands("no commands here")).toEqual([]);
    });
});

describe("parseReadmeCommands", () => {
    it("collects `### `name`` headings under `## Commands`", () => {
        const md = [
            "## Commands",
            "",
            "### `init`",
            "Body.",
            "",
            "### `add <component>`",
            "Body.",
            "",
            "### `registry validate`",
            "Body.",
            "",
            "## Next section",
            "### `not-a-command`",
        ].join("\n");

        expect(parseReadmeCommands(md)).toEqual(["init", "add", "registry validate"]);
    });

    it("stops at the next h2 so unrelated headings aren't pulled in", () => {
        const md = [
            "## Commands",
            "### `init`",
            "## Installing with the shadcn CLI",
            "### `list`", // intentionally outside Commands; should be missed
        ].join("\n");

        expect(parseReadmeCommands(md)).toEqual(["init"]);
    });

    it("ignores tokens that look like args or options", () => {
        const md = ["## Commands", "### `theme [options]`"].join("\n");
        expect(parseReadmeCommands(md)).toEqual(["theme"]);
    });

    it("returns empty when the Commands section is missing", () => {
        expect(parseReadmeCommands("# Title\n## Other\n### `init`")).toEqual([]);
    });
});

describe("helpDescribesActionableCommand", () => {
    it("returns true when an Arguments: block is present", () => {
        const help = [
            "Usage: cli add [options] <component>",
            "",
            "Arguments:",
            "  component   the component to add",
            "",
        ].join("\n");
        expect(helpDescribesActionableCommand(help)).toBe(true);
    });

    it("returns false for a pure command group (Usage shows [command] placeholder but no Arguments: block)", () => {
        const help = [
            "Usage: cli registry [options] [command]",
            "",
            "Options:",
            "  -h, --help  display help for command",
            "",
            "Commands:",
            "  validate [options]  Validate",
            "",
        ].join("\n");
        expect(helpDescribesActionableCommand(help)).toBe(false);
    });

    it("returns false when there is no Arguments: block", () => {
        expect(helpDescribesActionableCommand("Something else\n")).toBe(false);
    });
});

describe("collectCliCommands", () => {
    it("recurses one level into command groups", () => {
        const responses: Record<string, string> = {
            "": [
                "Commands:",
                "  add [options] [component]  Add",
                "  registry                   Registry maintenance commands",
                "  help                       help",
                "",
            ].join("\n"),
            add: [
                "Usage: cli add [options] [component]",
                "",
                "Arguments:",
                "  component  the component to add",
                "",
                "Commands:",
                "  help  help",
                "",
            ].join("\n"),
            registry: [
                "Usage: cli registry [options] [command]",
                "",
                "Commands:",
                "  validate [options]  Validate",
                "  build [options]     Build",
                "  help                help",
                "",
            ].join("\n"),
        };
        const runHelp = (args: string[]) => responses[args.join(" ")] ?? "";

        expect(collectCliCommands(runHelp)).toEqual([
            "add",
            "registry validate",
            "registry build",
        ]);
    });

    it("emits parent AND subcommands when the parent has its own positional args (hybrid command)", () => {
        // Hypothetical: `deploy <env>` with subcommand `deploy preview`.
        // README must document both forms.
        const responses: Record<string, string> = {
            "": [
                "Commands:",
                "  deploy [options] <env>  Deploy the project",
                "  help                    help",
                "",
            ].join("\n"),
            deploy: [
                "Usage: cli deploy [options] <env>",
                "",
                "Arguments:",
                "  env  target environment",
                "",
                "Commands:",
                "  preview [options]  Preview without committing",
                "  help               help",
                "",
            ].join("\n"),
        };
        const runHelp = (args: string[]) => responses[args.join(" ")] ?? "";

        expect(collectCliCommands(runHelp)).toEqual(["deploy", "deploy preview"]);
    });
});

describe("diffCommandSets", () => {
    it("returns commands missing from README and stale README entries", () => {
        const result = diffCommandSets(
            ["init", "add", "registry validate"],
            ["init", "add", "old-command"],
        );
        expect(result.missingFromReadme).toEqual(["registry validate"]);
        expect(result.stale).toEqual(["old-command"]);
    });

    it("returns empty arrays when the sets agree", () => {
        const result = diffCommandSets(["init", "add"], ["init", "add"]);
        expect(result.missingFromReadme).toEqual([]);
        expect(result.stale).toEqual([]);
    });
});
