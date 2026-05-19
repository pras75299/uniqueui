import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import {
    fetchJsonFromUrl,
    isLocalRegistrySource,
    validateRegistryPayload,
    validateRegistryIndexPayload,
    warnIfUntrustedRegistry,
} from "./add";

type RegistryItem = {
    name: string;
    dependencies: string[];
    files: Array<{ path: string; type: string; content: string }>;
    tailwindConfig?: Record<string, unknown>;
    tailwindCss?: string;
};

type ShadcnItem = {
    name?: unknown;
    title?: unknown;
    description?: unknown;
};

type InfoRecord = {
    item: RegistryItem;
    title?: string;
    description?: string;
    source: string;
};

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

function pickShadcnMetadata(payload: unknown, slug: string): { title?: string; description?: string } {
    if (payload === null || typeof payload !== "object" || Array.isArray(payload)) return {};
    const items = (payload as { items?: unknown }).items;
    if (!Array.isArray(items)) return {};
    for (const raw of items) {
        if (raw === null || typeof raw !== "object") continue;
        const it = raw as ShadcnItem;
        if (it.name !== slug) continue;
        const out: { title?: string; description?: string } = {};
        if (typeof it.title === "string") out.title = it.title;
        if (typeof it.description === "string") out.description = it.description;
        return out;
    }
    return {};
}

async function loadShadcnMetadataLocal(base: string, slug: string): Promise<{ title?: string; description?: string }> {
    const root = trimRightSlash(base);
    return pickShadcnMetadata(await readJsonSafe(path.join(root, "r/registry.json")), slug);
}

async function loadShadcnMetadataRemote(base: string, slug: string): Promise<{ title?: string; description?: string }> {
    const root = trimRightSlash(base);
    return pickShadcnMetadata(await fetchJsonFromUrl(`${root}/r/registry.json`), slug);
}

function validateRegistryItemPayload(data: unknown): RegistryItem | null {
    const list = validateRegistryPayload([data]);
    return list?.[0] ?? null;
}

async function loadFromLocal(source: string, slug: string): Promise<InfoRecord | null> {
    if (source.endsWith(".json") && !source.endsWith("/index.json")) {
        const payload = await readJsonSafe(source);
        const direct = payload ? validateRegistryItemPayload(payload) : null;
        if (direct && direct.name === slug) return { item: direct, source };
        const legacy = payload ? validateRegistryPayload(payload) : null;
        const item = legacy?.find((e) => e.name === slug);
        return item ? { item, source } : null;
    }

    const base = trimRightSlash(source);
    // Try split first (richer payload — includes tailwindCss).
    const splitIndex = validateRegistryIndexPayload(await readJsonSafe(path.join(base, "registry/index.json")));
    if (splitIndex && splitIndex.components.includes(slug)) {
        const item = validateRegistryItemPayload(await readJsonSafe(path.join(base, `registry/${slug}.json`)));
        if (item) {
            const meta = await loadShadcnMetadataLocal(base, slug);
            return { item, source: path.join(base, `registry/${slug}.json`), ...meta };
        }
    }

    // Legacy monolithic.
    const legacy = validateRegistryPayload(await readJsonSafe(path.join(base, "registry.json")));
    if (legacy) {
        const item = legacy.find((e) => e.name === slug);
        if (item) {
            const meta = await loadShadcnMetadataLocal(base, slug);
            return { item, source: path.join(base, "registry.json"), ...meta };
        }
    }

    return null;
}

