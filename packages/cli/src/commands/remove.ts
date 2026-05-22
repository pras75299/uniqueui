import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import prompts from "prompts";
import { loadRegistryInfo } from "./info";
import { warnIfUntrustedRegistry } from "./add";
import { resolveOnDiskFileName } from "../cache";

type ComponentsConfig = {
    paths?: { components?: string; lib?: string };
};

export type RemoveOptions = {
    url: string;
    /** Skip the confirmation prompt and remove without asking. */
    yes?: boolean;
    /** Report what would be removed but do not write to disk. */
    dryRun?: boolean;
};

async function readComponentsConfig(): Promise<ComponentsConfig | null> {
    try {
        return (await fs.readJson("components.json")) as ComponentsConfig;
    } catch {
        return null;
    }
}

function resolveTargetPath(slug: string, file: { path: string; type: string }, cfg: ComponentsConfig): string | null {
    // Mirror `add` / `diff` so we delete exactly the files those commands write.
    if (file.type === "registry:ui") {
        const dir = path.resolve(cfg.paths?.components || "components/ui");
        return path.join(dir, resolveOnDiskFileName(slug, file.path));
    }
    if (file.type === "registry:util") {
        const dir = path.resolve(cfg.paths?.lib || "utils");
        return path.join(dir, path.basename(file.path));
    }
    return null;
}

export type RemovePlan = {
    slug: string;
    /** Files we would remove. `registry:util` files are intentionally excluded — they're shared. */
    toRemove: Array<{ targetPath: string; exists: boolean }>;
    /** Files skipped because they're shared (e.g. cn.ts) or unsupported types. */
    skipped: Array<{ targetPath: string; reason: string }>;
    /** Declared npm deps the user may want to uninstall. We never run npm uninstall ourselves. */
    npmDependencies: string[];
};

export async function planRemove(slug: string, url: string): Promise<RemovePlan | { error: "no-config" } | { error: "not-found" }> {
    const cfg = await readComponentsConfig();
    if (!cfg) return { error: "no-config" };

    const record = await loadRegistryInfo(url, slug);
    if (!record) return { error: "not-found" };

    const toRemove: RemovePlan["toRemove"] = [];
    const skipped: RemovePlan["skipped"] = [];

    for (const f of record.item.files) {
        const target = resolveTargetPath(slug, f, cfg);
        if (!target) {
            skipped.push({ targetPath: f.path, reason: `unsupported type: ${f.type}` });
            continue;
        }
        // `registry:util` files (e.g. cn.ts) are shared across components. Removing them
        // when uninstalling one component would break the others — always skip.
        if (f.type === "registry:util") {
            skipped.push({ targetPath: target, reason: "shared utility (kept)" });
            continue;
        }
        const exists = await fs.pathExists(target);
        toRemove.push({ targetPath: target, exists });
    }

    return {
        slug,
        toRemove,
        skipped,
        npmDependencies: [...record.item.dependencies],
    };
}

export async function remove(slug: string, options: RemoveOptions): Promise<void> {
    warnIfUntrustedRegistry(options.url);

    const plan = await planRemove(slug, options.url);
    if ("error" in plan) {
        if (plan.error === "no-config") {
            console.error(chalk.red("components.json not found. Run `uniqueui init` first."));
        } else {
            console.error(chalk.red(`Component "${slug}" not found in registry at ${options.url}.`));
        }
        process.exitCode = 1;
        return;
    }

    const existing = plan.toRemove.filter((f) => f.exists);
    const ghost = plan.toRemove.filter((f) => !f.exists);

    if (existing.length === 0) {
        console.log(chalk.yellow(`${slug}: nothing to remove — no tracked files exist on disk.`));
        if (ghost.length > 0) {
            for (const g of ghost) {
                console.log(chalk.gray(`  (missing) ${path.relative(process.cwd(), g.targetPath) || g.targetPath}`));
            }
        }
        return;
    }

    console.log(chalk.bold(`\nWould remove ${existing.length} file(s) for ${slug}:`));
    for (const f of existing) {
        console.log(chalk.red(`  - ${path.relative(process.cwd(), f.targetPath) || f.targetPath}`));
    }
    for (const s of plan.skipped) {
        console.log(chalk.gray(`  (skip)  ${path.relative(process.cwd(), s.targetPath) || s.targetPath} — ${s.reason}`));
    }

    if (options.dryRun) {
        console.log(chalk.cyan("\nDry run — no files touched."));
        printUninstallHint(plan.npmDependencies);
        return;
    }

    if (!options.yes) {
        const { confirm } = (await prompts({
            type: "confirm",
            name: "confirm",
            message: `Delete ${existing.length} file(s)?`,
            initial: false,
        })) as { confirm?: boolean };
        if (!confirm) {
            console.log(chalk.gray("Aborted."));
            return;
        }
    }

    for (const f of existing) {
        await fs.remove(f.targetPath);
        console.log(chalk.green(`removed ${path.relative(process.cwd(), f.targetPath) || f.targetPath}`));
    }

    printUninstallHint(plan.npmDependencies);
}

function printUninstallHint(deps: string[]): void {
    if (deps.length === 0) return;
    console.log(
        chalk.gray(
            "\nThis component declared npm dependencies. If no other component in your project needs them, uninstall manually:",
        ),
    );
    console.log(chalk.gray(`  npm uninstall ${deps.join(" ")}`));
    console.log(chalk.gray("  (or your project's equivalent — we don't auto-uninstall to avoid breaking other components.)"));
}
