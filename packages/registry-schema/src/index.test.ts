// Tests guard the *intent* of the validator: if a future change to
// `build-registry.ts` produced malformed artifacts (bad slug, missing
// files, slug-set drift across the shadcn / split / monolithic copies,
// stale changelog ordering), CI must reject the build.

import path from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

import {
    ChangelogEntry,
    Changelogs,
    RegistryArray,
    RegistryEntry,
    ShadcnItem,
    ShadcnManifest,
    SplitIndex,
    crossCheckChangelogs,
    crossCheckSlugs,
    resolvePathUnderDir,
    validate,
} from "./index";

const goodChangelog = [
    { version: "1.0.0", date: "2026-05-20", changes: ["Initial release."] },
];

const goodEntry = {
    name: "moving-border",
    dependencies: ["motion", "clsx", "tailwind-merge"],
    files: [
        {
            path: "moving-border/component.tsx",
            content: "export {}",
            type: "registry:ui",
        },
    ],
    tailwindConfig: { theme: { extend: { animation: { x: "y 1s" } } } },
    meta: { version: "1.0.0" },
    changelog: goodChangelog,
};

const goodShadcnItem = {
    name: "moving-border",
    type: "registry:ui",
    title: "Moving Border",
    description: "desc",
    dependencies: ["motion"],
    files: [
        {
            path: "components/ui/moving-border.tsx",
            type: "registry:component",
            target: "components/ui/moving-border.tsx",
        },
    ],
};

const goodShadcnManifest = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "uniqueui",
    homepage: "https://uniqueui-platform.vercel.app",
    items: [goodShadcnItem],
};

describe("RegistryEntry", () => {
    it("accepts a well-formed entry", () => {
        expect(validate(RegistryEntry, goodEntry).ok).toBe(true);
    });

    it("rejects entries with an uppercase slug — slugs must be kebab-case for URL paths", () => {
        const bad = { ...goodEntry, name: "MovingBorder" };
        const r = validate(RegistryEntry, bad);
        expect(r.ok).toBe(false);
        if (!r.ok) expect(r.errors.join("\n")).toMatch(/kebab-case/);
    });

    it("rejects entries with an empty files array — every component must ship at least one file", () => {
        const bad = { ...goodEntry, files: [] };
        expect(validate(RegistryEntry, bad).ok).toBe(false);
    });

    it("rejects unknown file types — guards against typos like 'registry:components' shipping silently", () => {
        const bad = {
            ...goodEntry,
            files: [{ ...goodEntry.files[0], type: "registry:component" }],
        };
        expect(validate(RegistryEntry, bad).ok).toBe(false);
    });

    it("rejects npm dependency names with spaces — the CLI passes these to `npm install`", () => {
        const bad = { ...goodEntry, dependencies: ["motion react"] };
        expect(validate(RegistryEntry, bad).ok).toBe(false);
    });

    it("accepts a tailwindCss snippet alongside tailwindConfig — the v4 dual-artifact path", () => {
        const dual = {
            ...goodEntry,
            tailwindCss: "@theme {\n  --animate-x: x 1s linear infinite;\n}\n",
        };
        expect(validate(RegistryEntry, dual).ok).toBe(true);
    });

    it("rejects an empty tailwindCss string — an empty snippet would silently no-op on append", () => {
        const bad = { ...goodEntry, tailwindCss: "" };
        expect(validate(RegistryEntry, bad).ok).toBe(false);
    });
});

describe("RegistryArray", () => {
    it("rejects empty arrays — a registry with zero entries is always a build bug", () => {
        expect(validate(RegistryArray, []).ok).toBe(false);
    });
});

describe("SplitIndex", () => {
    it("accepts a minimal index", () => {
        expect(validate(SplitIndex, { components: ["a", "b-c"] }).ok).toBe(true);
    });

    it("rejects an index with bad slugs", () => {
        expect(validate(SplitIndex, { components: ["A"] }).ok).toBe(false);
    });
});

describe("ShadcnItem / ShadcnManifest", () => {
    it("accepts the canonical shape", () => {
        expect(validate(ShadcnItem, goodShadcnItem).ok).toBe(true);
        expect(validate(ShadcnManifest, goodShadcnManifest).ok).toBe(true);
    });

    it("rejects manifest with non-URL homepage — the manifest is fetched by shadcn CLI users", () => {
        const bad = { ...goodShadcnManifest, homepage: "not a url" };
        expect(validate(ShadcnManifest, bad).ok).toBe(false);
    });
});

