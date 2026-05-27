import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import type { ZodIssue } from "zod";
import { RegistryArray, RegistryEntry, Slug } from "../validators/registry-schema";

export type RegistryBuildOptions = {
    /** Source directory containing per-slug entry JSON files. Default: ./registry */
    src: string;
    /** Output directory for built artifacts. Default: ./dist/registry */
    out: string;
};

type Entry = {
    name: string;
    dependencies: string[];
    files: Array<{ path: string; content: string; type: string }>;
    tailwindConfig?: Record<string, unknown>;
    tailwindCss?: string;
    // Optional enrichment fields — passed through from source JSON via
    // .passthrough() on the local RegistryEntry schema so they survive
    // the build step without being re-declared here.
    tags?: string[];
    peerDependencies?: string[];
    [key: string]: unknown;
};

type BuildReport = {
    src: string;
    out: string;
    entries: Entry[];
    written: string[];
};

function formatIssues(issues: ZodIssue[]): string[] {
    return issues.map((i) => {
        const where = i.path.length ? i.path.join(".") : "<root>";
        return `${where}: ${i.message}`;
    });
}

async function readJsonOrNull(file: string): Promise<unknown | null> {
    try {
        return await fs.readJson(file);
    } catch (err) {
        // Only treat "file missing" as "no index" — a present-but-malformed
        // index.json must surface as a hard error so users don't silently
        // ship broken artifacts derived from filesystem fallback scanning.
        if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
        throw err;
    }
}

/**
 * Build the standard UniqueUI distributable artifacts from a source dir.
 *
 * Source shape (canonical):
 *   <src>/<slug>.json       — one file per component, each conforms to RegistryEntry
 *
 * Optional:
 *   <src>/index.json        — { "components": ["slug-a", ...] }; if absent, derived from filesystem.
 *
 * Outputs:
 *   <out>/index.json        — split index (list of slugs)
 *   <out>/<slug>.json       — per-slug entry (copy of source)
 *   <out>/registry.json     — mono array (legacy/fallback consumers)
 */
export async function buildRegistry(opts: RegistryBuildOptions): Promise<BuildReport> {
    const src = path.resolve(opts.src);
    const out = path.resolve(opts.out);

    if (!(await fs.pathExists(src))) {
        throw new Error(`Source directory does not exist: ${src}`);
    }

    // Prefer an explicit index.json if present; otherwise scan for `<slug>.json` files.
    const indexFile = path.join(src, "index.json");
    let slugs: string[];
    const indexPayload = (await readJsonOrNull(indexFile)) as { components?: unknown } | null;
    if (indexPayload && Array.isArray(indexPayload.components)) {
        slugs = (indexPayload.components as unknown[]).map((s) => {
            const parsed = Slug.safeParse(s);
            if (!parsed.success) {
                throw new Error(`index.json: invalid slug "${String(s)}"`);
            }
            return parsed.data;
        });
        // Reject duplicate slugs — they would otherwise rewrite the same
        // per-slug JSON twice and duplicate the entry in the mono array.
        const seen = new Set<string>();
        for (const slug of slugs) {
            if (seen.has(slug)) {
                throw new Error(`index.json: duplicate slug "${slug}"`);
            }
            seen.add(slug);
        }
    } else {
        const all = await fs.readdir(src);
        slugs = all
            .filter((f) => f.endsWith(".json") && f !== "index.json" && f !== "registry.json")
            .map((f) => f.replace(/\.json$/, ""))
            .filter((s) => Slug.safeParse(s).success)
            .sort();
        if (slugs.length === 0) {
            throw new Error(`No registry entries found in ${src} (looked for <slug>.json)`);
        }
    }

    // Load and validate every entry.
    const entries: Entry[] = [];
    for (const slug of slugs) {
        const file = path.join(src, `${slug}.json`);
        if (!(await fs.pathExists(file))) {
            throw new Error(`Missing entry file: ${file}`);
        }
        const raw = await fs.readJson(file);
        const parsed = RegistryEntry.safeParse(raw);
        if (!parsed.success) {
            const msgs = formatIssues(parsed.error.issues).join("\n      ");
            throw new Error(`${slug}: schema validation failed:\n      ${msgs}`);
        }
        if (parsed.data.name !== slug) {
            throw new Error(`${slug}.json: name field "${parsed.data.name}" does not match filename slug "${slug}"`);
        }
        entries.push(parsed.data as Entry);
    }

    // Cross-check the aggregate against the array schema as well — this catches
    // duplicate names and other array-level invariants if Zod ever grows them.
    const arrayParsed = RegistryArray.safeParse(entries);
    if (!arrayParsed.success) {
        const msgs = formatIssues(arrayParsed.error.issues).join("\n      ");
        throw new Error(`registry array failed validation:\n      ${msgs}`);
    }

    // Write outputs.
    await fs.ensureDir(out);
    // Drop stale per-slug artifacts that a previous build emitted but the
    // current source no longer declares. Without this cleanup the out/ dir
    // accumulates ghost slugs that aren't in index.json but are still
    // fetchable by anyone who knows the URL — a real correctness hazard.
    // We scope cleanup to <slug>.json filenames so we never touch unrelated
    // assets the user may have placed alongside their registry build output.
    const existing = await fs.readdir(out);
    const declared = new Set(slugs);
    for (const f of existing) {
        if (!f.endsWith(".json")) continue;
        if (f === "index.json" || f === "registry.json") continue;
        const base = f.replace(/\.json$/, "");
        if (!declared.has(base)) {
            await fs.remove(path.join(out, f));
        }
    }
    const written: string[] = [];

    const indexOut = path.join(out, "index.json");
    await fs.writeJson(indexOut, { components: slugs }, { spaces: 2 });
    written.push(indexOut);

    for (const entry of entries) {
        const entryOut = path.join(out, `${entry.name}.json`);
        await fs.writeJson(entryOut, entry, { spaces: 2 });
        written.push(entryOut);
    }

    const monoOut = path.join(out, "registry.json");
    await fs.writeJson(monoOut, entries, { spaces: 2 });
    written.push(monoOut);

    return { src, out, entries, written };
}

export async function registryBuild(options: { src?: string; out?: string }): Promise<void> {
    const src = options.src ?? "registry";
    const out = options.out ?? "dist/registry";

    console.log(chalk.cyan(`Building registry: ${src} → ${out}`));
    try {
        const report = await buildRegistry({ src, out });
        console.log(chalk.green(`  ✓ ${report.entries.length} entries validated`));
        for (const w of report.written) {
            console.log(chalk.gray(`    ${path.relative(process.cwd(), w) || w}`));
        }
        console.log(chalk.green(`\nDone. Serve ${path.relative(process.cwd(), out) || out}/ as your registry root.`));
    } catch (err) {
        console.error(chalk.red(`Build failed: ${(err as Error).message}`));
        process.exitCode = 1;
    }
}
