import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Theming — UniqueUI",
  description:
    "How UniqueUI components consume Tailwind tokens in v3 (JS preset) and v4 (CSS @theme), and how the new `uniqueui theme` command stitches them into your project.",
};

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-[12px] text-purple-700 dark:text-purple-300">{children}</code>
  );
}

function Block({ children }: { children: React.ReactNode }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-950 p-4 text-[12px] leading-relaxed text-neutral-200 dark:border-neutral-800">
      <code>{children}</code>
    </pre>
  );
}

export default function ThemingPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <Link
          href="/docs"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Back to docs
        </Link>
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-5xl">
          Theming
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
          UniqueUI components carry their own Tailwind tokens (animations, keyframes, and a few
          CSS variables). The CLI merges them into whichever Tailwind major you&apos;re on. This
          page covers what gets written, and the new <Code>uniqueui theme</Code> command for
          pulling the full preset on demand.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Tailwind v3 — JS preset</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Each component declares its tokens in a <Code>tailwindConfig.theme.extend</Code> object.
          <Code>uniqueui add</Code> merges them into your <Code>tailwind.config.&#123;js,ts&#125;</Code>
          using <Code>ts-morph</Code>, key-by-key. Existing keys win, so the merge is safe to re-run.
        </p>
        <p className="text-neutral-600 dark:text-neutral-400">
          To dump the full preset for every registry component at once (useful when bootstrapping a
          shared config in a monorepo), run:
        </p>
        <Block>{`npx uniqueui theme --format v3 > tailwind.uniqueui.cjs`}</Block>
        <p className="text-neutral-600 dark:text-neutral-400">
          Then load it as a preset in your config:
        </p>
        <Block>{`// tailwind.config.js
module.exports = {
  presets: [require("./tailwind.uniqueui.cjs")],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
};`}</Block>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Tailwind v4 — @theme in CSS</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          v4 projects keep tokens in CSS, not JS. Components carry a <Code>tailwindCss</Code>
          snippet (typically an <Code>@theme</Code> block plus any <Code>@keyframes</Code>) that
          the CLI appends to the file at <Code>components.json#tailwind.css</Code>, wrapped in
          markers so re-runs stay idempotent:
        </p>
        <Block>{`/* uniqueui:start moving-border */
@theme {
  --animate-border-spin: border-spin 3s linear infinite;
}
@keyframes border-spin {
  100% { transform: rotate(-360deg); }
}
/* uniqueui:end moving-border */`}</Block>
        <p className="text-neutral-600 dark:text-neutral-400">
          To preview or precompose the full theme without touching your CSS, use:
        </p>
        <Block>{`npx uniqueui theme --format v4 --out app/uniqueui.css`}</Block>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Auto detection</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          The default is <Code>--format auto</Code>: the CLI reads <Code>components.json</Code>,
          looks at the file it points at via <Code>tailwind.css</Code>, and at your project&apos;s
          {" "}<Code>tailwindcss</Code> range and PostCSS plugins. If the project is on v4 you get the
          CSS snippet; on v3 you get the JS preset. Same logic <Code>uniqueui doctor</Code> uses
          for its diagnostic.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Scoping to one component</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Pass <Code>--component &lt;slug&gt;</Code> to print just one component&apos;s tokens.
          Handy for diffing a single component&apos;s upstream tokens against the version sitting
          in your repo:
        </p>
        <Block>{`npx uniqueui theme --component moving-border --format v3`}</Block>
      </section>

      <section className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50 p-5 text-sm leading-relaxed text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900/40 dark:text-neutral-300">
        <p className="font-semibold text-neutral-900 dark:text-white">Heads up</p>
        <p>
          <Code>uniqueui theme</Code> is a <em>read-only</em> command — it never modifies your
          Tailwind config or CSS. Use <Code>uniqueui add &lt;slug&gt;</Code> if you want the CLI
          to merge tokens for you in place (with prompts and <Code>--dry-run</Code> support).
        </p>
        <p>
          For the full v3 vs v4 compatibility story, see the{" "}
          <Link href="/docs/compatibility" className="text-purple-600 underline underline-offset-2 dark:text-purple-400">
            compatibility matrix
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