describe("crossCheckSlugs", () => {
    it("returns no mismatches when all sources agree", () => {
        const root = [{ name: "a" }, { name: "b" }];
        const result = crossCheckSlugs({
            root,
            splitIndex: { components: ["a", "b"] },
            publicMono: root,
            shadcnManifest: { items: [{ name: "a" }, { name: "b" }] },
        });
        expect(result).toEqual([]);
    });

    it("flags a slug that exists in registry.json but is missing from the split index — would 404 for CLI users", () => {
        const result = crossCheckSlugs({
            root: [{ name: "a" }, { name: "b" }],
            splitIndex: { components: ["a"] },
            publicMono: null,
            shadcnManifest: null,
        });
        expect(result.some((m) => m.includes('missing "b"'))).toBe(true);
    });

    it("flags a stray slug in the split index — would advertise a component CLI can't fetch", () => {
        const result = crossCheckSlugs({
            root: [{ name: "a" }],
            splitIndex: { components: ["a", "ghost"] },
            publicMono: null,
            shadcnManifest: null,
        });
        expect(result.some((m) => m.includes('stray "ghost"'))).toBe(true);
    });

    it("flags shadcn manifest gaps — keeps the two distribution channels in lockstep", () => {
        const result = crossCheckSlugs({
            root: [{ name: "a" }, { name: "b" }],
            splitIndex: null,
            publicMono: null,
            shadcnManifest: { items: [{ name: "a" }] },
        });
        expect(result.some((m) => m.includes('shadcn manifest missing "b"'))).toBe(
            true,
        );
    });

    it("flags stray slugs in shadcn manifest — symmetric to the gap check; a rename or stale entry would otherwise ship a slug the registry can't back", () => {
        const result = crossCheckSlugs({
            root: [{ name: "a" }],
            splitIndex: null,
            publicMono: null,
            shadcnManifest: { items: [{ name: "a" }, { name: "ghost" }] },
        });
        expect(
            result.some((m) => m.includes('shadcn manifest has stray "ghost"')),
        ).toBe(true);
    });
});

describe("RegistryEntry: meta.version + changelog (Phase 8a)", () => {
    it("rejects an entry missing meta — every registry item must carry a version", () => {
        const { meta: _meta, ...bad } = goodEntry;
        const r = validate(RegistryEntry, bad);
        expect(r.ok).toBe(false);
        if (!r.ok) expect(r.errors.join("\n")).toMatch(/meta/);
    });

    it("rejects a non-semver meta.version — 'latest' or branch labels would silently propagate", () => {
        const bad = { ...goodEntry, meta: { version: "latest" } };
        const r = validate(RegistryEntry, bad);
        expect(r.ok).toBe(false);
        if (!r.ok) expect(r.errors.join("\n")).toMatch(/MAJOR\.MINOR\.PATCH/);
    });

    it("rejects an entry whose changelog is empty — version with no history is meaningless", () => {
        const bad = { ...goodEntry, changelog: [] };
        expect(validate(RegistryEntry, bad).ok).toBe(false);
    });
});

