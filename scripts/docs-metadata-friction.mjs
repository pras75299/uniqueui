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

function getArgValue(flag) {
  const argv = process.argv.slice(2);
  const index = argv.indexOf(flag);
  if (index === -1) return null;
  return argv[index + 1] ?? null;
}

function normalizeYesNoArg(value) {
  return value === null ? null : value.trim().toLowerCase();
}

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
    {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }
  ).trim();
  touches30d = gitOut ? gitOut.split(/\r?\n/).length : 0;
} catch {
  touches30d = 0;
}

const c1Triggered = lineCount > 1500 || sizeKb > 200;
const date = new Date().toISOString().slice(0, 10);
const conflictsRaw = getArgValue("--conflicts");
const ownershipNeed = normalizeYesNoArg(getArgValue("--ownership"));
const toolingNeed = normalizeYesNoArg(getArgValue("--tooling"));
const action = getArgValue("--action");
const conflicts = conflictsRaw !== null ? Number.parseInt(conflictsRaw, 10) : null;
const c2Triggered = conflicts !== null && Number.isFinite(conflicts) ? conflicts >= 3 : null;
const c3Triggered = ownershipNeed === "yes" ? true : ownershipNeed === "no" ? false : null;
const c4Triggered = toolingNeed === "yes" ? true : toolingNeed === "no" ? false : null;
// Manual C2-C4 metadata is either omitted entirely, partially supplied (invalid), or fully supplied.
const hasAnyManualField =
  conflictsRaw !== null || ownershipNeed !== null || toolingNeed !== null || action !== null;
const hasAllManualFields =
  conflicts !== null &&
  c3Triggered !== null &&
  c4Triggered !== null &&
  action;
// metCount stays null until every manual condition is known, because partial input cannot produce a valid tally.
const metCount =
  c2Triggered === null || c3Triggered === null || c4Triggered === null
    ? null
    : [c1Triggered, c2Triggered, c3Triggered, c4Triggered].filter(Boolean).length;
const row =
  // No manual fields: append a row with placeholders for maintainers to fill later.
  !hasAnyManualField
    ? `| ${date} | ${lineCount} | ${sizeKb} | ${touches30d} | ${c1Triggered ? "yes" : "no"} | pending | pending | pending | pending | pending |`
    // Some manual fields are missing or invalid: refuse to build a partial row.
    : !hasAllManualFields || metCount === null
      ? null
      // All manual fields are present: emit the fully populated log row.
      : `| ${date} | ${lineCount} | ${sizeKb} | ${touches30d} | ${c1Triggered ? "yes" : "no"} | ${conflicts} | ${ownershipNeed} | ${toolingNeed} | ${metCount} | ${action} |`;

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
  if (hasAllManualFields && row) {
    console.log(`\nProposed log row:\n${row}`);
  } else if (!hasAnyManualField) {
    console.log("\n`--append` will add a row with `pending` manual columns for maintainers to fill in.");
  } else {
    console.log("\nProvide --conflicts <n> --ownership <yes|no> --tooling <yes|no> --action <text> to generate an appendable log row.");
  }
  process.exit(0);
}

if (!row) {
  console.error("ERROR: Partial manual fields supplied. Provide all of --conflicts <n> --ownership <yes|no> --tooling <yes|no> --action <text>, or omit them all.");
  process.exit(1);
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
