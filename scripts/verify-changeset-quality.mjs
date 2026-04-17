#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const changesetDir = path.join(repoRoot, ".changeset");
const minSummaryLength = 24;
const minWordCount = 5;

const weakSummaries = new Set([
  "wip",
  "todo",
  "tbd",
  "n/a",
  "na",
  "placeholder",
  "misc",
  "update",
  "updates",
  "changes",
  "fixes",
  "bug fixes",
  "internal changes",
  "internal update",
]);

function normalizeSummary(text) {
  return text.toLowerCase().replace(/[`"'*~_]/g, "").replace(/\s+/g, " ").trim();
}

function extractSummary(markdown) {
  const lines = markdown.split(/\r?\n/);
  let delimiterCount = 0;
  let bodyStart = 0;

  for (let index = 0; index < lines.length; index += 1) {
    if (lines[index].trim() === "---") {
      delimiterCount += 1;
      if (delimiterCount === 2) {
        bodyStart = index + 1;
        break;
      }
    }
  }

  if (delimiterCount < 2) {
    return "";
  }

  const bodyLines = lines.slice(bodyStart).map((line) => line.trim()).filter(Boolean);
  return bodyLines.join(" ").trim();
}

function isLikelyTicketOnly(summary) {
  return /^[A-Z]{2,10}-\d+$/i.test(summary.trim());
}

function validateSummary(summary) {
  const issues = [];
  const normalized = normalizeSummary(summary);
  const wordCount = summary.split(/\s+/).filter(Boolean).length;

  if (!summary) {
    issues.push("Missing summary text after frontmatter.");
    return issues;
  }

  if (summary.length < minSummaryLength) {
    issues.push(
      `Summary is too short (${summary.length} chars). Use at least ${minSummaryLength} characters.`,
    );
  }

  if (wordCount < minWordCount) {
    issues.push(`Summary is too short (${wordCount} words). Use at least ${minWordCount} words.`);
  }

  if (weakSummaries.has(normalized)) {
    issues.push("Summary looks like a placeholder. Describe the user-visible change.");
  }

  if (isLikelyTicketOnly(summary)) {
    issues.push("Summary appears to be ticket-only. Include user-facing context.");
  }

  return issues;
}

async function listChangesetFiles() {
  const entries = await fs.readdir(changesetDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => name.endsWith(".md") && name.toLowerCase() !== "readme.md")
    .sort();
}

async function main() {
  let files = [];
  try {
    files = await listChangesetFiles();
  } catch (error) {
    console.error(`ERROR: Could not read ${changesetDir}`);
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  if (files.length === 0) {
    console.log("No changeset files found. Skipping quality checks.");
    return;
  }

  const failures = [];

  for (const fileName of files) {
    const filePath = path.join(changesetDir, fileName);
    const content = await fs.readFile(filePath, "utf8");
    const summary = extractSummary(content);
    const issues = validateSummary(summary);

    if (issues.length > 0) {
      failures.push({ fileName, issues });
    }
  }

  if (failures.length === 0) {
    console.log(`Checked ${files.length} changeset file(s): all summaries look good.`);
    return;
  }

  console.error("Changeset quality check failed:\n");
  for (const failure of failures) {
    console.error(`- .changeset/${failure.fileName}`);
    for (const issue of failure.issues) {
      console.error(`  - ${issue}`);
    }
  }

  console.error(
    "\nGuidance: explain what users get or what behavior changed, not implementation details.",
  );
  process.exit(1);
}

main().catch((error) => {
  console.error("Unexpected error during changeset quality verification.");
  console.error(error instanceof Error ? error.stack : String(error));
  process.exit(1);
});
