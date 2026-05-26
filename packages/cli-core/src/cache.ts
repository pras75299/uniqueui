import path from "path";
import fs from "fs-extra";
import { SLUG_RE } from "./validators/registry-schema";

export const CACHE_DIR = ".uniqueui/cache";

type RegistryItemLike = {
    name: string;
    dependencies: string[];
    files: Array<{ path: string; type: string; content: string }>;
    tailwindConfig?: Record<string, unknown>;
    tailwindCss?: string;
};

type CachedItem = RegistryItemLike & {
    fetchedAt: string;
    sourceUrl: string;
};

function isSafeSlug(slug: string): boolean {
    return SLUG_RE.test(slug);
}

export function cachePath(slug: string, cwd: string = process.cwd()): string {
    if (!isSafeSlug(slug)) throw new Error(`Refusing unsafe slug for cache: ${slug}`);
    return path.join(cwd, CACHE_DIR, `${slug}.json`);
}

export async function writeCachedItem(
    slug: string,
    item: RegistryItemLike,
    sourceUrl: string,
    cwd: string = process.cwd(),
): Promise<void> {
    const file = cachePath(slug, cwd);
    await fs.ensureDir(path.dirname(file));
    const record: CachedItem = {
        name: item.name,
        dependencies: item.dependencies,
        files: item.files,
        tailwindConfig: item.tailwindConfig,
        tailwindCss: item.tailwindCss,
        fetchedAt: new Date().toISOString(),
        sourceUrl,
    };
    await fs.writeJson(file, record, { spaces: 2 });
}

export async function readCachedItem(slug: string, cwd: string = process.cwd()): Promise<CachedItem | null> {
    const file = cachePath(slug, cwd);
    try {
        return (await fs.readJson(file)) as CachedItem;
    } catch {
        return null;
    }
}

/**
 * Mirrors the rename logic in add.ts:
 *   files where the source basename is `component.{tsx,ts,jsx,js}` become `<slug>.<ext>` on disk;
 *   everything else keeps its basename. Caller still owns the directory choice (paths.components / paths.lib).
 */
export function resolveOnDiskFileName(slug: string, registryFilePath: string): string {
    const sourceFileName = path.basename(registryFilePath);
    if (/^component\.(tsx|ts|jsx|js)$/i.test(sourceFileName)) {
        return `${slug}${path.extname(sourceFileName)}`;
    }
    return sourceFileName;
}
