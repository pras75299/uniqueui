#!/usr/bin/env node
// Verify every Commander command in `uniqueui-cli` has a documented section
// in packages/cli/README.md and vice versa. Strict: fails on any mismatch.
//
// Why: the CLI README is hand-maintained, so commands ship without docs (or
// docs persist after a command is removed). Both states erode user trust on
// the npm page. This script makes drift CI-fatal.
//
// What it checks
//   1. Run `uniqueui --help` (built CLI). Parse the `Commands:` block.
//   2. For every command, recursively run `<cmd> --help` to discover
//      subcommands (e.g. `registry validate`, `registry build`).
//   3. Parse `## Commands` in packages/cli/README.md and collect every
//      `### \`<name> ...\`` heading (the leading bare words inside the
//      backticks; `<args>` and `[options]` tokens stop the name).
//   4. Diff. Missing-from-README → fail. Stale-in-README → fail.
//
// What it does NOT check
//   - Per-flag accuracy (would bikeshed on phrasing).
//   - Description wording.
//   - Order of headings.
//
// Skipped commands: Commander's built-in `help`, command aliases.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const DEFAULT_CLI_BIN = path.join(REPO_ROOT, "packages/cli/dist/index.js");
const DEFAULT_README = path.join(REPO_ROOT, "packages/cli/README.md");

/**
 * Extract command names from a Commander `--help` output.
 *
 * The `Commands:` section formats each entry as
 *   `  <name>[|<alias>] [<args>...]  <description>`
 * with the description starting after two or more spaces, possibly wrapping
 * across continuation lines that are indented further. We take the first
 * token on each non-continuation line, drop any `|alias` suffix, and skip
 * Commander's built-in `help`.
 */
