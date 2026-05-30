#!/usr/bin/env node
// Scaffold a new registry component: directory, manifest (with ADR 0003 metadata),
// manifest.json order entries, and changelogs.json stub.
//
// Usage:
//   node scripts/scaffold-component.mjs <slug> [--hero] [--tags tag1,tag2]
//   pnpm new:component <slug> [--hero] [--tags tag1,tag2]

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const REGISTRY_DIR = path.join(REPO_ROOT, "registry");
const COMPONENTS_DIR = path.join(REGISTRY_DIR, "components");

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;
const DEFAULT_COMPATIBILITY = {
    react: "18+",
    next: "14+",
    tailwind: "3+|4+",
    rsc: false,
    ssr: true,
};
const DEFAULT_PEER_DEPS = ["react", "react-dom"];

/** @param {string[]} argv */
export function parseArgs(argv) {
    const positional = [];
    let hero = false;
    let tags = ["ui"];

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === "--hero") {
            hero = true;
        } else if (arg === "--tags") {
            const next = argv[++i];
            if (!next) throw new Error("--tags requires a comma-separated value");
            tags = next.split(",").map((t) => t.trim()).filter(Boolean);
        } else if (arg.startsWith("-")) {
            throw new Error(`Unknown flag: ${arg}`);
        } else {
            positional.push(arg);
        }
    }

    const slug = positional[0];
    if (!slug) throw new Error("Usage: scaffold-component.mjs <slug> [--hero] [--tags a,b]");
    if (!SLUG_RE.test(slug)) throw new Error(`Invalid slug "${slug}" (kebab-case a-z0-9-)`);
    if (tags.length === 0) throw new Error("At least one tag is required");

    return { slug, hero, tags };
}

/** @param {string} slug @param {boolean} hero */
export function resolveComponentPaths(slug, hero) {
    if (hero) {
        if (!slug.startsWith("hero-")) {
            throw new Error(`Hero block slugs must start with "hero-" (got "${slug}")`);
        }
        const short = slug.slice("hero-".length);
        return {
            registryFilePath: `blocks/hero/${short}/component.tsx`,
            sourceDir: path.join(REGISTRY_DIR, "blocks", "hero", short),
        };
    }
    return {
        registryFilePath: `${slug}/component.tsx`,
        sourceDir: path.join(REGISTRY_DIR, slug),
    };
}

/** @param {string} slug */
export function titleFromSlug(slug) {
    return slug
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

/** @param {string} slug @param {boolean} hero */
export function componentStub(slug, hero) {
    const exportName = titleFromSlug(slug).replace(/\s+/g, "");
    return `"use client";

import { cn } from "@/lib/utils";

export function ${exportName}({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      {/* TODO: implement ${slug} */}
    </div>
  );
}
${hero ? `\nexport default ${exportName};\n` : ""}`;
}

/** @param {{ slug: string; hero: boolean; tags: string[]; registryFilePath: string }} opts */
export function buildManifest({ slug, hero, tags, registryFilePath }) {
    const title = titleFromSlug(slug);
    return {
        slug,
        registry: {
            dependencies: ["motion", "clsx", "tailwind-merge"],
            files: [{ path: registryFilePath, type: "registry:ui" }],
        },
        docs: {
            name: title,
            description: `TODO: describe ${title}.`,
            icon: "LucideSparkles",
            category: hero ? "Hero" : "Components",
            ...(hero ? { kind: "block" } : {}),
            props: [
                {
                    name: "className",
                    type: "string",
                    description: "CSS classes for external style overrides.",
                },
            ],
            usageCode: `import { ${title.replace(/\s+/g, "")} } from "@/components/ui/${slug}";\n\nexport default function Example() {\n  return <${title.replace(/\s+/g, "")} />;\n}`,
        },
        tags,
        peerDependencies: DEFAULT_PEER_DEPS,
        compatibility: DEFAULT_COMPATIBILITY,
        accessibility: { status: "unaudited" },
    };
}

/** @param {string} file @param {unknown} data */
function writeJson(file, data) {
    fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

/** @param {string} slug @param {boolean} hero @param {string[]} tags */
export function scaffoldComponent(slug, hero, tags, repoRoot = REPO_ROOT) {
    const { registryFilePath, sourceDir } = resolveComponentPaths(slug, hero);
    const manifestPath = path.join(repoRoot, "registry", "components", `${slug}.json`);
    const componentFile = path.join(sourceDir, "component.tsx");

    if (fs.existsSync(manifestPath)) {
        throw new Error(`Manifest already exists: registry/components/${slug}.json`);
    }
    if (fs.existsSync(componentFile)) {
        throw new Error(`Component already exists: ${path.relative(repoRoot, componentFile)}`);
    }

    const manifestJsonPath = path.join(repoRoot, "registry", "manifest.json");
    const manifest = JSON.parse(fs.readFileSync(manifestJsonPath, "utf8"));
    if (manifest.order.includes(slug) || manifest.docsOrder.includes(slug)) {
        throw new Error(`Slug "${slug}" already listed in registry/manifest.json`);
    }

    fs.mkdirSync(sourceDir, { recursive: true });
    fs.writeFileSync(componentFile, componentStub(slug, hero));

    writeJson(manifestPath, buildManifest({ slug, hero, tags, registryFilePath }));
    manifest.order.push(slug);
    manifest.docsOrder.push(slug);
    writeJson(manifestJsonPath, manifest);

    const changelogs = JSON.parse(fs.readFileSync(path.join(repoRoot, "registry", "changelogs.json"), "utf8"));
    const today = new Date().toISOString().slice(0, 10);
    changelogs[slug] = [{ version: "1.0.0", date: today, changes: ["Initial release."] }];
    writeJson(path.join(repoRoot, "registry", "changelogs.json"), changelogs);

    return {
        slug,
        componentFile: path.relative(repoRoot, componentFile),
        manifestPath: path.relative(repoRoot, manifestPath),
    };
}

function main() {
    try {
        const { slug, hero, tags } = parseArgs(process.argv.slice(2));
        const result = scaffoldComponent(slug, hero, tags);
        console.log(`Scaffolded ${result.slug}:`);
        console.log(`  - ${result.componentFile}`);
        console.log(`  - ${result.manifestPath}`);
        console.log(`  - registry/manifest.json (order + docsOrder)`);
        console.log(`  - registry/changelogs.json`);
        console.log("");
        console.log("Next (judgment — use add-component skill):");
        console.log("  1. Implement component.tsx + motion/a11y");
        console.log("  2. Add demo to registry/{slug}/demo.tsx and append key to registry/demos/demo-key-order.json");
        console.log("  3. Fill docs overview/scenarios in the manifest");
        console.log("  4. Set motion/accessibility/tags on the manifest");
        console.log("  5. pnpm build:registry");
    } catch (err) {
        console.error(err instanceof Error ? err.message : err);
        process.exit(1);
    }
}

function sameFile(a, b) {
    if (!a || !b) return false;
    const norm = (p) => path.resolve(p).toLowerCase();
    return norm(a) === norm(b);
}

if (sameFile(process.argv[1], fileURLToPath(import.meta.url))) {
    main();
}
