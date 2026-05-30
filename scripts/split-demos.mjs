#!/usr/bin/env node
/**
 * One-time codemod: split registry/demos.tsx into registry/demos/shared.tsx
 * and per-slug registry/{slug}/demo.tsx fragments.
 *
 * Run: node scripts/split-demos.mjs
 * Then: pnpm build:registry (assembler merges fragments into apps/www/config/demos.tsx)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const MONOLITH = path.join(ROOT, "registry/demos.tsx");

function demoKeyToRelPath(key) {
  if (key.startsWith("hero-")) {
    const blockSlug = key.slice("hero-".length);
    return path.join("registry/blocks/hero", blockSlug, "demo.tsx");
  }
  const primary = key.split("/")[0];
  return path.join("registry", primary, "demo.tsx");
}

function parseComponentDemosEntries(source) {
  const marker = "export const componentDemos";
  const start = source.indexOf(marker);
  if (start === -1) throw new Error("componentDemos export not found");

  const braceStart = source.indexOf("{", start);
  let depth = 0;
  let i = braceStart;
  let inString = null;
  let escape = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (; i < source.length; i++) {
    const c = source[i];
    const next = source[i + 1];

    if (inLineComment) {
      if (c === "\n") inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (c === "*" && next === "/") {
        inBlockComment = false;
        i++;
      }
      continue;
    }
    if (inString) {
      if (escape) {
        escape = false;
        continue;
      }
      if (c === "\\") {
        escape = true;
        continue;
      }
      if (c === inString) inString = null;
      continue;
    }

    if (c === "/" && next === "/") {
      inLineComment = true;
      i++;
      continue;
    }
    if (c === "/" && next === "*") {
      inBlockComment = true;
      i++;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      inString = c;
      continue;
    }
    if (c === "{") depth++;
    if (c === "}") {
      depth--;
      if (depth === 0) {
        return {
          preamble: source.slice(0, start).trimEnd(),
          objectBody: source.slice(braceStart + 1, i),
          suffix: source.slice(i + 1).trim(),
        };
      }
    }
  }

  throw new Error("Unbalanced braces in componentDemos");
}

function splitTopLevelEntries(objectBody) {
  const entries = [];
  let braceDepth = 0;
  let parenDepth = 0;
  let bracketDepth = 0;
  let entryStart = 0;
  let inString = null;
  let escape = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i <= objectBody.length; i++) {
    const c = objectBody[i];
    const next = objectBody[i + 1];

    if (i === objectBody.length) {
      const tail = objectBody.slice(entryStart).replace(/,\s*$/, "");
      if (tail) entries.push(tail);
      break;
    }

    if (inLineComment) {
      if (c === "\n") inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (c === "*" && next === "/") {
        inBlockComment = false;
        i++;
      }
      continue;
    }
    if (inString) {
      if (escape) {
        escape = false;
        continue;
      }
      if (c === "\\") {
        escape = true;
        continue;
      }
      if (c === inString) inString = null;
      continue;
    }

    if (c === "/" && next === "/") {
      inLineComment = true;
      i++;
      continue;
    }
    if (c === "/" && next === "*") {
      inBlockComment = true;
      i++;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      inString = c;
      continue;
    }
    if (c === "{") braceDepth++;
    if (c === "}") braceDepth--;
    if (c === "(") parenDepth++;
    if (c === ")") parenDepth--;
    if (c === "[") bracketDepth++;
    if (c === "]") bracketDepth--;
    if (
      c === "," &&
      braceDepth === 0 &&
      parenDepth === 0 &&
      bracketDepth === 0
    ) {
      const chunk = objectBody.slice(entryStart, i).replace(/,\s*$/, "");
      if (chunk) entries.push(chunk);
      entryStart = i + 1;
    }
  }

  return entries;
}

function stripLeadingComments(chunk) {
  return chunk.replace(/^(?:\s*\/\/[^\n]*\n)+/, "").trim();
}

function entryKey(entry) {
  const stripped = stripLeadingComments(entry);
  const quoted = stripped.match(/^"([^"]+)":/);
  if (quoted) return quoted[1];
  const bare = stripped.match(/^([A-Za-z0-9_-]+):/);
  if (bare) return bare[1];
  throw new Error(`Could not parse demo key from: ${stripped.slice(0, 80)}`);
}

function writeDemoFragment(relPath, keys, entryChunks) {
  const abs = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });

  const mergedEntries = entryChunks
    .map((chunk, index) => `${chunk.trimEnd()}${index < entryChunks.length - 1 ? "," : ""}`)
    .join("");

  fs.writeFileSync(
    abs,
    [
      "// Demo entries for docs previews — merged by `pnpm build:registry`.",
      "// Do not import this file directly from apps/www.",
      "",
      `export const demoEntries = {${mergedEntries}} as const;`,
      "",
    ].join("\n"),
  );
  console.log(`  wrote ${relPath} (${keys.join(", ")})`);
}

function main() {
  if (!fs.existsSync(MONOLITH)) {
    console.error("Missing registry/demos.tsx — already split?");
    process.exit(1);
  }

  const source = fs.readFileSync(MONOLITH, "utf-8");
  const { preamble, objectBody, suffix } = parseComponentDemosEntries(source);
  if (suffix && suffix !== ";") {
    throw new Error(`Unexpected content after componentDemos: ${suffix.slice(0, 80)}`);
  }

  const sharedPath = path.join(ROOT, "registry/demos/shared.tsx");
  fs.mkdirSync(path.dirname(sharedPath), { recursive: true });
  fs.writeFileSync(
    sharedPath,
    `${preamble.trimEnd()}\n`,
  );
  console.log(`wrote registry/demos/shared.tsx (${preamble.split("\n").length} lines)`);

  const rawEntries = splitTopLevelEntries(objectBody).filter((chunk) => {
    const stripped = stripLeadingComments(chunk);
    return /^"([^"]+)":/.test(stripped) || /^[A-Za-z0-9_-]+:/.test(stripped);
  });
  const byFile = new Map();

  for (const chunk of rawEntries) {
    const key = entryKey(chunk);
    const rel = demoKeyToRelPath(key);
    if (!byFile.has(rel)) byFile.set(rel, { keys: [], chunks: [] });
    const group = byFile.get(rel);
    group.keys.push(key);
    group.chunks.push(chunk);
  }

  const keyOrder = rawEntries.map(entryKey);

  console.log(`splitting ${rawEntries.length} demo entries into ${byFile.size} files`);
  for (const [rel, { keys, chunks }] of [...byFile.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    writeDemoFragment(rel, keys, chunks);
  }

  const orderPath = path.join(ROOT, "registry/demos/demo-key-order.json");
  fs.writeFileSync(orderPath, `${JSON.stringify(keyOrder, null, 2)}\n`);
  console.log(`wrote registry/demos/demo-key-order.json (${keyOrder.length} keys)`);

  fs.renameSync(MONOLITH, `${MONOLITH}.bak`);
  console.log("renamed registry/demos.tsx -> registry/demos.tsx.bak");
  console.log("Done. Run pnpm build:registry to verify byte-identical output.");
}

main();
