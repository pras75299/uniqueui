import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import {
    fetchJsonFromUrl,
    isLocalRegistrySource,
    validateRegistryIndexPayload,
    validateRegistryPayload,
    warnIfUntrustedRegistry,
} from "./add";

type Entry = { name: string; title?: string; description?: string };

type ShadcnItem = {
    name?: unknown;
    title?: unknown;
    description?: unknown;
};

type ShadcnRegistry = {
    items?: unknown;
};

function validateShadcnRegistry(data: unknown): Entry[] | null {
    if (data === null || typeof data !== "object" || Array.isArray(data)) return null;
    const items = (data as ShadcnRegistry).items;
    if (!Array.isArray(items)) return null;
    const out: Entry[] = [];
    for (const raw of items) {
        if (raw === null || typeof raw !== "object" || Array.isArray(raw)) return null;
        const it = raw as ShadcnItem;
        if (typeof it.name !== "string" || it.name.length === 0) return null;
        const entry: Entry = { name: it.name };
        if (typeof it.title === "string") entry.title = it.title;
        if (typeof it.description === "string") entry.description = it.description;
        out.push(entry);
    }
    return out;
}

function trimRightSlash(s: string): string {
    return s.replace(/\/+$/, "");
}

async function readJsonSafe(filePath: string): Promise<unknown | null> {
    try {
        return await fs.readJson(filePath);
    } catch {
        return null;
    }
}

/** Parse one already-fetched JSON payload through every known registry shape. */
function entriesFromPayload(payload: unknown): Entry[] | null {
    const shadcn = validateShadcnRegistry(payload);
    if (shadcn) return shadcn;

    const splitIndex = validateRegistryIndexPayload(payload);
    if (splitIndex) return splitIndex.components.map((name) => ({ name }));

    const legacy = validateRegistryPayload(payload);
    if (legacy) return legacy.map((entry) => ({ name: entry.name }));

    return null;
}

/**
 * Probe sources in order: shadcn `/r/registry.json` → split `/registry/index.json` →
 * legacy `/registry.json`. Each source is authoritative — if it returns a valid
 * (even empty) payload, we don't fall through. Falling through on empty caused
 * inconsistent behavior depending on which source happened to be reachable.
 */
async function probeSources(
    candidates: Array<() => Promise<unknown | null>>,
): Promise<Entry[] | null> {
    for (const fetchOne of candidates) {
        const payload = await fetchOne();
        if (payload === null) continue;
        const entries = entriesFromPayload(payload);
        if (entries !== null) return entries;
    }
    return null;
}

async function loadFromLocalSource(source: string): Promise<Entry[] | null> {
    // Direct .json file path — caller already pointed us at the registry data.
    if (source.endsWith(".json")) {
        return entriesFromPayload(await readJsonSafe(source));
    }

    const base = trimRightSlash(source);
    return probeSources([
        () => readJsonSafe(path.join(base, "r/registry.json")),
        () => readJsonSafe(path.join(base, "registry/index.json")),
        () => readJsonSafe(path.join(base, "registry.json")),
    ]);
}

async function loadFromRemoteSource(source: string): Promise<Entry[] | null> {
    if (source.endsWith(".json")) {
        return entriesFromPayload(await fetchJsonFromUrl(source));
    }

    const base = trimRightSlash(source);
    return probeSources([
        () => fetchJsonFromUrl(`${base}/r/registry.json`),
        () => fetchJsonFromUrl(`${base}/registry/index.json`),
        () => fetchJsonFromUrl(`${base}/registry.json`),
    ]);
}

export async function loadRegistryEntries(source: string): Promise<Entry[] | null> {
    return isLocalRegistrySource(source)
        ? loadFromLocalSource(source)
        : loadFromRemoteSource(source);
}

/** Description is preferred when present (more informative); title is the fallback. */
function formatRow(entry: Entry, nameWidth: number): string {
    const slug = chalk.white(entry.name.padEnd(nameWidth));
    const tail = entry.description ?? entry.title ?? "";
    return tail ? `${slug}  ${chalk.gray(tail)}` : slug;
}

export async function list(options: { url: string }) {
    warnIfUntrustedRegistry(options.url);

    // loadRegistryEntries swallows fetch / read errors via readJsonSafe and
    // fetchJsonFromUrl, so a null return covers both "unreachable" and "no
    // recognized payload" — there's no separate throw path to catch.
    const entries = await loadRegistryEntries(options.url);

    if (!entries || entries.length === 0) {
        console.error(chalk.red(`No components found at ${options.url}.`));
        process.exitCode = 1;
        return;
    }

    const sorted = [...entries].sort((a, b) => a.name.localeCompare(b.name));
    const nameWidth = sorted.reduce((max, e) => Math.max(max, e.name.length), 0);

    console.log(chalk.bold(`\nUniqueUI components — ${sorted.length} available`));
    console.log(chalk.gray(`Source: ${options.url}\n`));
    for (const entry of sorted) {
        console.log(formatRow(entry, nameWidth));
    }
    console.log(chalk.gray(`\nAdd one with: npx uniqueui add <name>`));
}
