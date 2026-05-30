import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
    computeRelatedSlugsForSlug,
    computeRelatedSlugsMap,
    computeUsedByBlocksMap,
    crossLinksCoverBaseline,
    crossLinksFromManifests,
} from "./compute-cross-links";

const REPO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const COMPONENTS_DIR = path.join(REPO_ROOT, "registry", "components");

/** Pre-A4 hand-maintained baseline (main@91f934f) — computed output must cover these links. */
const LEGACY_RELATED_BASELINE: Record<string, string[]> = {
    "3d-tilt-card": ["ambient-glow-card", "flip-card", "hover-reveal-card", "spotlight-card"],
    "ambient-glow-card": ["3d-tilt-card", "hover-reveal-card", "spotlight-card"],
    "aurora-background": ["shader-mesh-gradient"],
    "blur-reveal": ["gradient-text-reveal"],
    "border-beam": ["moving-border"],
    "chromatic-aberration-reveal": ["scroll-reveal"],
    "cursor-trail": ["interactive-cursor"],
    "dot-grid-background": ["shooting-stars-grid"],
    "flip-card": ["3d-tilt-card"],
    "gradient-text-reveal": ["blur-reveal", "shiny-text"],
    "hero-magnetic-letters": ["magnetic-text"],
    "horizontal-scroll-gallery": ["infinite-marquee", "scroll-reveal"],
    "hover-reveal-card": ["3d-tilt-card", "ambient-glow-card", "spotlight-card"],
    "infinite-marquee": ["horizontal-scroll-gallery", "scroll-reveal"],
    "interactive-cursor": ["cursor-trail"],
    "kinetic-variable-headline": ["outlined-mega-mark"],
    "macbook-mock": ["mini-mac-keyboard"],
    "mini-mac-keyboard": ["macbook-mock"],
    "moving-border": ["border-beam"],
    "outlined-mega-mark": ["kinetic-variable-headline"],
    "scroll-reveal": ["chromatic-aberration-reveal", "horizontal-scroll-gallery", "infinite-marquee"],
    "shader-mesh-gradient": ["aurora-background"],
    "shiny-text": ["gradient-text-reveal"],
    "shooting-stars-grid": ["dot-grid-background"],
    "spotlight-card": ["3d-tilt-card", "ambient-glow-card", "hover-reveal-card"],
};

const LEGACY_USED_BY_BLOCKS: Record<string, string[]> = {
    "aurora-background": ["hero-liquid-aurora-mesh"],
    "dot-grid-background": ["hero-noise-dot-field"],
    "infinite-marquee": ["hero-logo-marquee"],
    "magnetic-text": ["hero-magnetic-letters"],
};

function loadManifestTagsBySlug(): Record<string, string[]> {
    const tagsBySlug: Record<string, string[]> = {};
    for (const file of fs.readdirSync(COMPONENTS_DIR)) {
        if (!file.endsWith(".json")) continue;
        const slug = file.replace(/\.json$/, "");
        const manifest = JSON.parse(fs.readFileSync(path.join(COMPONENTS_DIR, file), "utf8"));
        tagsBySlug[slug] = manifest.tags ?? [];
    }
    return tagsBySlug;
}

describe("computeRelatedSlugsMap", () => {
    const tagsBySlug = {
        "3d-tilt-card": ["card", "tilt", "3d"],
        "ambient-glow-card": ["card", "glow", "ambient"],
        "flip-card": ["card", "flip", "3d"],
        "hover-reveal-card": ["card", "hover", "reveal"],
        "spotlight-card": ["card", "spotlight", "hover"],
        "shader-mesh-gradient": ["background", "shader", "gradient"],
        "aurora-background": ["background", "aurora", "gradient"],
    };

    it("links 3d-tilt-card to flip-card in the toy fixture", () => {
        const related = computeRelatedSlugsForSlug(
            "3d-tilt-card",
            tagsBySlug["3d-tilt-card"],
            Object.keys(tagsBySlug),
            tagsBySlug,
        );
        expect(related).toContain("flip-card");
    });

    it("links aurora-background and shader-mesh-gradient via shared tags", () => {
        const map = computeRelatedSlugsMap(Object.keys(tagsBySlug), tagsBySlug);
        expect(map["aurora-background"]).toContain("shader-mesh-gradient");
        expect(map["shader-mesh-gradient"]).toContain("aurora-background");
    });
});

describe("computeUsedByBlocksMap", () => {
    const tagsBySlug = {
        "aurora-background": ["background", "aurora", "gradient"],
        "hero-liquid-aurora-mesh": ["hero", "block", "aurora", "mesh", "liquid"],
        "magnetic-text": ["text", "magnetic", "interactive"],
        "hero-magnetic-letters": ["hero", "block", "text", "magnetic"],
        "hero-noise-dot-field": ["hero", "block", "noise", "dot", "field"],
    };

    it("maps components to hero blocks via discriminative tag overlap", () => {
        const map = computeUsedByBlocksMap(Object.keys(tagsBySlug), tagsBySlug);
        expect(map["aurora-background"]).toEqual(["hero-liquid-aurora-mesh"]);
        expect(map["magnetic-text"]).toEqual(["hero-magnetic-letters"]);
    });
});

describe("repository manifests", () => {
    it("computed relatedSlugs covers the pre-A4 hand-maintained baseline", () => {
        const tagsBySlug = loadManifestTagsBySlug();
        const slugs = Object.keys(tagsBySlug).sort();
        const { relatedSlugsMap } = crossLinksFromManifests(
            Object.fromEntries(slugs.map((s) => [s, { tags: tagsBySlug[s] }])),
            slugs,
        );
        const gaps = crossLinksCoverBaseline(LEGACY_RELATED_BASELINE, relatedSlugsMap);
        expect(gaps, gaps.join("\n")).toEqual([]);
    });

    it("computed usedByBlocks matches the pre-A4 hand-maintained baseline", () => {
        const tagsBySlug = loadManifestTagsBySlug();
        const slugs = Object.keys(tagsBySlug).sort();
        const { usedByBlocksMap } = crossLinksFromManifests(
            Object.fromEntries(slugs.map((s) => [s, { tags: tagsBySlug[s] }])),
            slugs,
        );
        expect(usedByBlocksMap).toMatchObject(LEGACY_USED_BY_BLOCKS);
    });
});
