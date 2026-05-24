import path from "path";
import { fileURLToPath } from "url";
import fs from "fs-extra";
import chalk from "chalk";
import { fetchJsonFromUrl, isLocalRegistrySource, warnIfUntrustedRegistry } from "./add";
import { RegistryArray, RegistryEntry, SplitIndex } from "../validators/registry-schema";
import type { ZodTypeAny, ZodIssue } from "zod";

type LoadResult = { ok: true; data: unknown } | { ok: false; error: string };

type Failure = { source: string; messages: string[] };

async function loadJson(source: string): Promise<LoadResult> {
    if (isLocalRegistrySource(source)) {
        try {
            const data = await fs.readJson(source);
            return { ok: true, data };
        } catch (err) {
            return { ok: false, error: `read failed: ${(err as Error).message}` };
        }
    }
    const data = await fetchJsonFromUrl(source);
    return data === null ? { ok: false, error: "fetch failed or not JSON" } : { ok: true, data };
}

function formatIssues(issues: ZodIssue[]): string[] {
    return issues.map((i) => {
        const where = i.path.length ? i.path.join(".") : "<root>";
        return `${where}: ${i.message}`;
    });
}

function check(source: string, schema: ZodTypeAny, data: unknown, failures: Failure[]): unknown | null {
    const result = schema.safeParse(data);
    if (!result.success) {
        failures.push({ source, messages: formatIssues(result.error.issues) });
        return null;
    }
    return result.data;
}

function trimRightSlash(s: string): string {
    return s.replace(/\/+$/, "");
}

function deriveSplitBase(url: string): string {
    // Slice from the trimmed (slash-normalized) source so trailing-slash variants
    // collapse to the same base rather than leaving stray `/` in the output.
    const trimmed = trimRightSlash(url);
    const normalized = trimmed.replace(/\\/g, "/");
    if (normalized.endsWith("/registry/index.json")) {
        return trimmed.slice(0, -"/registry/index.json".length);
    }
    if (normalized.endsWith("/registry")) {
        return trimmed.slice(0, -"/registry".length);
    }
    return trimmed;
}

function joinPathOrUrl(base: string, ...parts: string[]): string {
    if (isLocalRegistrySource(base)) {
        // `isLocalRegistrySource` accepts both bare filesystem paths and `file://` URLs.
        // Joining a `file://` URL as a string produces an invalid path; convert first.
        const localBase = base.startsWith("file:") ? fileURLToPath(base) : base;
        return path.join(localBase, ...parts);
    }
    return parts.reduce((acc, p) => `${acc.replace(/\/+$/, "")}/${p.replace(/^\/+/, "")}`, trimRightSlash(base));
}

export async function validateRegistry(options: { url: string }): Promise<void> {
    const url = options.url;
    warnIfUntrustedRegistry(url);
    console.log(chalk.cyan(`Validating registry at ${url}...`));

    const failures: Failure[] = [];
    const base = deriveSplitBase(url);
    const indexLoc = joinPathOrUrl(base, "registry", "index.json");
    const monoLoc = joinPathOrUrl(base, "registry.json");

    // Try the split index first (canonical for hosted UniqueUI registries) but
    // accept a mono-only registry too — that's a legitimate shape for third
    // parties, and the existing `add` command supports it as a fallback.
    const indexLoad = await loadJson(indexLoc);
    const monoLoad = await loadJson(monoLoc);

    if (!indexLoad.ok && !monoLoad.ok) {
        failures.push({
            source: `${indexLoc} or ${monoLoc}`,
            messages: ["neither split index nor mono registry.json could be loaded"],
        });
        reportAndExit(failures, 0);
        return;
    }

    let splitIndex: { components: string[] } | null = null;
    if (indexLoad.ok) {
        splitIndex = check(indexLoc, SplitIndex, indexLoad.data, failures) as { components: string[] } | null;
    }

    let validated = 0;
    if (splitIndex) {
        for (const slug of splitIndex.components) {
            const entryLoc = joinPathOrUrl(base, "registry", `${slug}.json`);
            const entryLoad = await loadJson(entryLoc);
            if (!entryLoad.ok) {
                failures.push({ source: entryLoc, messages: [entryLoad.error] });
                continue;
            }
            const entry = check(entryLoc, RegistryEntry, entryLoad.data, failures) as
                | { name: string }
                | null;
            if (!entry) continue;
            if (entry.name !== slug) {
                failures.push({
                    source: entryLoc,
                    messages: [`name "${entry.name}" does not match index slug "${slug}"`],
                });
                continue;
            }
            validated += 1;
        }
    }

    let mono: Array<{ name: string }> | null = null;
    if (monoLoad.ok) {
        mono = check(monoLoc, RegistryArray, monoLoad.data, failures) as Array<{ name: string }> | null;
    }

    if (mono && splitIndex) {
        const monoSlugs = new Set(mono.map((e) => e.name));
        const missing = splitIndex.components.filter((s) => !monoSlugs.has(s));
        const extra = mono.map((e) => e.name).filter((s) => !splitIndex.components.includes(s));
        if (missing.length || extra.length) {
            const msgs: string[] = [];
            if (missing.length) msgs.push(`split index has slugs not in mono: ${missing.join(", ")}`);
            if (extra.length) msgs.push(`mono has slugs not in split index: ${extra.join(", ")}`);
            failures.push({ source: "cross-check", messages: msgs });
        }
    } else if (mono && !splitIndex) {
        // Mono-only registry — count entries as validated (the schema check above
        // already enforced every entry's shape).
        validated = mono.length;
    }

    reportAndExit(failures, validated);
}

function reportAndExit(failures: Failure[], validated: number): void {
    if (failures.length === 0) {
        console.log(chalk.green(`Registry OK — ${validated} entries validated.`));
        return;
    }
    console.error(chalk.red(`Registry validation failed (${failures.length} source(s)):`));
    for (const f of failures) {
        console.error(chalk.red(`  ✗ ${f.source}`));
        for (const m of f.messages) console.error(`      ${m}`);
    }
    process.exitCode = 1;
}
