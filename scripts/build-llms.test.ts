import { describe, expect, it } from "vitest";

import { renderLlmsIndex, renderLlmsFull, SITE_URL, type LlmsComponent } from "./build-llms";

// Why these tests matter: llms.txt is what AI editors (Cursor, Claude Code)
// read to discover and install components. A component missing from the index,
// a relative URL, or usage code dropped from llms-full.txt silently breaks
// AI-driven installs — the files must be a complete, absolute-URL mirror of
// the registry.

const component: LlmsComponent = {
    slug: "magnetic-button",
    name: "Magnetic Button",
    description: "Button that stretches toward\nthe cursor when nearby.",
    category: "Components",
    tags: ["button", "hover"],
    peerDependencies: ["react >=18"],
    props: [
        { name: "magneticStrength", type: "number", default: "0.3", description: "Pull strength." },
        { name: "className", type: "string", description: "Style overrides." },
        { name: "size", type: '"sm" | "lg"', default: '"sm"', description: "Button size." },
    ],
    usageCode: 'import { MagneticButton } from "@/components/ui/magnetic-button";',
    overview: "A button with spring physics.",
    scenarios: [
        {
            title: "CTA row",
            description: "Two buttons side by side.",
            code: "<MagneticButton>Get started</MagneticButton>",
        },
    ],
};

const block: LlmsComponent = {
    slug: "glow-hero-section",
    name: "Glow Hero Section",
    description: "Full hero block with glow background.",
    kind: "block",
    props: [],
};

describe("renderLlmsIndex", () => {
    const index = renderLlmsIndex([component, block]);

    it("lists every component and block with an absolute docs URL", () => {
        expect(index).toContain(
            `- [Magnetic Button](${SITE_URL}/components/magnetic-button): Button that stretches toward the cursor when nearby.`,
        );
        // Blocks must route under /blocks, not /components — the /components
        // URL 404s for block slugs.
        expect(index).toContain(`- [Glow Hero Section](${SITE_URL}/blocks/glow-hero-section):`);
    });

    it("separates blocks from components and reports accurate counts", () => {
        expect(index).toContain("## Blocks");
        expect(index).toContain("1 animated React components and 1 hero blocks");
    });

    it("points agents at llms-full.txt and both registry manifests", () => {
        expect(index).toContain(`${SITE_URL}/llms-full.txt`);
        expect(index).toContain(`${SITE_URL}/r/registry.json`);
        expect(index).toContain(`${SITE_URL}/registry.json`);
    });

    it("omits the Blocks section when there are no blocks", () => {
        expect(renderLlmsIndex([component])).not.toContain("## Blocks");
    });
});

describe("renderLlmsFull", () => {
    const full = renderLlmsFull([component, block]);

    it("includes install commands for both CLIs per component", () => {
        expect(full).toContain("`npx uniqueui add magnetic-button`");
        expect(full).toContain(`npx shadcn@latest add ${SITE_URL}/r/magnetic-button.json`);
    });

    it("renders props with defaults so agents can configure components", () => {
        expect(full).toContain("| `magneticStrength` | `number` | `0.3` | Pull strength. |");
        // No default → em dash, not an empty cell that breaks the table.
        expect(full).toContain("| `className` | `string` | — | Style overrides. |");
    });

    it("escapes pipes in union types so they don't split table cells", () => {
        // GFM treats unescaped `|` as a column separator even inside code
        // spans — an unescaped union type shifts every following cell.
        expect(full).toContain('| `size` | `"sm" \\| "lg"` | `"sm"` | Button size. |');
    });

    it("includes usage code and scenario code verbatim in tsx fences", () => {
        expect(full).toContain(
            '```tsx\nimport { MagneticButton } from "@/components/ui/magnetic-button";\n```',
        );
        expect(full).toContain("### Scenario: CTA row");
        expect(full).toContain("<MagneticButton>Get started</MagneticButton>");
    });

    it("skips optional sections for sparse entries instead of emitting empty ones", () => {
        const blockSection = full.slice(full.indexOf("## Glow Hero Section"));
        expect(blockSection).not.toContain("### Props");
        expect(blockSection).not.toContain("### Usage");
        expect(blockSection).not.toContain("- Tags:");
    });
});
