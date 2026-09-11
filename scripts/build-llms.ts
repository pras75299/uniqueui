// Render `llms.txt` (index) and `llms-full.txt` (full component reference)
// for AI editors and agents, following the llmstxt.org convention. Both files
// are generated from the per-slug registry manifests by `pnpm build:registry`
// and published from `apps/www/public/`.
//
// Pure render functions — the caller (build-registry.ts) assembles the input
// from the docs manifest + per-slug manifests so this module stays testable
// without touching the filesystem.

export const SITE_URL = "https://uniqueui-platform.vercel.app";

export type LlmsScenario = {
  title: string;
  description: string;
  code: string;
};

export type LlmsComponent = {
  slug: string;
  name: string;
  description: string;
  category?: string;
  /** "block" routes under /blocks instead of /components. */
  kind?: "block";
  tags?: string[];
  peerDependencies?: string[];
  props: Array<{ name: string; type: string; description: string; default?: string }>;
  usageCode?: string;
  overview?: string;
  scenarios?: LlmsScenario[];
};

function docsUrl(component: Pick<LlmsComponent, "slug" | "kind">): string {
  const segment = component.kind === "block" ? "blocks" : "components";
  return `${SITE_URL}/${segment}/${component.slug}`;
}

/** Collapse whitespace so multi-line descriptions stay one link per line. */
function oneLine(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function renderLlmsIndex(components: LlmsComponent[]): string {
  const items = components.filter((c) => c.kind !== "block");
  const blocks = components.filter((c) => c.kind === "block");

  const lines: string[] = [
    "# UniqueUI",
    "",
    `> UniqueUI is a copy-paste library of ${items.length} animated React components and ${blocks.length} hero blocks built on motion.dev springs and Tailwind CSS. Components are installed into your codebase (no runtime package): \`npx uniqueui add <slug>\` or, for shadcn/ui projects, \`npx shadcn@latest add ${SITE_URL}/r/<slug>.json\`.`,
    "",
    "Every component is a single self-contained `.tsx` file that accepts a `className` prop and uses the `motion` package (not `framer-motion`) plus `clsx`/`tailwind-merge`.",
    "",
    "## Docs",
    "",
    `- [Introduction](${SITE_URL}/docs): installation and quick start for both CLIs`,
    `- [Use with AI](${SITE_URL}/docs/ai): registry MCP setup for Cursor, Claude Code, and other AI editors`,
    `- [Theming](${SITE_URL}/docs/theming): Tailwind v3 preset and v4 @theme workflow`,
    `- [Compatibility](${SITE_URL}/docs/compatibility): verified Node, React, Next.js, and Tailwind versions`,
    "",
    "## Components",
    "",
    ...items.map((c) => `- [${c.name}](${docsUrl(c)}): ${oneLine(c.description)}`),
  ];

  if (blocks.length > 0) {
    lines.push("", "## Blocks", "");
    lines.push(...blocks.map((c) => `- [${c.name}](${docsUrl(c)}): ${oneLine(c.description)}`));
  }

  lines.push(
    "",
    "## Optional",
    "",
    `- [Full component reference](${SITE_URL}/llms-full.txt): props, usage code, and scenarios for every component`,
    `- [shadcn registry index](${SITE_URL}/r/registry.json): machine-readable registry manifest`,
    `- [UniqueUI CLI registry](${SITE_URL}/registry.json): manifest consumed by \`npx uniqueui add\``,
    "",
  );

  return lines.join("\n");
}

/**
 * Escape `|` so union types like `number | string` don't split the row into
 * extra columns — GFM treats any unescaped pipe (even inside a code span) as
 * a cell separator.
 */
function tableCell(text: string): string {
  return oneLine(text).replace(/\|/g, "\\|");
}

function renderPropsTable(props: LlmsComponent["props"]): string[] {
  if (props.length === 0) return [];
  return [
    "### Props",
    "",
    "| Prop | Type | Default | Description |",
    "| --- | --- | --- | --- |",
    ...props.map(
      (p) =>
        `| \`${tableCell(p.name)}\` | \`${tableCell(p.type)}\` | ${p.default ? `\`${tableCell(p.default)}\`` : "—"} | ${tableCell(p.description)} |`,
    ),
    "",
  ];
}

function renderComponentSection(component: LlmsComponent): string[] {
  const lines: string[] = [
    `## ${component.name} (\`${component.slug}\`)`,
    "",
    oneLine(component.description),
    "",
    `- Docs: ${docsUrl(component)}`,
    `- Install: \`npx uniqueui add ${component.slug}\``,
    `- shadcn CLI: \`npx shadcn@latest add ${SITE_URL}/r/${component.slug}.json\``,
  ];
  if (component.category) lines.push(`- Category: ${component.category}`);
  if (component.tags?.length) lines.push(`- Tags: ${component.tags.join(", ")}`);
  if (component.peerDependencies?.length)
    lines.push(`- Peer dependencies: ${component.peerDependencies.join(", ")}`);
  lines.push("");

  if (component.overview) {
    lines.push(oneLine(component.overview), "");
  }

  lines.push(...renderPropsTable(component.props));

  if (component.usageCode) {
    lines.push("### Usage", "", "```tsx", component.usageCode.trimEnd(), "```", "");
  }

  for (const scenario of component.scenarios ?? []) {
    lines.push(
      `### Scenario: ${scenario.title}`,
      "",
      oneLine(scenario.description),
      "",
      "```tsx",
      scenario.code.trimEnd(),
      "```",
      "",
    );
  }

  return lines;
}

export function renderLlmsFull(components: LlmsComponent[]): string {
  const lines: string[] = [
    "# UniqueUI — full component reference",
    "",
    `> Generated from the UniqueUI registry. Index: ${SITE_URL}/llms.txt`,
    "",
    "Install any component with `npx uniqueui add <slug>` or `npx shadcn@latest add " +
      `${SITE_URL}/r/<slug>.json\`. Components import \`cn\` from \`@/lib/utils\` ` +
      "(shadcn projects) or `utils/cn` (uniqueui CLI).",
    "",
  ];

  for (const component of components) {
    lines.push(...renderComponentSection(component));
  }

  return lines.join("\n");
}
