import chalk from "chalk";
import { add } from "./add";
import { computeDiff } from "./diff";

type UpdateOptions = {
    url: string;
    yes?: boolean;
    dryRun?: boolean;
    force?: boolean;
};

export async function update(slug: string, options: UpdateOptions): Promise<void> {
    const result = await computeDiff(slug, options.url);
    if (!result) {
        console.error(chalk.red("components.json not found. Run `uniqueui init` first."));
        process.exit(1);
    }
    if (result.notFound) {
        console.error(chalk.red(`Component "${slug}" not found in registry at ${options.url}.`));
        process.exit(1);
    }

    const allMissing = result.perFile.length > 0 && result.perFile.every((f) => f.status === "missing");
    const anyChanged = result.perFile.some((f) => f.status === "changed");
    const allSame = result.perFile.length > 0 && result.perFile.every((f) => f.status === "same");

    if (allMissing) {
        console.log(chalk.cyan(`${slug} not yet installed — adding fresh.`));
    } else if (allSame) {
        console.log(chalk.green(`${slug}: already in sync with upstream. Nothing to do.`));
        return;
    } else if (anyChanged) {
        console.log(chalk.yellow(`${slug}: upstream differs from your copy. Forwarding to \`add\` with the same flags.`));
    }

    // Reuse the full `add` pipeline (overwrite prompts, Tailwind merge, deps, cache write).
    await add(slug, {
        url: options.url,
        yes: options.yes,
        dryRun: options.dryRun,
        force: options.force,
    });
}
