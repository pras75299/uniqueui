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

async function loadFromLocalSource(source: string): Promise<Entry[] | null> {
    const base = trimRightSlash(source);

    // 1. Shadcn-style /r/registry.json (rich)
    const shadcn = validateShadcnRegistry(await readJsonSafe(path.join(base, "r/registry.json")));
    if (shadcn && shadcn.length) return shadcn;

    // 2. Split /registry/index.json (names only)
    const splitIndex = validateRegistryIndexPayload(
        await readJsonSafe(path.join(base, "registry/index.json")),
    );
    if (splitIndex) return splitIndex.components.map((name) => ({ name }));

    // 3. Legacy /registry.json aggregate (names only)
    const legacy = validateRegistryPayload(await readJsonSafe(path.join(base, "registry.json")));
    if (legacy) return legacy.map((entry) => ({ name: entry.name }));

    return null;
}

async function loadFromRemoteSource(source: string): Promise<Entry[] | null> {
    const base = trimRightSlash(source);

    const shadcn = validateShadcnRegistry(await fetchJsonFromUrl(`${base}/r/registry.json`));
    if (shadcn && shadcn.length) return shadcn;

    const splitIndex = validateRegistryIndexPayload(
        await fetchJsonFromUrl(`${base}/registry/index.json`),
    );
    if (splitIndex) return splitIndex.components.map((name) => ({ name }));

    const legacy = validateRegistryPayload(await fetchJsonFromUrl(`${base}/registry.json`));
    if (legacy) return legacy.map((entry) => ({ name: entry.name }));

    return null;
}

export async function loadRegistryEntries(source: string): Promise<Entry[] | null> {
    return isLocalRegistrySource(source)
        ? loadFromLocalSource(source)
        : loadFromRemoteSource(source);
}

function formatRow(entry: Entry, nameWidth: number): string {
    const slug = entry.name.padEnd(nameWidth);
    const title = entry.title ?? "";
    const desc = entry.description ?? "";
    if (!title && !desc) return chalk.white(slug);
    if (!desc) return `${chalk.white(slug)}  ${chalk.gray(title)}`;
    return `${chalk.white(slug)}  ${chalk.gray(desc)}`;
}

export async function list(options: { url: string }) {
    warnIfUntrustedRegistry(options.url);

    let entries: Entry[] | null = null;
    try {
        entries = await loadRegistryEntries(options.url);
    } catch (error) {
        console.error(chalk.red("Could not fetch registry data:"), error);
        process.exitCode = 1;
        return;
    }

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
