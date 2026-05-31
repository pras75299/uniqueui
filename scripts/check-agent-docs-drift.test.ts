import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

import {
    CANONICAL_POINTER,
    MAX_POINTER_LINES,
    POINTER_FILES,
    checkAgentDocsDrift,
    normalizePointerContent,
    validatePointerFile,
} from "./check-agent-docs-drift.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const VALID_POINTER = `# Agent instructions

This project's canonical agent rules live in [\`CLAUDE.md\`](./CLAUDE.md). Read it before any change to this repository.
`;

const tempDirs: string[] = [];

afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
        fs.rmSync(dir, { recursive: true, force: true });
    }
});

function makeTempRepo(files: Record<string, string>) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-docs-drift-"));
    tempDirs.push(dir);
    for (const [relPath, content] of Object.entries(files)) {
        const absPath = path.join(dir, relPath);
        fs.mkdirSync(path.dirname(absPath), { recursive: true });
        fs.writeFileSync(absPath, content, "utf8");
    }
    return dir;
}

describe("validatePointerFile", () => {
    it("accepts a thin CLAUDE.md pointer", () => {
        expect(validatePointerFile(VALID_POINTER, "AGENTS.md")).toEqual([]);
    });

    it("requires the canonical pointer sentence", () => {
        const errors = validatePointerFile("# Other rules\nDo stuff.", "AGENTS.md");
        expect(errors.some((e) => e.includes("missing canonical CLAUDE.md pointer"))).toBe(
            true,
        );
    });

    it("rejects files that exceed the line budget", () => {
        const bloated = `${VALID_POINTER}\n${"extra line\n".repeat(MAX_POINTER_LINES)}`;
        const errors = validatePointerFile(bloated, ".cursorrules");
        expect(errors.some((e) => e.includes("exceeds max"))).toBe(true);
    });

    it("rejects stale registry/config.ts workflow copies", () => {
        const stale = `${VALID_POINTER}\nUpdate registry/config.ts when adding components.`;
        const errors = validatePointerFile(stale, "GEMINI.md");
        expect(errors.some((e) => e.includes("registry/config.ts"))).toBe(true);
    });

    it("rejects re-pasted graph-before-grep mandate", () => {
        const stale = `${VALID_POINTER}\nALWAYS use the code-review-graph MCP tools BEFORE using Grep.`;
        const errors = validatePointerFile(stale, ".windsurfrules");
        expect(errors.some((e) => e.includes("graph-before-grep"))).toBe(true);
    });

    it("rejects monolithic registry/demos.tsx workflow copies", () => {
        const stale = `${VALID_POINTER}\nEdit registry/demos.tsx when adding a demo.`;
        const errors = validatePointerFile(stale, "AGENTS.md");
        expect(errors.some((e) => e.includes("registry/demos.tsx"))).toBe(true);
    });

    it("rejects global registry/changelogs.json workflow copies", () => {
        const stale = `${VALID_POINTER}\nUpdate registry/changelogs.json when shipping.`;
        const errors = validatePointerFile(stale, "GEMINI.md");
        expect(errors.some((e) => e.includes("registry/changelogs.json"))).toBe(true);
    });
});

describe("normalizePointerContent", () => {
    it("treats CRLF and LF as equivalent for identity checks", () => {
        const lf = "line one\nline two\n";
        const crlf = "line one\r\nline two\r\n";
        expect(normalizePointerContent(lf)).toBe(normalizePointerContent(crlf));
    });
});

describe("CANONICAL_POINTER", () => {
    it("matches markdown link and plain CLAUDE.md references", () => {
        expect(
            CANONICAL_POINTER.test(
                "canonical agent rules live in [`CLAUDE.md`](./CLAUDE.md)",
            ),
        ).toBe(true);
        expect(CANONICAL_POINTER.test("canonical agent rules live in CLAUDE.md")).toBe(
            true,
        );
    });
});

describe("checkAgentDocsDrift", () => {
    it("passes on the current repository pointer files", () => {
        const { ok, errors } = checkAgentDocsDrift(REPO_ROOT);
        expect(errors).toEqual([]);
        expect(ok).toBe(true);
    });

    it("fails when CLAUDE.md is missing", () => {
        const repo = makeTempRepo({
            ".cursorrules": VALID_POINTER,
        });
        const { ok, errors } = checkAgentDocsDrift(repo);
        expect(ok).toBe(false);
        expect(errors).toContain("CLAUDE.md: canonical agent rules file missing");
    });

    it("fails when a pointer file is missing", () => {
        const repo = makeTempRepo({
            "CLAUDE.md": "# Canonical\n",
            ".cursorrules": VALID_POINTER,
        });
        const { ok, errors } = checkAgentDocsDrift(repo);
        expect(ok).toBe(false);
        expect(errors.some((e) => e.includes("AGENTS.md: file missing"))).toBe(true);
    });

    it("fails when pointer files diverge", () => {
        const repo = makeTempRepo({
            "CLAUDE.md": "# Canonical\n",
            ".cursorrules": VALID_POINTER,
            ".windsurfrules": VALID_POINTER,
            "AGENTS.md": `${VALID_POINTER}\nExtra line.\n`,
            "GEMINI.md": VALID_POINTER,
        });
        const { ok, errors } = checkAgentDocsDrift(repo);
        expect(ok).toBe(false);
        expect(
            errors.some((e) =>
                e.includes("AGENTS.md: content differs from .cursorrules"),
            ),
        ).toBe(true);
    });

    it("treats CRLF vs LF pointer files as identical", () => {
        const crlfPointer = VALID_POINTER.replace(/\n/g, "\r\n");
        const files: Record<string, string> = {
            "CLAUDE.md": "# Canonical\n",
        };
        for (const relPath of POINTER_FILES) {
            files[relPath] = relPath === ".cursorrules" ? crlfPointer : VALID_POINTER;
        }
        const repo = makeTempRepo(files);
        const { ok, errors } = checkAgentDocsDrift(repo);
        expect(errors).toEqual([]);
        expect(ok).toBe(true);
    });
});
