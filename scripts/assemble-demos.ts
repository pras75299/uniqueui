import fs from "fs-extra";
import path from "path";

const REGISTRY_DIR = path.join(__dirname, "../registry");
const SHARED_FILE = path.join(REGISTRY_DIR, "demos/shared.tsx");
const KEY_ORDER_FILE = path.join(REGISTRY_DIR, "demos/demo-key-order.json");

async function collectDemoFragmentPaths(): Promise<string[]> {
  const paths: string[] = [];

  async function walk(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "demos" && dir === REGISTRY_DIR) continue;
        await walk(abs);
        continue;
      }
      if (entry.name !== "demo.tsx") continue;
      if (abs.includes(`${path.sep}demos${path.sep}`)) continue;
      paths.push(abs);
    }
  }

  await walk(REGISTRY_DIR);
  return paths.sort((a, b) => a.localeCompare(b));
}

function extractDemoEntriesBody(source: string): string {
  const marker = "export const demoEntries";
  const start = source.indexOf(marker);
  if (start === -1) {
    throw new Error("demo fragment missing `export const demoEntries`");
  }

  const braceStart = source.indexOf("{", start);
  let depth = 0;
  let inString: string | null = null;
  let escape = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = braceStart; i < source.length; i++) {
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
        return source.slice(braceStart + 1, i);
      }
    }
  }

  throw new Error("Unbalanced braces in demoEntries");
}

function splitTopLevelEntries(objectBody: string): Map<string, string> {
  const map = new Map<string, string>();
  let braceDepth = 0;
  let parenDepth = 0;
  let bracketDepth = 0;
  let entryStart = 0;
  let inString: string | null = null;
  let escape = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i <= objectBody.length; i++) {
    const c = objectBody[i];
    const next = objectBody[i + 1];

    if (i === objectBody.length) {
      const tail = objectBody.slice(entryStart).replace(/,\s*$/, "");
      if (tail) {
        const key = parseEntryKey(tail);
        map.set(key, tail);
      }
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
      if (chunk) {
        const key = parseEntryKey(chunk);
        map.set(key, chunk);
      }
      entryStart = i + 1;
    }
  }

  return map;
}

function parseEntryKey(entry: string): string {
  const stripped = entry.replace(/^(?:\s*\/\/[^\n]*\n)+/, "").trim();
  const quoted = stripped.match(/^"([^"]+)":/);
  if (quoted) return quoted[1];
  const bare = stripped.match(/^([A-Za-z0-9_-]+):/);
  if (bare) return bare[1];
  throw new Error(`Could not parse demo key from: ${stripped.slice(0, 80)}`);
}

export async function assembleDemosSource(): Promise<string> {
  if (!(await fs.pathExists(SHARED_FILE))) {
    throw new Error(`Missing shared demos preamble at ${SHARED_FILE}`);
  }
  if (!(await fs.pathExists(KEY_ORDER_FILE))) {
    throw new Error(`Missing demo key order at ${KEY_ORDER_FILE}`);
  }

  const shared = (await fs.readFile(SHARED_FILE, "utf-8")).trimEnd();
  const keyOrder = JSON.parse(await fs.readFile(KEY_ORDER_FILE, "utf-8")) as string[];

  const fragmentPaths = await collectDemoFragmentPaths();

  const entriesByKey = new Map<string, string>();
  for (const fragmentPath of fragmentPaths) {
    const source = await fs.readFile(fragmentPath, "utf-8");
    for (const [key, chunk] of splitTopLevelEntries(extractDemoEntriesBody(source))) {
      if (entriesByKey.has(key)) {
        throw new Error(`Duplicate demo key "${key}" in ${fragmentPath}`);
      }
      entriesByKey.set(key, chunk);
    }
  }

  const orderedChunks: string[] = [];
  for (const key of keyOrder) {
    const chunk = entriesByKey.get(key);
    if (!chunk) {
      throw new Error(`Missing demo entry for key "${key}"`);
    }
    orderedChunks.push(chunk);
  }

  if (entriesByKey.size !== keyOrder.length) {
    const extras = [...entriesByKey.keys()].filter((k) => !keyOrder.includes(k));
    throw new Error(`demo-key-order.json out of sync — extra keys: ${extras.join(", ")}`);
  }

  const mergedObjectBody = orderedChunks.join(",");
  return `${shared}\n\nexport const componentDemos: Record<string, DemoComponent> = {${mergedObjectBody},\n};\n`;
}
