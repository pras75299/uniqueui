#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const docsJsonPath = path.join(repoRoot, "registry", "docs.json");
const logPath = path.join(repoRoot, "docs", "maintainers", "docs-metadata-friction-log.md");
const startMarker = "<!-- DOCS_METADATA_FRICTION_LOG_START -->";
const endMarker = "<!-- DOCS_METADATA_FRICTION_LOG_END -->";

const args = new Set(process.argv.slice(2));
const shouldAppend = args.has("--append");

if (!fs.existsSync(docsJsonPath)) {
  console.error(`ERROR: Missing ${docsJsonPath}`);
  process.exit(1);
}

if (!fs.existsSync(logPath)) {
  console.error(`ERROR: Missing ${logPath}`);
  process.exit(1);
}

const docsRaw = fs.readFileSync(docsJsonPath, "utf8");
const lineCount = docsRaw.split(/\r?\n/).length;
const sizeBytes = Buffer.byteLength(docsRaw, "utf8");
const sizeKb = Number((sizeBytes / 1024).toFixed(1));

let touches30d = 0;
try {
  const gitOut = execFileSync(
    "git",
    ["log", "--since=30 days ago", "--pretty=format:%H", "--", "registry/docs.json"],
    { cwd: repoRoot, encoding: "utf8" }
  ).trim();
  touches30d = gitOut ? gitOut.split(/\r?\n/).length : 0;
} catch {
  touches30d = 0;
}

const c1Triggered = lineCount > 1500 || sizeKb > 200;
const date = new Date().toISOString().slice(0, 10);
const row = `| ${date} | ${lineCount} | ${sizeKb} | ${touches30d} | ${c1Triggered ? "yes" : "no"} | TODO | TODO | TODO | TODO | TODO |`;

const summary = [
  "Docs metadata friction snapshot",
  `- registry/docs.json lines: ${lineCount}`,
  `- registry/docs.json size: ${sizeKb} KB`,
  `- touches in last 30 days: ${touches30d}`,
  `- C1 triggered (size/lines): ${c1Triggered ? "yes" : "no"}`,
  "",
  "ADR migration reminder:",
  "- Revisit split metadata when 2+ conditions (C1-C4) hold for more than one release cycle.",
  "- Fill C2-C4 manually in docs/maintainers/docs-metadata-friction-log.md."
].join("\n");

if (!shouldAppend) {
  console.log(summary);
  console.log(`\nProposed log row:\n${row}`);
  process.exit(0);
}

const logRaw = fs.readFileSync(logPath, "utf8");
const startIndex = logRaw.indexOf(startMarker);
const endIndex = logRaw.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
  console.error("ERROR: Could not find friction log markers in docs log file.");
  process.exit(1);
}

const insertionPoint = endIndex;
const beforeEnd = logRaw.slice(0, insertionPoint).trimEnd();
const afterEnd = logRaw.slice(insertionPoint);
const nextContent = `${beforeEnd}\n${row}\n${afterEnd}`;
fs.writeFileSync(logPath, nextContent, "utf8");

console.log(summary);
console.log(`\nAppended row to ${path.relative(repoRoot, logPath)}:\n${row}`);
