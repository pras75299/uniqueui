#!/usr/bin/env node
// Guard against agent instruction files drifting away from CLAUDE.md as the
// single source of truth. Pointer files must stay thin; stale workflows must
// not reappear in copies.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");

/** @type {readonly string[]} */
export const POINTER_FILES = [
    ".cursorrules",
    ".windsurfrules",
    "AGENTS.md",
    "GEMINI.md",
];

export const MAX_POINTER_LINES = 10;

export const CANONICAL_POINTER =
    /canonical agent rules live in[\s\S]*?CLAUDE\.md/i;

/** Patterns that must not appear in thin pointer files (stale duplicated guidance). */
export const STALE_POINTER_PATTERNS = [
    { label: "registry/config.ts workflow", pattern: /registry\/config\.ts/ },
    {
        label: "flat registry/{name}.tsx path",
        pattern: /registry\/\{component[^/]*\}\.tsx/,
    },
    {
        label: "hand-edit apps/www/components/ui",
        pattern: /apps\/www\/components\/ui\/\{component/,
    },
    {
        label: "duplicate component workflow heading",
        pattern: /Adding a New Component/i,
    },
    {
        label: "graph-before-grep mandate",
        pattern: /ALWAYS use the[\s\S]*code-review-graph MCP tools BEFORE using Grep/i,
    },
    {
        label: "code-review-graph MCP blurb",
        pattern: /## MCP Tools: code-review-graph/,
    },
];

/**
 * @param {string} content
 * @param {string} filePath
 * @returns {string[]}
 */
export function validatePointerFile(content, filePath) {
    const errors = [];
    const nonEmptyLines = content.split(/\r?\n/).filter((line) => line.trim() !== "");

    if (nonEmptyLines.length > MAX_POINTER_LINES) {
        errors.push(
            `${filePath}: ${nonEmptyLines.length} non-empty lines exceeds max ${MAX_POINTER_LINES}`,
        );
    }

    if (!CANONICAL_POINTER.test(content)) {
        errors.push(`${filePath}: missing canonical CLAUDE.md pointer sentence`);
    }

    for (const { label, pattern } of STALE_POINTER_PATTERNS) {
        if (pattern.test(content)) {
            errors.push(`${filePath}: contains stale content (${label})`);
        }
    }

    return errors;
}

/**
 * @param {string} repoRoot
 * @returns {{ ok: boolean; errors: string[] }}
 */
export function checkAgentDocsDrift(repoRoot = REPO_ROOT) {
    const errors = [];

    const claudePath = path.join(repoRoot, "CLAUDE.md");
    if (!fs.existsSync(claudePath)) {
        errors.push("CLAUDE.md: canonical agent rules file missing");
    }

    let referenceContent = null;

    for (const relPath of POINTER_FILES) {
        const absPath = path.join(repoRoot, relPath);
        if (!fs.existsSync(absPath)) {
            errors.push(`${relPath}: file missing`);
            continue;
        }
        const content = fs.readFileSync(absPath, "utf8");
        errors.push(...validatePointerFile(content, relPath));

        if (referenceContent === null) {
            referenceContent = content;
        } else if (content !== referenceContent) {
            errors.push(
                `${relPath}: content differs from ${POINTER_FILES[0]} (pointer files must stay identical)`,
            );
        }
    }

    return { ok: errors.length === 0, errors };
}

function main() {
    const { ok, errors } = checkAgentDocsDrift();

    if (!ok) {
        console.error("Agent instruction pointer files drifted from policy:\n");
        for (const err of errors) {
            console.error(`  - ${err}`);
        }
        console.error(
            "\nFix: keep pointer files thin and point at CLAUDE.md. See scripts/check-agent-docs-drift.mjs.",
        );
        process.exit(1);
    }

    console.log(
        `Agent docs OK (${POINTER_FILES.length} pointer files ≤ ${MAX_POINTER_LINES} lines, canonical CLAUDE.md reference present).`,
    );
}

// Run only when invoked directly, not on import. On Windows, argv[1] and
// fileURLToPath may differ by drive-letter case; normalize both before
// comparing so `node scripts\check-agent-docs-drift.mjs` still runs main().
function sameFile(a, b) {
    if (!a || !b) return false;
    const norm = (p) => path.resolve(p).toLowerCase();
    return norm(a) === norm(b);
}

if (sameFile(process.argv[1], __filename)) {
    main();
}
