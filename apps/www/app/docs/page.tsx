import { componentsList } from "@/config/components";
import { codeToHtml } from "shiki";
import { escapeHtml } from "@/lib/escape-html";
import ClientCopyButton from "@/components/client-copy-button";
import Link from "next/link";
import {
  Terminal,
  ArrowRight,
  Download,
  Zap,
  Package,
  FileCode,
  Palette,
  Rocket,
} from "lucide-react";

async function hl(code: string, lang = "bash"): Promise<string> {
  try {
    return await codeToHtml(code, { lang, theme: "vitesse-dark" });
  } catch {
    return `<pre><code>${escapeHtml(code)}</code></pre>`;
  }
}

function CodeBlockShell({
  html,
  rawCode,
  label,
}: {
  html: string;
  rawCode: string;
  label?: string;
}) {
  return (
    <div className="relative group rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-neutral-950">
      {label && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800 bg-neutral-950/80">
          <span className="text-[11px] font-mono text-neutral-500">{label}</span>
          <ClientCopyButton text={rawCode} />
        </div>
      )}
      <div
        className="p-4 overflow-x-auto text-sm [&>pre]:!bg-transparent [&>pre]:!p-0"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {!label && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ClientCopyButton text={rawCode} />
        </div>
      )}
    </div>
  );
}

export default async function DocsOverview() {
  const categories = Array.from(
    new Set(componentsList.map((c) => c.category ?? "Other"))
  );

  const installDepsHtml = await hl("npm install motion tailwindcss");
  const initHtml = await hl("npx uniqueui init");
  const addHtml = await hl("npx uniqueui add typewriter-text");
  const usageHtml = await hl(
    `import { TypewriterText } from "@/components/ui/typewriter-text";

export default function Hero() {
  return (
    <h1 className="text-5xl font-bold text-white">
      Build{" "}
      <TypewriterText
        words={["faster", "smarter", "beautifully"]}
        className="text-purple-400"
      />
    </h1>
  );
}`,
    "tsx"
  );

  return (
    <div className="space-y-16">
      {/* ── Hero ── */}
      <div className="animate-fade-in-up space-y-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-500/10 dark:border-purple-500/30 dark:text-purple-300">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
          Documentation
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-5xl">
          Introduction
        </h1>
        <p className="text-lg max-w-2xl leading-relaxed text-neutral-600 dark:text-neutral-400">
          UniqueUI is a collection of{" "}
          <strong className="text-neutral-900 dark:text-white">{componentsList.length} animated React components</strong>{" "}
          built on motion.dev springs and Tailwind CSS. Every component is a single file —
          copy it into your project, no package installs needed.
        </p>
      </div>

      {/* ── What's included ── */}
      <section className="animate-fade-in-up animate-delay-100 space-y-5">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">What&apos;s included</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <div
              key={cat}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 text-neutral-700 dark:text-neutral-300 text-sm font-medium"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0" />
              {cat}
            </div>
          ))}
        </div>
      </section>

      {/* ── Installation ── */}
      <section id="installation" className="scroll-mt-20 animate-fade-in-up animate-delay-150 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg border bg-white border-neutral-200 text-purple-600 dark:bg-neutral-900 dark:border-neutral-800 dark:text-purple-400">
            <Download className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Installation</h2>
        </div>

        <p className="text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
          UniqueUI uses a CLI to scaffold components directly into your project. Run{" "}
          <code className="text-xs font-mono bg-neutral-100 dark:bg-neutral-800 text-purple-600 dark:text-purple-300 px-1.5 py-0.5 rounded">
            init
          </code>{" "}
          once to set up the config file, then add components individually.
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              1. Install peer dependencies
            </p>
            <CodeBlockShell html={installDepsHtml} rawCode="npm install motion tailwindcss" label="bash" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              2. Initialise UniqueUI in your project
            </p>
            <CodeBlockShell html={initHtml} rawCode="npx uniqueui init" label="bash" />
          </div>
        </div>

        <div className="rounded-xl border border-amber-300/60 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/5 p-4 text-sm leading-relaxed text-amber-700 dark:text-amber-300">
          <strong>Note:</strong> The init command creates a{" "}
          <code className="font-mono text-xs bg-amber-100 dark:bg-amber-500/10 px-1 rounded">
            uniqueui.config.json
          </code>{" "}
          in your project root. This stores your component output path and preferred aliases.
        </div>
      </section>

      {/* ── Quick Start ── */}
      <section id="quickstart" className="scroll-mt-20 animate-fade-in-up animate-delay-200 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg border bg-white border-neutral-200 text-purple-600 dark:bg-neutral-900 dark:border-neutral-800 dark:text-purple-400">
            <Zap className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Quick Start</h2>
        </div>

        <p className="text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
          Add your first component with the CLI, then import it directly.
        </p>

        <div className="space-y-4">
          <CodeBlockShell html={addHtml} rawCode="npx uniqueui add typewriter-text" label="bash" />
          <CodeBlockShell
            html={usageHtml}
            rawCode={`import { TypewriterText } from "@/components/ui/typewriter-text";

export default function Hero() {
  return (
    <h1 className="text-5xl font-bold text-white">
      Build{" "}
      <TypewriterText
        words={["faster", "smarter", "beautifully"]}
        className="text-purple-400"
      />
    </h1>
  );
}`}
            label="tsx"
          />
        </div>
      </section>

      {/* ── CLI Reference ── */}
      <section id="cli" className="scroll-mt-20 animate-fade-in-up animate-delay-250 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg border bg-white border-neutral-200 text-purple-600 dark:bg-neutral-900 dark:border-neutral-800 dark:text-purple-400">
            <Terminal className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">CLI Reference</h2>
        </div>

        <div className="space-y-2">
          {[
            { cmd: "npx uniqueui init", desc: "Create config file and set up your project" },
            { cmd: "npx uniqueui add <component>", desc: "Download a component into components/ui" },
            { cmd: "npx uniqueui list", desc: "List all available components" },
            { cmd: "npx uniqueui add --all", desc: "Add all components at once" },
          ].map(({ cmd, desc }) => (
            <div
              key={cmd}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/30"
            >
              <code className="text-sm font-mono text-purple-600 dark:text-purple-300 shrink-0">{cmd}</code>
              <span className="hidden sm:block text-neutral-300 dark:text-neutral-600">—</span>
              <span className="text-sm text-neutral-600 dark:text-neutral-400">{desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Key concepts ── */}
      <section className="animate-fade-in-up animate-delay-300 space-y-6">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Key concepts</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: FileCode,
              title: "Single-file components",
              desc: "Each component is one self-contained .tsx file. No internal imports to manage.",
            },
            {
              icon: Package,
              title: "No runtime dependencies",
              desc: "Only motion and tailwindcss are peer deps. Everything else is inlined.",
            },
            {
              icon: Palette,
              title: "Theme-aware",
              desc: 'Pass theme="dark" | "light" or wire it to your own context.',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/20 space-y-3"
            >
              <div className="p-2 w-fit rounded-lg border bg-white border-neutral-200 text-purple-600 dark:bg-neutral-900 dark:border-neutral-800 dark:text-purple-400">
                <Icon className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-neutral-900 dark:text-white">{title}</h3>
              <p className="text-sm leading-relaxed text-neutral-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <div className="animate-fade-in-up animate-delay-350 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <p className="font-semibold text-neutral-900 dark:text-white">Browse component docs</p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Each component page includes usage scenarios, props reference, and copy-paste code.
          </p>
        </div>
        <Link
          href="/docs/typewriter-text"
          className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm bg-neutral-900 text-white hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200 transition-colors"
        >
          Start with Typewriter
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
