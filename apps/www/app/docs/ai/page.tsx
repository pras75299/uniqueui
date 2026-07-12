import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE_URL } from "@/config/site";

export const metadata = {
  title: "Use with AI — UniqueUI",
  description:
    "Install UniqueUI components from Cursor, Claude Code, or any AI editor: shadcn MCP registry setup, namespaced installs, and llms.txt endpoints.",
};

function Code({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <code className={cn("font-mono text-[12px] text-purple-700 dark:text-purple-300", className)}>
      {children}
    </code>
  );
}

function Block({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <pre
      className={cn(
        "overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-950 p-4 text-[12px] leading-relaxed text-neutral-200 dark:border-neutral-800",
        className,
      )}
    >
      <code>{children}</code>
    </pre>
  );
}

export default function UseWithAiPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <Link
          href="/docs"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Back to docs
        </Link>
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-5xl">
          Use with AI
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
          UniqueUI publishes a shadcn-format registry, so AI editors that speak the shadcn
          registry protocol — Cursor, Claude Code, VS Code Copilot, Codex — can browse and
          install components directly. No extra server, no plugin: point them at the registry
          and prompt.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
          1. Register the <Code className="text-xl">@uniqueui</Code> namespace
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          In a project with <Code>components.json</Code> (created by <Code>shadcn init</Code>),
          add UniqueUI to the <Code>registries</Code> map:
        </p>
        <Block>{`{
  "registries": {
    "@uniqueui": "${SITE_URL}/r/{name}.json"
  }
}`}</Block>
        <p className="text-neutral-600 dark:text-neutral-400">
          From then on, components install by namespace — no URLs needed:
        </p>
        <Block>{`npx shadcn@latest add @uniqueui/magnetic-button`}</Block>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
          2. Connect the shadcn MCP server
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          The shadcn MCP server lets your AI editor search, view, and install anything in a
          registered namespace — including <Code>@uniqueui</Code>. Set it up for your client:
        </p>
        <Block>{`# Claude Code
npx shadcn@latest mcp init --client claude

# Cursor
npx shadcn@latest mcp init --client cursor

# VS Code
npx shadcn@latest mcp init --client vscode`}</Block>
        <p className="text-neutral-600 dark:text-neutral-400">
          Then prompt naturally:
        </p>
        <Block>{`"Show me all components in the @uniqueui registry"
"Install @uniqueui/typewriter-text and use it in the hero"`}</Block>
        <p className="text-neutral-600 dark:text-neutral-400">
          The agent resolves the component from{" "}
          <Code>{`${SITE_URL}/r/<slug>.json`}</Code>, writes the file into{" "}
          <Code>components/ui/</Code>, and installs its npm dependencies.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
          llms.txt endpoints
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          For agents and tools that read documentation as plain text, the whole library is
          published in the{" "}
          <a
            href="https://llmstxt.org"
            className="text-purple-600 dark:text-purple-400 underline underline-offset-2"
          >
            llms.txt
          </a>{" "}
          convention, regenerated on every release:
        </p>
        <div className="space-y-2">
          {[
            {
              path: "/llms.txt",
              desc: "Index — every component and block with a one-line description",
            },
            {
              path: "/llms-full.txt",
              desc: "Full reference — props, usage code, and scenarios for every component",
            },
          ].map(({ path, desc }) => (
            <div
              key={path}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/30"
            >
              <a
                href={path}
                className="text-sm font-mono text-purple-600 dark:text-purple-300 shrink-0 hover:underline underline-offset-2"
              >
                {SITE_URL}
                {path}
              </a>
              <span className="hidden sm:block text-neutral-300 dark:text-neutral-600">—</span>
              <span className="text-sm text-neutral-600 dark:text-neutral-400">{desc}</span>
            </div>
          ))}
        </div>
        <p className="text-neutral-600 dark:text-neutral-400">
          Paste either URL into your editor&apos;s context (or an <Code>@docs</Code> source) and
          the model can answer questions about props, pick the right component, and write usage
          code without guessing.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Machine-readable registry
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Building your own tooling? Two JSON manifests describe everything:
        </p>
        <Block>{`${SITE_URL}/r/registry.json    # shadcn registry index (names, deps, files)
${SITE_URL}/registry.json      # UniqueUI CLI manifest (full file contents)`}</Block>
      </section>
    </div>
  );
}
