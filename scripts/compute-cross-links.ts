/**
 * Derive relatedSlugs and usedByBlocks from per-slug manifest tags (ADR 0004).
 * Pure functions — no I/O.
 */

/** Tags shared by so many slugs they don't discriminate related components. */
export const RELATED_STOP_TAGS = new Set([
    "hero",
    "block",
    "effect",
    "card",
    "text",
    "ui",
    "interactive",
    "animation",
]);

export type CrossLinkOpts = {
    minOverlap?: number;
    max?: number;
    stopTags?: Set<string>;
    /** When true, only map a component to hero blocks with a unique best tag overlap. */
    uniqueHeroMatch?: boolean;
};

function discriminativeTags(tags: string[] | undefined, stopTags = RELATED_STOP_TAGS): string[] {
    return (tags ?? []).filter((t) => !stopTags.has(t));
}

/** Inverse document frequency — rare shared tags rank higher than generic ones. */
function buildTagIdf(
    allSlugs: string[],
    tagsBySlug: Record<string, string[]>,
    stopTags = RELATED_STOP_TAGS,
): Map<string, number> {
    const df = new Map<string, number>();
    for (const slug of allSlugs) {
        for (const tag of new Set(discriminativeTags(tagsBySlug[slug], stopTags))) {
            df.set(tag, (df.get(tag) ?? 0) + 1);
        }
    }
    const idf = new Map<string, number>();
    for (const [tag, count] of df) {
        idf.set(tag, 1 / count);
    }
    return idf;
}

function sharedDiscriminativeTags(
    a: string[],
    b: string[],
    stopTags = RELATED_STOP_TAGS,
): string[] {
    const bb = new Set(discriminativeTags(b, stopTags));
    return discriminativeTags(a, stopTags).filter((t) => bb.has(t));
}

function idfScore(shared: string[], idf: Map<string, number>): number {
    return shared.reduce((sum, tag) => sum + (idf.get(tag) ?? 0), 0);
}

export function computeRelatedSlugsForSlug(
    slug: string,
    tags: string[],
    allSlugs: string[],
    tagsBySlug: Record<string, string[]>,
    { minOverlap = 1, max = 6, stopTags = RELATED_STOP_TAGS }: CrossLinkOpts = {},
    idf: Map<string, number> = buildTagIdf(allSlugs, tagsBySlug, stopTags),
): string[] {
    const source = discriminativeTags(tags, stopTags);
    if (source.length === 0) return [];

    const scores: Array<{ other: string; overlap: number; weight: number }> = [];
    for (const other of allSlugs) {
        if (other === slug) continue;
        const shared = sharedDiscriminativeTags(source, tagsBySlug[other] ?? [], stopTags);
        const bothHero = slug.startsWith("hero-") && other.startsWith("hero-");
        const requiredOverlap = bothHero ? Math.max(minOverlap, 2) : minOverlap;
        if (shared.length < requiredOverlap) continue;
        scores.push({ other, overlap: shared.length, weight: idfScore(shared, idf) });
    }

    scores.sort(
        (a, b) =>
            b.overlap - a.overlap ||
            b.weight - a.weight ||
            a.other.localeCompare(b.other),
    );
    return scores.slice(0, max).map((s) => s.other);
}

export function computeRelatedSlugsMap(
    allSlugs: string[],
    tagsBySlug: Record<string, string[]>,
    opts?: CrossLinkOpts,
): Record<string, string[]> {
    const stopTags = opts?.stopTags ?? RELATED_STOP_TAGS;
    const max = opts?.max ?? 6;
    const idf = buildTagIdf(allSlugs, tagsBySlug, stopTags);
    const out: Record<string, string[]> = {};
    for (const slug of allSlugs) {
        const related = computeRelatedSlugsForSlug(
            slug,
            tagsBySlug[slug] ?? [],
            allSlugs,
            tagsBySlug,
            { ...opts, max },
            idf,
        );
        if (related.length > 0) out[slug] = related;
    }

    // If A lists B, ensure B lists A (drop lowest-weight neighbor when over cap).
    for (const slug of allSlugs) {
        for (const related of [...(out[slug] ?? [])]) {
            out[related] = ensureRelatedIncludes(
                related,
                slug,
                tagsBySlug,
                max,
                stopTags,
                idf,
                out[related] ?? [],
            );
        }
    }

    return out;
}

