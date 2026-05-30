#!/usr/bin/env node
// Reduced-motion enforcement gate.
//
// Cross-checks each component manifest's optional `motion` field against
// actual component source so the metadata cannot silently drift from the code.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const REGISTRY_DIR = path.join(REPO_ROOT, "registry");
const COMPONENTS_DIR = path.join(REGISTRY_DIR, "components");

// Motion-API detection. Intentionally broad: catches the `motion.div` /
// `<motion.span>` pattern, the `motion/react` import line itself, the
// `useAnimationFrame` / `useScroll` / `useTransform` hooks, and Framer-style
// `animate=` prop usage. Adding a new API to motion/react that bypasses all
// of these is a code-smell; extend the regex when it happens.
const MOTION_USAGE_RE =
    /from\s+["']motion\/react["']|motion\.[A-Za-z]+|<motion\.|useAnimationFrame\b|useScroll\b|useTransform\b|\banimate=/;

// Guard detection. Either the React hook (which reads
// `window.matchMedia('(prefers-reduced-motion: reduce)')`) or the CSS query
// itself satisfies the invariant. The CSS path is allowed because some
// non-React-state animations (e.g. raw CSS keyframes) genuinely cannot use
// the hook.
const GUARD_RE = /useReducedMotion\b|prefers-reduced-motion/;

/**
 * Walk `dir` and yield every `component.tsx` under `registry/`. The two
 * shapes covered: `registry/<slug>/component.tsx` and
 * `registry/blocks/hero/<x>/component.tsx`. New layouts must be added here
 * AND mirrored in `slugFromComponentPath`.
 */
export function listComponentFiles(registryDir) {
    const out = [];
    for (const top of fs.readdirSync(registryDir, { withFileTypes: true })) {
        if (!top.isDirectory()) continue;
        if (top.name === "blocks") {
            const blocksDir = path.join(registryDir, "blocks");
            for (const kind of fs.readdirSync(blocksDir, { withFileTypes: true })) {
                if (!kind.isDirectory()) continue;
                const kindDir = path.join(blocksDir, kind.name);
                for (const item of fs.readdirSync(kindDir, { withFileTypes: true })) {
                    if (!item.isDirectory()) continue;
                    const file = path.join(kindDir, item.name, "component.tsx");
                    if (fs.existsSync(file)) out.push(file);
                }
            }
            continue;
        }
        const file = path.join(registryDir, top.name, "component.tsx");
        if (fs.existsSync(file)) out.push(file);
    }
    return out;
}

/**
 * Mirror of the slug-naming convention used by the registry manifests (`registry/components/<slug>.json`):
 *   registry/<slug>/component.tsx                 → <slug>
 *   registry/blocks/hero/<x>/component.tsx        → hero-<x>
 * Throws on an unrecognized layout so a new directory shape can't silently
 * drop out of coverage.
 */
export function slugFromComponentPath(registryDir, absPath) {
    const rel = path.relative(registryDir, absPath).split(path.sep).join("/");
    const heroMatch = /^blocks\/hero\/([^/]+)\/component\.tsx$/.exec(rel);
    if (heroMatch) return `hero-${heroMatch[1]}`;
    const flatMatch = /^([^/]+)\/component\.tsx$/.exec(rel);
    if (flatMatch) return flatMatch[1];
    throw new Error(
        `Unrecognized component path layout: ${rel}. Extend slugFromComponentPath to cover it.`,
    );
}

export function detectMotionUsage(source) {
    return MOTION_USAGE_RE.test(source);
}

export function detectReducedMotionGuard(source) {
    return GUARD_RE.test(source);
}

/**
 * Pure consistency check. Given a parsed `motionMap` (slug → entry) and a
 * list of `components` ({ slug, usesMotion, hasGuard }), return three
 * disjoint problem sets:
 *
 *   - `missing`:        component uses motion APIs but no manifest `motion` field.
 *   - `stray`:          manifest `motion` entry but component doesn't use motion.
 *   - `unguardedFull`:  manifest claims `"full"` but source lacks a guard.
 *
 * Stray slugs that aren't even in the component list (e.g. typo) come back
 * as `strayUnknown`.
 */
export function checkMotionConsistency({ motionMap, components }) {
    const missing = [];
    const stray = [];
    const unguardedFull = [];
    const strayUnknown = [];

    const bySlug = new Map(components.map((c) => [c.slug, c]));

    for (const c of components) {
        const entry = motionMap[c.slug];
        if (c.usesMotion && !entry) {
            missing.push(c.slug);
            continue;
        }
        if (!c.usesMotion && entry) {
            stray.push(c.slug);
            continue;
        }
        if (entry && entry.reducedMotion === "full" && !c.hasGuard) {
            unguardedFull.push(c.slug);
        }
    }
    for (const slug of Object.keys(motionMap)) {
        if (!bySlug.has(slug)) strayUnknown.push(slug);
    }

    return { missing, stray, unguardedFull, strayUnknown };
}

export function readMotionMapFromManifests(componentsDir) {
    if (!fs.existsSync(componentsDir)) {
        throw new Error(`registry/components not found at ${componentsDir}`);
    }
    const map = {};
    for (const file of fs.readdirSync(componentsDir)) {
        if (!file.endsWith(".json")) continue;
        const slugFromFile = file.replace(/\.json$/, "");
        const manifest = JSON.parse(
            fs.readFileSync(path.join(componentsDir, file), "utf8"),
        );
        if (manifest.slug !== slugFromFile) {
            throw new Error(
                `registry/components/${file}: slug "${manifest.slug}" does not match filename`,
            );
        }
        if (manifest.motion) {
            map[manifest.slug] = manifest.motion;
        }
    }
    return map;
}

export function runCheck({ registryDir = REGISTRY_DIR, componentsDir = COMPONENTS_DIR } = {}) {
    const motionMap = readMotionMapFromManifests(componentsDir);
    const componentFiles = listComponentFiles(registryDir);
    const components = componentFiles.map((file) => {
        const source = fs.readFileSync(file, "utf8");
        return {
            slug: slugFromComponentPath(registryDir, file),
            usesMotion: detectMotionUsage(source),
            hasGuard: detectReducedMotionGuard(source),
        };
    });
    return checkMotionConsistency({ motionMap, components });
}

function main() {
    const result = runCheck();
    const { missing, stray, unguardedFull, strayUnknown } = result;
    const total = missing.length + stray.length + unguardedFull.length + strayUnknown.length;

    if (total === 0) {
        const covered = Object.keys(readMotionMapFromManifests(COMPONENTS_DIR)).length;
        console.log(`Reduced-motion check OK — ${covered} motion-using component(s) covered.`);
        return;
    }

    console.error("Reduced-motion gate failed:\n");
    if (missing.length > 0) {
        console.error(`  Components use motion APIs but have no manifest motion field (${missing.length}):`);
        for (const s of missing) console.error(`    ✗ ${s}`);
        console.error(`    → Add \`"motion": { "reducedMotion": "full" | "partial" | "none" }\` to registry/components/${missing[0]}.json.`);
        console.error("");
    }
    if (stray.length > 0) {
        console.error(`  Manifest motion entries for components with NO motion APIs (${stray.length}):`);
        for (const s of stray) console.error(`    ✗ ${s}`);
        console.error("    → Remove the entry; the component doesn't animate.");
        console.error("");
    }
    if (unguardedFull.length > 0) {
        console.error(`  Manifest claims \`reducedMotion: "full"\` but the source has no guard (${unguardedFull.length}):`);
        for (const s of unguardedFull) console.error(`    ✗ ${s}`);
        console.error('    → Add `useReducedMotion` (from "motion/react") or a `prefers-reduced-motion` CSS query, OR downgrade the metadata to "partial" / "none" with `performanceNotes`.');
        console.error("");
    }
    if (strayUnknown.length > 0) {
        console.error(`  Manifest motion slugs with no corresponding component file (${strayUnknown.length}):`);
        for (const s of strayUnknown) console.error(`    ✗ ${s}`);
        console.error("    → Typo or stale rename. Remove the entry.");
        console.error("");
    }
    process.exit(1);
}

function sameFile(a, b) {
    if (!a || !b) return false;
    const norm = (p) => path.resolve(p).toLowerCase();
    return norm(a) === norm(b);
}

if (sameFile(process.argv[1], __filename)) {
    main();
}
