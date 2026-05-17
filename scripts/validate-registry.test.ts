// Tests for `scripts/validate-registry.lib.mjs`. These guard the *intent*
// of the validator: if a future change to `build-registry.ts` produced
// malformed artifacts (bad slug, missing files, slug-set drift across the
// shadcn / split / monolithic copies), CI must reject the build.

import { describe, expect, it } from "vitest";

import {
  RegistryArray,
  RegistryEntry,
  ShadcnItem,
  ShadcnManifest,
  SplitIndex,
  crossCheckSlugs,
  validate,
  // @ts-expect-error — .mjs module without ambient types
} from "./validate-registry.lib.mjs";

const goodEntry = {
  name: "moving-border",
  dependencies: ["motion", "clsx", "tailwind-merge"],
  files: [
    {
      path: "moving-border/component.tsx",
      content: "export {}",
      type: "registry:ui",
    },
  ],
  tailwindConfig: { theme: { extend: { animation: { x: "y 1s" } } } },
};

const goodShadcnItem = {
  name: "moving-border",
  type: "registry:ui",
  title: "Moving Border",
  description: "desc",
  dependencies: ["motion"],
  files: [
    {
      path: "components/ui/moving-border.tsx",
      type: "registry:component",
      target: "components/ui/moving-border.tsx",
    },
  ],
};

const goodShadcnManifest = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "uniqueui",
  homepage: "https://uniqueui-platform.vercel.app",
  items: [goodShadcnItem],
};

describe("RegistryEntry", () => {
  it("accepts a well-formed entry", () => {
    expect(validate(RegistryEntry, goodEntry).ok).toBe(true);
  });

  it("rejects entries with an uppercase slug — slugs must be kebab-case for URL paths", () => {
    const bad = { ...goodEntry, name: "MovingBorder" };
    const r = validate(RegistryEntry, bad);
    expect(r.ok).toBe(false);
    expect(r.errors.join("\n")).toMatch(/kebab-case/);
  });

  it("rejects entries with an empty files array — every component must ship at least one file", () => {
    const bad = { ...goodEntry, files: [] };
    expect(validate(RegistryEntry, bad).ok).toBe(false);
  });

  it("rejects unknown file types — guards against typos like 'registry:components' shipping silently", () => {
    const bad = { ...goodEntry, files: [{ ...goodEntry.files[0], type: "registry:component" }] };
    expect(validate(RegistryEntry, bad).ok).toBe(false);
  });

  it("rejects npm dependency names with spaces — the CLI passes these to `npm install`", () => {
    const bad = { ...goodEntry, dependencies: ["motion react"] };
    expect(validate(RegistryEntry, bad).ok).toBe(false);
  });
});

describe("RegistryArray", () => {
  it("rejects empty arrays — a registry with zero entries is always a build bug", () => {
    expect(validate(RegistryArray, []).ok).toBe(false);
  });
});

describe("SplitIndex", () => {
  it("accepts a minimal index", () => {
    expect(validate(SplitIndex, { components: ["a", "b-c"] }).ok).toBe(true);
  });

  it("rejects an index with bad slugs", () => {
    expect(validate(SplitIndex, { components: ["A"] }).ok).toBe(false);
  });
});

describe("ShadcnItem / ShadcnManifest", () => {
  it("accepts the canonical shape", () => {
    expect(validate(ShadcnItem, goodShadcnItem).ok).toBe(true);
    expect(validate(ShadcnManifest, goodShadcnManifest).ok).toBe(true);
  });

  it("rejects manifest with non-URL homepage — the manifest is fetched by shadcn CLI users", () => {
    const bad = { ...goodShadcnManifest, homepage: "not a url" };
    expect(validate(ShadcnManifest, bad).ok).toBe(false);
  });
});

describe("crossCheckSlugs", () => {
  it("returns no mismatches when all sources agree", () => {
    const root = [{ name: "a" }, { name: "b" }];
    const result = crossCheckSlugs({
      root,
      splitIndex: { components: ["a", "b"] },
      publicMono: root,
      shadcnManifest: { items: [{ name: "a" }, { name: "b" }] },
    });
    expect(result).toEqual([]);
  });

  it("flags a slug that exists in registry.json but is missing from the split index — would 404 for CLI users", () => {
    const result = crossCheckSlugs({
      root: [{ name: "a" }, { name: "b" }],
      splitIndex: { components: ["a"] },
      publicMono: null,
      shadcnManifest: null,
    });
    expect(result.some((m) => m.includes('missing "b"'))).toBe(true);
  });

  it("flags a stray slug in the split index — would advertise a component CLI can't fetch", () => {
    const result = crossCheckSlugs({
      root: [{ name: "a" }],
      splitIndex: { components: ["a", "ghost"] },
      publicMono: null,
      shadcnManifest: null,
    });
    expect(result.some((m) => m.includes('stray "ghost"'))).toBe(true);
  });

  it("flags shadcn manifest gaps — keeps the two distribution channels in lockstep", () => {
    const result = crossCheckSlugs({
      root: [{ name: "a" }, { name: "b" }],
      splitIndex: null,
      publicMono: null,
      shadcnManifest: { items: [{ name: "a" }] },
    });
    expect(result.some((m) => m.includes('shadcn manifest missing "b"'))).toBe(true);
  });
});
