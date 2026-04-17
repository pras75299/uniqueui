import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const sourcePath = path.join(rootDir, "packages/cli/CHANGELOG.md");
const targetPath = path.join(rootDir, "CHANGELOG.md");

const intro = `# Changelog

This file mirrors \`packages/cli/CHANGELOG.md\` and is updated by \`pnpm version-packages\`.
Do not edit it manually.

---

`;

async function syncRootChangelog() {
  try {
    const sourceContent = await readFile(sourcePath, "utf8");
    await mkdir(path.dirname(targetPath), { recursive: true });
    await copyFile(sourcePath, targetPath);

    if (!sourceContent.startsWith("# Changelog")) {
      await writeFile(targetPath, `${intro}${sourceContent}`, "utf8");
    }

    console.log(`Synced root changelog from ${sourcePath}`);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      console.log("No package changelog found yet; skipping root changelog sync.");
      return;
    }
    throw error;
  }
}

await syncRootChangelog();
