import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertTriangle, Info } from "lucide-react";

export const metadata = {
  title: "Compatibility — UniqueUI",
  description:
    "What we test against in CI vs. what we treat as best-effort. Framework, runtime, and Tailwind support for UniqueUI components and CLI.",
};

type Status = "tested" | "best-effort" | "manual" | "unsupported";

type Row = {
  label: string;
  version: string;
  status: Status;
  notes: string;
};

const runtime: Row[] = [
  {
    label: "Node.js (CLI users)",
    version: "≥ 18",
    status: "tested",
    notes: "Minimum supported by `uniqueui-cli`. Use 20 LTS or 22 LTS for the smoothest experience.",
  },
  {
    label: "Node.js (this repo contributors)",
    version: "24.x",
    status: "tested",
    notes: "Matches `package.json#engines` for monorepo work; mismatch is fine for end users of the CLI.",
  },
  {
    label: "pnpm",
    version: "10.33.x",
    status: "tested",
    notes: "Pinned via `packageManager`. Other PMs work for end users (`pnpm`, `npm`, `yarn`, `bun` all detected).",
  },
];

const frameworks: Row[] = [
  {
    label: "Next.js (App Router)",
    version: "15 – 16",
    status: "tested",
    notes: "The docs site itself runs Next 16. Components use `\"use client\"` where they touch state or motion.",
  },
  {
    label: "Next.js (Pages Router)",
    version: "13+",
    status: "best-effort",
    notes: "Components are framework-agnostic React. No `next/*` imports in registry code.",
  },
  {
    label: "Vite + React",
    version: "≥ 5",
    status: "best-effort",
    notes: "After `npx uniqueui init`, edit `components.json` paths if your project uses `src/` or `app/` differently.",
  },
  {
    label: "Remix / React Router 7",
    version: "≥ 2",
    status: "best-effort",
    notes: "Same caveat as Vite. The CLI does not auto-detect framework yet.",
  },
  {
    label: "Astro (React island)",
    version: "≥ 4",
    status: "best-effort",
    notes: "Wrap each UniqueUI component in `client:load` or `client:visible`.",
  },
];

const stack: Row[] = [
  {
    label: "React",
    version: "18 / 19",
    status: "tested",
    notes: "The docs site runs React 19; components are written to also work on 18.",
  },
  {
    label: "React Server Components",
    version: "—",
    status: "manual",
    notes:
      "UniqueUI components are client components by default (`\"use client\"`). Import them from a Server Component normally.",
  },
  {
    label: "TypeScript",
    version: "≥ 5",
    status: "tested",
    notes: "Each registry file is strict-mode safe. The CLI itself ships types.",
  },
  {
    label: "Tailwind CSS v3",
    version: "≥ 3.4",
    status: "tested",
    notes: "The CLI merges component `tailwindConfig.theme.extend` directly into your `tailwind.config.{js,ts}`.",
  },
  {
    label: "Tailwind CSS v4",
    version: "≥ 4.0",
    status: "manual",
    notes:
      "The docs site uses v4. The CLI's auto-merge still targets a v3-style config file. If your project is v4 CSS-first, copy the component's keyframes / theme tokens into your `@theme` block manually. We are tracking a first-class v4 path in the backlog.",
  },
  {
    label: "Motion (formerly Framer Motion)",
    version: "≥ 12",
    status: "tested",
    notes: "Components import from `motion/react`. The CLI installs `motion` for you.",
  },
];

const cliFlows: Row[] = [
  {
    label: "`uniqueui init` — Next.js (App Router)",
    version: "—",
    status: "tested",
    notes: "Smoke-tested locally and in CI.",
  },
  {
    label: "`uniqueui add <slug>` — every registry component",
    version: "—",
    status: "tested",
    notes: "`scripts/test-all-components.ts` installs each component into a fresh Next app and builds.",
  },
  {
    label: "shadcn registry — `npx shadcn add .../r/<slug>.json`",
    version: "—",
    status: "tested",
    notes: "`pnpm test:e2e:shadcn` adds every item with the shadcn CLI and runs `next build`.",
  },
  {
    label: "Offline / airgapped install",
    version: "—",
    status: "manual",
    notes: "Pass `--url file://path/to/built/registry` to point the CLI at a local checkout.",
  },
];

