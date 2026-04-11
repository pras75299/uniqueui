// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { componentsList } from "../config/components";
import { componentDemos } from "../config/demos";
import { docsScenarios } from "../config/docs-scenarios";
import { registryComponentSlugs } from "../config/component-registry";

describe("Component metadata sync", () => {
  it("keeps docs components and registry component slugs aligned", () => {
    const docsSlugs = componentsList.map((component) => component.slug).sort();
    const registrySlugs = [...registryComponentSlugs].sort();

    expect(docsSlugs).toEqual(registrySlugs);
  });

  it("keeps docs scenarios scoped to known components", () => {
    const docsSlugSet = new Set(componentsList.map((component) => component.slug));

    for (const slug of Object.keys(docsScenarios)) {
      expect(docsSlugSet.has(slug)).toBe(true);
    }
  });

  it("has a demo entry for every component page path", () => {
    for (const component of componentsList) {
      if (component.variants?.length) {
        for (const variant of component.variants) {
          expect(componentDemos[variant.demoKey]).toBeDefined();
        }
        continue;
      }

      expect(componentDemos[component.slug]).toBeDefined();
    }
  });
});
