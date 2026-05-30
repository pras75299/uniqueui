// Tests guard the *intent* of the reduced-motion gate: manifest `motion` fields
// must stay in lockstep with what component sources actually do, and a `"full"`
// stance must be backed by a real guard.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import {
    checkMotionConsistency,
    detectMotionUsage,
    detectReducedMotionGuard,
    readMotionMapFromManifests,
    runCheck,
    slugFromComponentPath,
} from "./check-reduced-motion.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REGISTRY_DIR = path.resolve(__dirname, "..", "registry");

describe("detectMotionUsage", () => {
    it("flags an import from 'motion/react' — the canonical entry point", () => {
        expect(detectMotionUsage('import { motion } from "motion/react";')).toBe(true);
    });

    it("flags a `<motion.div>` JSX usage even without an explicit hook import", () => {
        expect(detectMotionUsage('return <motion.div animate={{ x: 5 }} />;')).toBe(true);
    });

    it("flags a Framer-style `animate=` prop — covers components built without the hooks", () => {
        expect(detectMotionUsage('<div animate={{ y: 0 }} />')).toBe(true);
    });

    it("flags `useScroll` / `useTransform` / `useAnimationFrame` — scroll-linked APIs are motion too", () => {
        expect(detectMotionUsage("const { scrollY } = useScroll();")).toBe(true);
        expect(detectMotionUsage("useAnimationFrame((t) => {});")).toBe(true);
    });

    it("does not flag a component with only static JSX", () => {
        expect(detectMotionUsage('export default function X() { return <div>hi</div>; }')).toBe(false);
    });
});

describe("detectReducedMotionGuard", () => {
    it("flags `useReducedMotion` — the React hook reads window.matchMedia for the user pref", () => {
        expect(detectReducedMotionGuard("const reduce = useReducedMotion();")).toBe(true);
    });

    it("flags the `prefers-reduced-motion` CSS query — non-hook path for keyframe-only components", () => {
        expect(detectReducedMotionGuard('@media (prefers-reduced-motion: reduce) { ... }')).toBe(true);
    });

    it("does not flag a component with no guard", () => {
        expect(detectReducedMotionGuard("const x = useState(0);")).toBe(false);
    });
});

describe("slugFromComponentPath", () => {
    it("derives the slug for a flat component path", () => {
        const abs = path.join(REGISTRY_DIR, "moving-border", "component.tsx");
        expect(slugFromComponentPath(REGISTRY_DIR, abs)).toBe("moving-border");
    });

    it("derives the `hero-` prefix for hero block paths — mirrors the registry manifest slug convention", () => {
        const abs = path.join(REGISTRY_DIR, "blocks", "hero", "logo-marquee", "component.tsx");
        expect(slugFromComponentPath(REGISTRY_DIR, abs)).toBe("hero-logo-marquee");
    });

    it("throws on an unrecognized layout — forces the developer to extend coverage when a new block kind lands", () => {
        const abs = path.join(REGISTRY_DIR, "blocks", "footer", "x", "component.tsx");
        expect(() => slugFromComponentPath(REGISTRY_DIR, abs)).toThrow(/Unrecognized component path/);
    });
});

describe("checkMotionConsistency", () => {
    it("returns no problems when metadata matches source", () => {
        const result = checkMotionConsistency({
            motionMap: {
                a: { reducedMotion: "full" },
                b: { reducedMotion: "none" },
            },
            components: [
                { slug: "a", usesMotion: true, hasGuard: true },
                { slug: "b", usesMotion: true, hasGuard: false },
                { slug: "c", usesMotion: false, hasGuard: false },
            ],
        });
        expect(result).toEqual({ missing: [], stray: [], unguardedFull: [], strayUnknown: [] });
    });

    it("flags a component that uses motion but is absent from metadata — would ship undeclared animation", () => {
        const result = checkMotionConsistency({
            motionMap: {},
            components: [{ slug: "a", usesMotion: true, hasGuard: false }],
        });
        expect(result.missing).toEqual(["a"]);
    });

    it("flags a stray metadata entry for a non-motion component — typically stale after a rewrite", () => {
        const result = checkMotionConsistency({
            motionMap: { a: { reducedMotion: "full" } },
            components: [{ slug: "a", usesMotion: false, hasGuard: false }],
        });
        expect(result.stray).toEqual(["a"]);
    });

    it("flags a `\"full\"` claim with no guard in source — the load-bearing invariant of this gate", () => {
        const result = checkMotionConsistency({
            motionMap: { a: { reducedMotion: "full" } },
            components: [{ slug: "a", usesMotion: true, hasGuard: false }],
        });
        expect(result.unguardedFull).toEqual(["a"]);
    });

    it("does NOT flag a `\"none\"` opt-out without a guard — explicit opt-outs are the documented escape hatch", () => {
        const result = checkMotionConsistency({
            motionMap: { a: { reducedMotion: "none" } },
            components: [{ slug: "a", usesMotion: true, hasGuard: false }],
        });
        expect(result.unguardedFull).toEqual([]);
    });

    it("flags a metadata slug that doesn't match any component file — guards against typos", () => {
        const result = checkMotionConsistency({
            motionMap: { ghost: { reducedMotion: "full" } },
            components: [{ slug: "a", usesMotion: false, hasGuard: false }],
        });
        expect(result.strayUnknown).toEqual(["ghost"]);
    });
});

describe("readMotionMapFromManifests", () => {
    it("builds a slug map from manifest motion fields", () => {
        const dir = path.join(REGISTRY_DIR, "components");
        const map = readMotionMapFromManifests(dir);
        expect(map["hero-terminal"]?.reducedMotion).toBe("full");
    });

    it("throws when manifest slug does not match filename", () => {
        const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "motion-manifest-"));
        fs.writeFileSync(
            path.join(tmp, "demo-card.json"),
            JSON.stringify({ slug: "wrong-slug", motion: { reducedMotion: "none" } }),
        );
        expect(() => readMotionMapFromManifests(tmp)).toThrow(/does not match filename/);
        fs.rmSync(tmp, { recursive: true, force: true });
    });
});

describe("repository state", () => {
    it("current registry passes the reduced-motion gate", () => {
        const result = runCheck();
        expect(result).toEqual({ missing: [], stray: [], unguardedFull: [], strayUnknown: [] });
    });
});
