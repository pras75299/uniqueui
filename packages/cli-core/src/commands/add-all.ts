import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { add, warnIfUntrustedRegistry } from "./add";
import { loadRegistryEntries } from "./list";

export async function addAll(options: {
    url: string;
    cwd?: string;
    yes?: boolean;
    force?: boolean;
    dryRun?: boolean;
}) {
    const cwd = options.cwd ?? process.cwd();

    warnIfUntrustedRegistry(options.url);

    // Gate: components/ui must be empty unless --force or --dry-run
    if (!options.force && !options.dryRun) {
        const configPath = path.join(cwd, "components.json");
        if (await fs.pathExists(configPath)) {
            let config: Record<string, unknown>;
            try {
                config = (await fs.readJson(configPath)) as Record<string, unknown>;
            } catch {
                config = {};
            }
            const targetDir =
                (config?.paths as Record<string, string> | undefined)?.components ?? "components/ui";
            const absDir = path.resolve(cwd, targetDir);
            if (await fs.pathExists(absDir)) {
                const entries = await fs.readdir(absDir);
                const existing = entries.filter((e) => e.endsWith(".tsx") || e.endsWith(".ts"));
                if (existing.length > 0) {
                    console.error(
                        chalk.red(
                            `\n${targetDir}/ already has ${existing.length} file(s). ` +
                                "`add --all` is designed for greenfield installs.",
                        ),
                    );
                    console.error(
                        chalk.gray(
                            "  Re-run with --force to install anyway (existing files will not be overwritten unless --force is also passed to the inner add).",
                        ),
                    );
                    process.exitCode = 1;
                    return;
                }
            }
        }
    }

    const entries = await loadRegistryEntries(options.url);
    if (!entries || entries.length === 0) {
        console.error(chalk.red(`No components found at ${options.url}.`));
        process.exitCode = 1;
        return;
    }

    // Exclude hero blocks from --all (they're full-page sections, not drop-in components)
    const components = entries.filter((e) => !e.name.startsWith("hero-"));

    console.log(chalk.bold(`\nInstalling all ${components.length} components from ${options.url}`));
    if (options.dryRun) console.log(chalk.yellow("  (dry run — no files will be written)"));
    console.log();

    let ok = 0;
    let failed = 0;

    for (const entry of components) {
        process.stdout.write(chalk.gray(`  ${entry.name.padEnd(40)}`));
        try {
            // Temporarily intercept process.exit so a per-component failure
            // (e.g. registry fetch error) becomes a thrown Error rather than
            // terminating the whole process — we want to continue to the next
            // component and report a summary at the end.
            const originalExit = process.exit.bind(process);
            let exitIntercepted = false;
            (process as NodeJS.Process).exit = ((code?: number | string) => {
                exitIntercepted = true;
                throw new Error(
                    `add exited with code ${code ?? 0}`,
                );
            }) as typeof process.exit;

            try {
                await add(entry.name, {
                    url: options.url,
                    yes: options.yes,
                    dryRun: options.dryRun,
                    force: options.force,
                });
            } finally {
                (process as NodeJS.Process).exit = originalExit;
                void exitIntercepted; // used only to suppress TS unused-var warning
            }

            process.stdout.write(chalk.green("✓\n"));
            ok++;
        } catch (err) {
            process.stdout.write(chalk.red(`✗ ${(err as Error).message}\n`));
            failed++;
        }
    }

    console.log();
    if (failed > 0) {
        console.error(chalk.red(`${failed} failed, ${ok} installed.`));
        process.exitCode = 1;
    } else {
        console.log(chalk.green(`All ${ok} components installed successfully.`));
    }
}
