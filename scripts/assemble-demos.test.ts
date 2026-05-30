import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { assembleDemosSource } from "./assemble-demos";
import {
  extractDemoEntriesBody,
  parseDemoKeyOrder,
  splitTopLevelEntries,
  stripGeneratedDemosBanner,
} from "./demo-entries-parser";

const ROOT = path.join(__dirname, "..");
const GENERATED_DEMOS = path.join(ROOT, "apps/www/config/demos.tsx");
const KEY_ORDER_FILE = path.join(ROOT, "registry/demos/demo-key-order.json");
const REGISTRY_DIR = path.join(ROOT, "registry");
const DEMOS_META_DIR = path.join(REGISTRY_DIR, "demos");

function collectFragmentKeys(): Set<string> {
  const keys = new Set<string>();

  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (abs === DEMOS_META_DIR) continue;
        walk(abs);
        continue;
      }
      if (entry.name !== "demo.tsx") continue;
      const source = fs.readFileSync(abs, "utf-8");
      for (const key of splitTopLevelEntries(extractDemoEntriesBody(source)).keys()) {
        keys.add(key);
      }
    }
  }

  walk(REGISTRY_DIR);
  return keys;
}

describe("assemble-demos", () => {
  it("matches generated apps/www/config/demos.tsx body", async () => {
    expect(fs.existsSync(GENERATED_DEMOS), "run pnpm build:registry first").toBe(true);

    const assembled = stripGeneratedDemosBanner(await assembleDemosSource());
    const generated = stripGeneratedDemosBanner(fs.readFileSync(GENERATED_DEMOS, "utf-8"));

    expect(assembled).toBe(generated);
  });

  it("keeps demo-key-order.json in sync with fragment keys", () => {
    const keyOrder = parseDemoKeyOrder(
      JSON.parse(fs.readFileSync(KEY_ORDER_FILE, "utf-8")),
    );
    const fragmentKeys = collectFragmentKeys();

    expect([...fragmentKeys].sort()).toEqual([...keyOrder].sort());
  });
});
