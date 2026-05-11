import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

import { afterEach, describe, expect, it } from "vitest";

const tempDirs: string[] = [];

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
});

function createFixtureRepo() {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), "docs-metadata-friction-"));
  tempDirs.push(repoRoot);

  fs.mkdirSync(path.join(repoRoot, "scripts"), { recursive: true });
  fs.mkdirSync(path.join(repoRoot, "registry"), { recursive: true });
  fs.mkdirSync(path.join(repoRoot, "docs", "maintainers"), { recursive: true });

  fs.copyFileSync(
    path.join(process.cwd(), "scripts", "docs-metadata-friction.mjs"),
    path.join(repoRoot, "scripts", "docs-metadata-friction.mjs")
  );
  fs.copyFileSync(
    path.join(process.cwd(), "registry", "docs.json"),
    path.join(repoRoot, "registry", "docs.json")
  );
  fs.copyFileSync(
    path.join(process.cwd(), "docs", "maintainers", "docs-metadata-friction-log.md"),
    path.join(repoRoot, "docs", "maintainers", "docs-metadata-friction-log.md")
  );

  return repoRoot;
}

describe("docs metadata friction script", () => {
  it("keeps --append working without extra manual flags", () => {
    const repoRoot = createFixtureRepo();
    const scriptPath = path.join(repoRoot, "scripts", "docs-metadata-friction.mjs");
    const logPath = path.join(repoRoot, "docs", "maintainers", "docs-metadata-friction-log.md");

    const output = execFileSync("node", [scriptPath, "--append"], {
      cwd: repoRoot,
      encoding: "utf8",
    });

    expect(output).toContain("Appended row");

    const logContents = fs.readFileSync(logPath, "utf8");
    const rows = logContents
      .split("\n")
      .filter((line) => line.startsWith("| 20") && line.includes("| pending |"));

    expect(rows).toHaveLength(1);
    expect(rows[0]).toContain("| pending | pending | pending | pending |");
  });
});