const STATUS_META: Record<Status, { label: string; bg: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
  tested: {
    label: "Tested in CI",
    bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30",
    text: "text-emerald-700 dark:text-emerald-300",
    icon: CheckCircle2,
  },
  "best-effort": {
    label: "Best effort",
    bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30",
    text: "text-amber-700 dark:text-amber-300",
    icon: Info,
  },
  manual: {
    label: "Manual step",
    bg: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30",
    text: "text-blue-700 dark:text-blue-300",
    icon: AlertTriangle,
  },
  unsupported: {
    label: "Not supported",
    bg: "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30",
    text: "text-rose-700 dark:text-rose-300",
    icon: AlertTriangle,
  },
};

function StatusBadge({ status }: { status: Status }) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${meta.bg} ${meta.text}`}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {meta.label}
    </span>
  );
}

function Matrix({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">{title}</h2>
      <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-900/40 text-neutral-500 dark:text-neutral-400">
            <tr>
              <th scope="col" className="px-4 py-2 text-left font-medium">Target</th>
              <th scope="col" className="px-4 py-2 text-left font-medium">Version</th>
              <th scope="col" className="px-4 py-2 text-left font-medium">Status</th>
              <th scope="col" className="px-4 py-2 text-left font-medium">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {rows.map((row) => (
              <tr key={row.label} className="bg-white dark:bg-neutral-950/40 align-top">
                <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">{row.label}</td>
                <td className="px-4 py-3 font-mono text-xs text-neutral-700 dark:text-neutral-300">{row.version}</td>
                <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{row.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function CompatibilityPage() {
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
          Compatibility
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
          What we verify on every push, versus what we treat as best-effort.
          If your stack lands in a row marked <strong>Manual step</strong>, the docs note tells you exactly what to do.
        </p>
      </div>

      <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 text-sm leading-relaxed text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900/40 dark:text-neutral-300">
        <p className="mb-3 font-semibold text-neutral-900 dark:text-white">Legend</p>
        <ul className="space-y-2">
          <li className="flex flex-wrap items-center gap-2">
            <StatusBadge status="tested" />
            <span>Exercised on every CI run (unit, E2E smoke, registry validation, or per-component build).</span>
          </li>
          <li className="flex flex-wrap items-center gap-2">
            <StatusBadge status="best-effort" />
            <span>We expect it to work because the code is framework-agnostic, but it isn&apos;t in our test matrix yet.</span>
          </li>
          <li className="flex flex-wrap items-center gap-2">
            <StatusBadge status="manual" />
            <span>Works, but requires a one-time setup step documented in the notes column.</span>
          </li>
        </ul>
      </section>

      <Matrix title="Runtime" rows={runtime} />
      <Matrix title="React stack" rows={stack} />
      <Matrix title="Frameworks" rows={frameworks} />
      <Matrix title="CLI flows" rows={cliFlows} />

      <section className="space-y-3 rounded-xl border border-amber-300/60 bg-amber-50 p-5 text-sm leading-relaxed text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-200">
        <p className="font-semibold">Tailwind v4 — what to do today</p>
        <p>
          A v4 project&apos;s tokens live in CSS (<code className="font-mono text-xs">@theme</code> in your global stylesheet),
          not in a JS <code className="font-mono text-xs">tailwind.config</code>. When a UniqueUI component declares
          custom keyframes (e.g. <code className="font-mono text-xs">moving-border</code>, <code className="font-mono text-xs">aurora-background</code>),
          the CLI&apos;s automatic merge won&apos;t find a config object to write into, so you need to copy the
          <code className="font-mono text-xs"> theme.extend.keyframes</code> and
          <code className="font-mono text-xs"> theme.extend.animation</code> entries from the component&apos;s registry JSON
          (<code className="font-mono text-xs">https://uniqueui-platform.vercel.app/registry/&lt;slug&gt;.json</code>) into your
          <code className="font-mono text-xs"> @theme</code> block. A first-class v4 emission path is on the roadmap.
        </p>
      </section>

      <section className="space-y-2 text-sm text-neutral-500 dark:text-neutral-400">
        <p>
          Found a gap? Open an issue at{" "}
          <a
            className="text-purple-600 underline underline-offset-2 dark:text-purple-400"
            href="https://github.com/pras75299/uniqueui/issues/new"
          >
            github.com/pras75299/uniqueui/issues
          </a>{" "}
          with your stack versions and the error you hit.
        </p>
      </section>
    </div>
  );
}