function ensureRelatedIncludes(
    slug: string,
    mustInclude: string,
    tagsBySlug: Record<string, string[]>,
    max: number,
    stopTags: Set<string>,
    idf: Map<string, number>,
    current: string[],
): string[] {
    if (current.includes(mustInclude)) return current;

    const pool = [...new Set([...current, mustInclude])];
    const scored = pool.map((other) => {
        const shared = sharedDiscriminativeTags(tagsBySlug[slug] ?? [], tagsBySlug[other] ?? [], stopTags);
        return {
            other,
            overlap: shared.length,
            weight: idfScore(shared, idf),
            forced: other === mustInclude,
        };
    });
    scored.sort(
        (a, b) =>
            Number(b.forced) - Number(a.forced) ||
            b.overlap - a.overlap ||
            b.weight - a.weight ||
            a.other.localeCompare(b.other),
    );
    return scored.slice(0, max).map((s) => s.other);
}

/**
 * Hero blocks don't declare component slugs in manifest dependencies, so
 * usedByBlocks is inferred from tag overlap between each base component and
 * hero-* slugs (highest overlap wins; optional unique-winner filter).
 */
export function computeUsedByBlocksMap(
    allSlugs: string[],
    tagsBySlug: Record<string, string[]>,
    { stopTags = RELATED_STOP_TAGS, uniqueHeroMatch = true }: CrossLinkOpts = {},
): Record<string, string[]> {
    const heroes = allSlugs.filter((s) => s.startsWith("hero-"));
    const components = allSlugs.filter((s) => !s.startsWith("hero-"));
    const idf = buildTagIdf(allSlugs, tagsBySlug, stopTags);
    const out: Record<string, string[]> = {};

    for (const comp of components) {
        const source = discriminativeTags(tagsBySlug[comp], stopTags);
        if (source.length === 0) continue;

        let bestOverlap = 0;
        let bestWeight = 0;
        let bestHeroes: string[] = [];

        for (const hero of heroes) {
            const shared = sharedDiscriminativeTags(source, tagsBySlug[hero] ?? [], stopTags);
            if (shared.length === 0) continue;
            const weight = idfScore(shared, idf);
            if (
                shared.length > bestOverlap ||
                (shared.length === bestOverlap && weight > bestWeight)
            ) {
                bestOverlap = shared.length;
                bestWeight = weight;
                bestHeroes = [hero];
            } else if (shared.length === bestOverlap && weight === bestWeight) {
                bestHeroes.push(hero);
            }
        }

        if (bestOverlap <= 0) continue;
        if (uniqueHeroMatch && bestHeroes.length !== 1) continue;
        out[comp] = bestHeroes.sort();
    }

    return out;
}

export function crossLinksFromManifests(
    manifests: Map<string, { tags: string[] }> | Record<string, { tags: string[] }>,
    slugs: string[],
    opts?: CrossLinkOpts,
): {
    relatedSlugsMap: Record<string, string[]>;
    usedByBlocksMap: Record<string, string[]>;
} {
    const tagsBySlug: Record<string, string[]> = {};
    for (const slug of slugs) {
        const entry = manifests instanceof Map ? manifests.get(slug) : manifests[slug];
        tagsBySlug[slug] = entry?.tags ?? [];
    }
    return {
        relatedSlugsMap: computeRelatedSlugsMap(slugs, tagsBySlug, opts),
        usedByBlocksMap: computeUsedByBlocksMap(slugs, tagsBySlug, opts),
    };
}

/** True when `computed[slug]` contains every slug listed in `baseline[slug]`. */
export function crossLinksCoverBaseline(
    baseline: Record<string, string[]>,
    computed: Record<string, string[]>,
): string[] {
    const gaps: string[] = [];
    for (const [slug, expected] of Object.entries(baseline)) {
        const actual = computed[slug] ?? [];
        for (const related of expected) {
            if (!actual.includes(related)) {
                gaps.push(`${slug} missing ${related}`);
            }
        }
    }
    return gaps;
}
