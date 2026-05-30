import fs from "fs-extra";
import path from "path";
import {
  extractDemoEntriesBody,
  parseDemoKeyOrder,
  splitTopLevelEntries,
} from "./demo-entries-parser";

const REGISTRY_DIR = path.join(__dirname, "../registry");
const SHARED_FILE = path.join(REGISTRY_DIR, "demos/shared.tsx");
const KEY_ORDER_FILE = path.join(REGISTRY_DIR, "demos/demo-key-order.json");

async function collectDemoFragmentPaths(): Promise<string[]> {
  const paths: string[] = [];
  const demosMetaDir = path.join(REGISTRY_DIR, "demos");

  async function walk(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (abs === demosMetaDir) continue;
        await walk(abs);
        continue;
      }
      if (entry.name !== "demo.tsx") continue;
      paths.push(abs);
    }
  }

  await walk(REGISTRY_DIR);
  return paths;
}

export async function assembleDemosSource(): Promise<string> {
  if (!(await fs.pathExists(SHARED_FILE))) {
    throw new Error(`Missing shared demos preamble at ${SHARED_FILE}`);
  }
  if (!(await fs.pathExists(KEY_ORDER_FILE))) {
    throw new Error(`Missing demo key order at ${KEY_ORDER_FILE}`);
  }

  const shared = (await fs.readFile(SHARED_FILE, "utf-8")).trimEnd();
  const keyOrder = parseDemoKeyOrder(
    JSON.parse(await fs.readFile(KEY_ORDER_FILE, "utf-8")),
  );

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