export function parseHelpCommands(help) {
    const lines = help.split(/\r?\n/);
    const start = lines.findIndex((l) => /^Commands:\s*$/.test(l));
    if (start === -1) return [];
    const out = [];
    for (let i = start + 1; i < lines.length; i++) {
        const line = lines[i];
        if (/^\s*$/.test(line)) break;
        // Top-level entries are indented exactly two spaces; continuation
        // (description wrap) lines are indented further. Tightly coupled to
        // Commander's default help layout — if `commander` ever changes the
        // indent on a major bump, this returns [] and the diff step reports
        // every README entry as stale. Update the regex and the test snapshot
        // together if that happens.
        const m = /^ {2}(\S.*)$/.exec(line);
        if (!m) continue;
        const head = m[1];
        // The name token ends at the first whitespace, `|alias`, `[opt`, or `<arg>`.
        const nameMatch = /^([^\s|[<]+)/.exec(head);
        if (!nameMatch) continue;
        const name = nameMatch[1];
        if (name === "help") continue;
        out.push(name);
    }
    return out;
}

/**
 * Pull command names out of `## Commands` in the README. Returns the leading
 * bare words inside each `### \`...\`` heading (so `### \`add <component>\``
 * yields `add`, and `### \`registry validate\`` yields `registry validate`).
 */
export function parseReadmeCommands(md, sectionHeading = "## Commands") {
    const lines = md.split(/\r?\n/);
    const start = lines.findIndex((l) => l.trim() === sectionHeading);
    if (start === -1) return [];
    const out = [];
    for (let i = start + 1; i < lines.length; i++) {
        const line = lines[i];
        // Stop at the next h2 so we only pick up command headings.
        if (/^## /.test(line)) break;
        const m = /^###\s+`([^`]+)`/.exec(line);
        if (!m) continue;
        const inside = m[1].trim();
        const tokens = inside.split(/\s+/);
        const bare = [];
        for (const t of tokens) {
            if (t.startsWith("<") || t.startsWith("[")) break;
            bare.push(t);
        }
        if (bare.length === 0) continue;
        out.push(bare.join(" "));
    }
    return out;
}

/**
 * Detect whether a `--help` output describes a command that takes its own
 * positional arguments. We key off Commander's `Arguments:` block, which
 * appears only when the command has real `.argument()` calls. Using the
 * `Usage:` line instead would false-positive on pure command groups whose
 * usage reads `<group> [options] [command]` — `[command]` is Commander's
 * placeholder for "a subcommand goes here", not a real argument.
 *
 * Used so a hybrid command (own action + subcommands) gets documented as both
 * the bare form AND each subcommand, rather than silently dropping the bare
 * form.
 */
export function helpDescribesActionableCommand(help) {
    return /(^|\n)Arguments:\s*\n/.test(help);
}

/**
 * Compute the full CLI command surface, recursing one level into command
 * groups (`registry → registry validate`, `registry build`). Pure: takes a
 * `runHelp(args[])` function so tests can stub the spawn.
 *
 * For a command that is BOTH a group and an actionable command (has own
 * `.argument()`), we emit the parent name AND every subcommand — both forms
 * need README coverage.
 */
export function collectCliCommands(runHelp) {
    const top = parseHelpCommands(runHelp([]));
    const out = [];
    for (const cmd of top) {
        const help = runHelp([cmd]);
        const sub = parseHelpCommands(help);
        if (sub.length === 0) {
            out.push(cmd);
        } else {
            if (helpDescribesActionableCommand(help)) out.push(cmd);
            for (const s of sub) out.push(`${cmd} ${s}`);
        }
    }
    return out;
}

/**
 * Return the set difference both ways. Stable order, deduped.
 */
export function diffCommandSets(cli, readme) {
    const cliSet = new Set(cli);
    const readmeSet = new Set(readme);
    const missingFromReadme = cli.filter((c, i) => cli.indexOf(c) === i && !readmeSet.has(c));
    const stale = readme.filter((c, i) => readme.indexOf(c) === i && !cliSet.has(c));
    return { missingFromReadme, stale };
}

function main() {
    const cliBin = process.env.UNIQUEUI_CLI_BIN ?? DEFAULT_CLI_BIN;
    const readme = process.env.UNIQUEUI_CLI_README ?? DEFAULT_README;

    if (!fs.existsSync(cliBin)) {
        console.error(
            `ERROR: CLI not built — expected ${cliBin}. Run \`pnpm --dir packages/cli build\` first.`,
        );
        process.exit(2);
    }
    if (!fs.existsSync(readme)) {
        console.error(`ERROR: README not found at ${readme}.`);
        process.exit(2);
    }

    const runHelp = (args) =>
        execFileSync(process.execPath, [cliBin, ...args, "--help"], {
            encoding: "utf8",
            stdio: ["ignore", "pipe", "pipe"],
        });

    const cliCommands = collectCliCommands(runHelp);
    const readmeCommands = parseReadmeCommands(fs.readFileSync(readme, "utf8"));
    const { missingFromReadme, stale } = diffCommandSets(cliCommands, readmeCommands);

    if (missingFromReadme.length === 0 && stale.length === 0) {
        console.log(
            `CLI/README drift check OK — ${cliCommands.length} command(s) documented.`,
        );
        return;
    }

    console.error("CLI / README drift detected:\n");
    if (missingFromReadme.length > 0) {
        console.error(`  Missing from packages/cli/README.md (${missingFromReadme.length}):`);
        for (const c of missingFromReadme) console.error(`    ✗ ${c}`);
        console.error("    → Add a `### \\`<name>\\`` section under `## Commands`.");
    }
    if (stale.length > 0) {
        if (missingFromReadme.length > 0) console.error("");
        console.error(`  Stale README entries (no matching CLI command, ${stale.length}):`);
        for (const c of stale) console.error(`    ✗ ${c}`);
        console.error("    → Remove the section or rename it to match the CLI.");
    }
    process.exit(1);
}

// Run only when invoked directly, not on import. On Windows, argv[1] and
// fileURLToPath may differ by drive-letter case; normalize both before
// comparing so `node scripts\check-cli-readme-drift.mjs` still runs main().
function sameFile(a, b) {
    if (!a || !b) return false;
    const norm = (p) => path.resolve(p).toLowerCase();
    return norm(a) === norm(b);
}

if (sameFile(process.argv[1], __filename)) {
    main();
}
