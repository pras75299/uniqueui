import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import { printUnifiedDiff, warnIfUntrustedRegistry } from "./add";
import { loadRegistryInfo } from "./info";
import { resolveOnDiskFileName } from "../cache";

type ComponentsConfig = {
    paths?: { components?: string; lib?: string };
};

async function readComponentsConfig(): Promise<ComponentsConfig | null> {
    try {
        return (await fs.readJson("components.json")) as ComponentsConfig;
    } catch {
        return null;
    }
}

function resolveTargetPath(slug: string, file: { path: string; type: string }, cfg: ComponentsConfig): string | null {
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

export type DiffResult = {
    slug: string;
    perFile: Array<{ targetPath: string; status: "missing" | "same" | "changed"; current: string; upstream: string }>;
    notFound?: boolean;
};

export async function computeDiff(slug: string, url: string): Promise<DiffResult | null> {
    const cfg = await readComponentsConfig();
    if (!cfg) return null;

    const record = await loadRegistryInfo(url, slug);
    if (!record) return { slug, perFile: [], notFound: true };

    const perFile: DiffResult["perFile"] = [];
    const skipped: string[] = [];
    for (const f of record.item.files) {
        const target = resolveTargetPath(slug, f, cfg);
        if (!target) {
            skipped.push(`${f.path} (type: ${f.type})`);
            continue;
        }
        let current = "";
        let status: "missing" | "same" | "changed";
        if (!(await fs.pathExists(target))) {
            status = "missing";
        } else {
            current = await fs.readFile(target, "utf8");
            status = current === f.content ? "same" : "changed";
        }
        perFile.push({ targetPath: target, status, current, upstream: f.content });
    }
    if (skipped.length) {
        console.warn(
            chalk.yellow(
                `diff: skipped ${skipped.length} unsupported file(s) — only registry:ui and registry:util are tracked on disk:\n  ${skipped.join("\n  ")}`,
            ),
        );
    }
    return { slug, perFile };
}

export async function diff(slug: string, options: { url: string }): Promise<void> {
    warnIfUntrustedRegistry(options.url);
    const result = await computeDiff(slug, options.url);
    if (!result) {
        console.error(chalk.red("components.json not found. Run `uniqueui init` first."));
        process.exitCode = 1;
        return;
    }
    if (result.notFound) {
        console.error(chalk.red(`Component "${slug}" not found in registry at ${options.url}.`));
        process.exitCode = 1;
        return;
    }

    let changes = 0;
    let missing = 0;
    for (const entry of result.perFile) {
        const rel = path.relative(process.cwd(), entry.targetPath) || entry.targetPath;
        if (entry.status === "missing") {
            console.log(chalk.yellow(`? ${rel} (not in project)`));
            missing += 1;
            continue;
        }
        if (entry.status === "same") {
            console.log(chalk.gray(`= ${rel} (in sync)`));
            continue;
        }
        console.log(chalk.cyan(`Δ ${rel}`));
        printUnifiedDiff(entry.current, entry.upstream, rel);
        changes += 1;
    }

    console.log("");
    if (changes === 0 && missing === 0) {
        console.log(chalk.green(`${slug}: in sync with upstream.`));
        return;
    }
    if (changes > 0) {
        console.log(
            chalk.yellow(
                `${slug}: ${changes} file(s) differ from upstream. Run \`uniqueui update ${slug}\` to overwrite.`,
            ),
        );
        process.exitCode = 1;
    }
    if (missing > 0) {
        console.log(chalk.yellow(`${slug}: ${missing} file(s) not yet present locally. Run \`uniqueui add ${slug}\`.`));
    }
}
