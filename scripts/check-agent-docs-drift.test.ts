import { describe, expect, it } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
    CANONICAL_POINTER,
    MAX_POINTER_LINES,
    checkAgentDocsDrift,
    validatePointerFile,
} from "./check-agent-docs-drift.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const VALID_POINTER = `# Agent instructions

This project's canonical agent rules live in [\`CLAUDE.md\`](./CLAUDE.md). Read it before any change to this repository.
`;

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
});