async function loadFromRemote(source: string, slug: string): Promise<InfoRecord | null> {
    const normalized = trimRightSlash(source);

    if (normalized.endsWith(".json") && !normalized.endsWith("/index.json")) {
        const payload = await fetchJsonFromUrl(normalized);
        const direct = payload ? validateRegistryItemPayload(payload) : null;
        if (direct && direct.name === slug) return { item: direct, source: normalized };
        const legacy = payload ? validateRegistryPayload(payload) : null;
        const item = legacy?.find((e) => e.name === slug);
        return item ? { item, source: normalized } : null;
    }

    // Split first.
    const splitUrl = `${normalized}/registry/index.json`;
    const splitIndex = validateRegistryIndexPayload(await fetchJsonFromUrl(splitUrl));
    if (splitIndex && splitIndex.components.includes(slug)) {
        const itemUrl = `${normalized}/registry/${slug}.json`;
        const item = validateRegistryItemPayload(await fetchJsonFromUrl(itemUrl));
        if (item) {
            const meta = await loadShadcnMetadataRemote(normalized, slug);
            return { item, source: itemUrl, ...meta };
        }
    }

    // Legacy.
    const legacyUrl = `${normalized}/registry.json`;
    const legacy = validateRegistryPayload(await fetchJsonFromUrl(legacyUrl));
    if (legacy) {
        const item = legacy.find((e) => e.name === slug);
        if (item) {
            const meta = await loadShadcnMetadataRemote(normalized, slug);
            return { item, source: legacyUrl, ...meta };
        }
    }

    return null;
}

export async function loadRegistryInfo(source: string, slug: string): Promise<InfoRecord | null> {
    return isLocalRegistrySource(source) ? loadFromLocal(source, slug) : loadFromRemote(source, slug);
}

function summarizeTailwindConfig(cfg: Record<string, unknown> | undefined): { animations: string[]; keyframes: string[] } {
    const out = { animations: [] as string[], keyframes: [] as string[] };
    const extend = (cfg?.theme as { extend?: Record<string, unknown> } | undefined)?.extend;
    if (!extend) return out;
    const anim = extend.animation;
    if (anim && typeof anim === "object" && !Array.isArray(anim)) {
        out.animations = Object.keys(anim);
    }
    const kf = extend.keyframes;
    if (kf && typeof kf === "object" && !Array.isArray(kf)) {
        out.keyframes = Object.keys(kf);
    }
    return out;
}

export function formatInfo(record: InfoRecord): string {
    const { item, title, description, source } = record;
    const lines: string[] = [];
    const header = title ? `${item.name} — ${title}` : item.name;
    lines.push(chalk.bold(`\n${header}`));
    if (description) lines.push(chalk.gray(description));
    lines.push(chalk.gray(`Source: ${source}`));
    lines.push("");

    lines.push(chalk.bold("Dependencies"));
    if (item.dependencies.length === 0) {
        lines.push(chalk.gray("  (none)"));
    } else {
        for (const dep of item.dependencies) lines.push(`  - ${dep}`);
    }
    lines.push("");

    lines.push(chalk.bold("Files"));
    for (const f of item.files) {
        lines.push(`  - ${f.path} ${chalk.gray(`(${f.type})`)}`);
    }
    lines.push("");

    const hasTwV3 = !!item.tailwindConfig;
    const hasTwV4 = !!item.tailwindCss;
    if (hasTwV3 || hasTwV4) {
        lines.push(chalk.bold("Tailwind"));
        if (hasTwV3) {
            const { animations, keyframes } = summarizeTailwindConfig(item.tailwindConfig);
            lines.push(`  v3 JS config: ${animations.length} animation(s), ${keyframes.length} keyframe(s)`);
            if (animations.length) lines.push(chalk.gray(`    animations: ${animations.join(", ")}`));
            if (keyframes.length) lines.push(chalk.gray(`    keyframes:  ${keyframes.join(", ")}`));
        }
        if (hasTwV4) {
            const bytes = Buffer.byteLength(item.tailwindCss ?? "", "utf8");
            lines.push(`  v4 CSS snippet: ${bytes} bytes ${chalk.gray("(appended to globals.css on add)")}`);
        }
        lines.push("");
    }

    lines.push(chalk.gray(`Add it with: npx uniqueui add ${item.name}`));
    return lines.join("\n");
}

export async function info(slug: string, options: { url: string }) {
    warnIfUntrustedRegistry(options.url);
    const record = await loadRegistryInfo(options.url, slug);
    if (!record) {
        console.error(chalk.red(`Component "${slug}" not found in registry source ${options.url}.`));
        process.exitCode = 1;
        return;
    }
    console.log(formatInfo(record));
}