describe("Changelogs / ChangelogEntry", () => {
    it("accepts a well-formed changelogs map", () => {
        const data = { "moving-border": goodChangelog };
        expect(validate(Changelogs, data).ok).toBe(true);
    });

    it("rejects a bad ISO date — drives release timeline UI; bad dates would mis-sort", () => {
        const bad = { version: "1.0.0", date: "May 20, 2026", changes: ["x"] };
        const r = validate(ChangelogEntry, bad);
        expect(r.ok).toBe(false);
        if (!r.ok) expect(r.errors.join("\n")).toMatch(/YYYY-MM-DD/);
    });

    it("rejects empty change strings — UI renders these as empty bullets", () => {
        const bad = { version: "1.0.0", date: "2026-05-20", changes: ["  "] };
        expect(validate(ChangelogEntry, bad).ok).toBe(false);
    });

    it("rejects regex-valid but impossible calendar dates — 'YYYY-MM-DD' shape isn't enough", () => {
        // Month 13 and day 40 pass the regex but aren't real dates.
        for (const date of ["2026-13-40", "2026-02-30", "2023-02-29"]) {
            const bad = { version: "1.0.0", date, changes: ["x"] };
            expect(
                validate(ChangelogEntry, bad).ok,
                `expected ${date} to fail`,
            ).toBe(false);
        }
    });

    it("accepts Feb 29 in leap years — the calendar refinement must not over-reject", () => {
        const good = { version: "1.0.0", date: "2024-02-29", changes: ["leap day"] };
        expect(validate(ChangelogEntry, good).ok).toBe(true);
    });

    it("rejects out-of-order changelog entries — newest-first ordering is load-bearing for meta.version", () => {
        // 1.0.0 before 1.1.0 = ascending = wrong. Newest must come first.
        const bad = {
            a: [
                { version: "1.0.0", date: "2026-05-20", changes: ["init"] },
                { version: "1.1.0", date: "2026-05-21", changes: ["feature"] },
            ],
        };
        const r = validate(Changelogs, bad);
        expect(r.ok).toBe(false);
        if (!r.ok) expect(r.errors.join("\n")).toMatch(/newest-first/);
    });

    it("rejects duplicate versions within a slug — version reuse breaks `update` warnings", () => {
        const bad = {
            a: [
                { version: "1.0.0", date: "2026-05-21", changes: ["second"] },
                { version: "1.0.0", date: "2026-05-20", changes: ["first"] },
            ],
        };
        expect(validate(Changelogs, bad).ok).toBe(false);
    });
});

describe("crossCheckChangelogs", () => {
    const root = [
        { name: "a", meta: { version: "1.0.0" } },
        { name: "b", meta: { version: "1.2.0" } },
    ];

    it("returns no mismatches when versions line up with changelog heads", () => {
        const changelogs = {
            a: [{ version: "1.0.0", date: "2026-05-20", changes: ["init"] }],
            b: [
                { version: "1.2.0", date: "2026-05-21", changes: ["feature"] },
                { version: "1.1.0", date: "2026-05-20", changes: ["init"] },
            ],
        };
        expect(crossCheckChangelogs({ root, changelogs })).toEqual([]);
    });

    it("flags a registry slug with no changelog — would orphan version history", () => {
        const changelogs = {
            a: [{ version: "1.0.0", date: "2026-05-20", changes: ["init"] }],
        };
        const result = crossCheckChangelogs({ root, changelogs });
        expect(result.some((m) => m.includes('missing "b"'))).toBe(true);
    });

    it("flags a stray changelog slug — guards against renames leaving dead history behind", () => {
        const changelogs = {
            a: [{ version: "1.0.0", date: "2026-05-20", changes: ["init"] }],
            b: [{ version: "1.2.0", date: "2026-05-21", changes: ["feature"] }],
            ghost: [{ version: "1.0.0", date: "2026-05-20", changes: ["init"] }],
        };
        const result = crossCheckChangelogs({ root, changelogs });
        expect(result.some((m) => m.includes('stray "ghost"'))).toBe(true);
    });

    it("flags meta.version that doesn't match the changelog head — drives `uniqueui update` warnings", () => {
        const changelogs = {
            a: [{ version: "1.0.0", date: "2026-05-20", changes: ["init"] }],
            b: [{ version: "1.0.0", date: "2026-05-20", changes: ["init"] }],
        };
        const result = crossCheckChangelogs({ root, changelogs });
        expect(
            result.some(
                (m) => m.includes("meta.version mismatch") && m.includes('"b"'),
            ),
        ).toBe(true);
    });
});

describe("resolvePathUnderDir", () => {
    // The original test rooted at <repo>/registry. Re-derive that root from
    // this file's location: packages/registry-schema/src/ → ../../../registry.
    const root = path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        "..",
        "..",
        "..",
        "registry",
    );

    it("resolves a normal registry component path under the root", () => {
        const resolved = resolvePathUnderDir(
            root,
            "blocks/hero/logo-marquee/component.tsx",
        );
        expect(resolved).toBe(
            path.join(root, "blocks/hero/logo-marquee/component.tsx"),
        );
    });

    it("rejects path traversal outside the registry root", () => {
        expect(() => resolvePathUnderDir(root, "../package.json")).toThrow(
            /escapes registry root/,
        );
        expect(() =>
            resolvePathUnderDir(root, "blocks/../../package.json"),
        ).toThrow(/escapes registry root/);
    });

    it("rejects absolute paths", () => {
        expect(() => resolvePathUnderDir(root, "/etc/passwd")).toThrow(
            /must be relative/,
        );
    });
});
