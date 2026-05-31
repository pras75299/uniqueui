import fs from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import type { Metadata } from "next";
import { componentsList } from "@/config/components";

export const metadata: Metadata = {
  title: "Changelog · UniqueUI",
  description:
    "Versioned changes for every UniqueUI component. Newest-first, sourced from the published registry.",
};

type ChangelogEntry = {
  version: string;
  date: string;
  changes: string[];
};

type Changelogs = Record<string, ChangelogEntry[]>;

type FlatEntry = ChangelogEntry & { slug: string; name: string; kind: "block" | "component" };

async function loadChangelogs(): Promise<Changelogs> {
  // Built artifact: scripts/build-registry.ts aggregates per-slug manifest
  // `changelog` fields into apps/www/public/registry/changelogs.json.
  //
  // If the build step was skipped or the file is corrupt, render an empty
  // changelog rather than crashing the route — the page still loads and the
  // empty-state copy tells the user the registry hasn't been built yet.
  const file = path.join(process.cwd(), "public", "registry", "changelogs.json");
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as Changelogs;
  } catch (err) {
    console.error("changelog page: failed to load changelogs.json", err);
    return {};
  }
}

function nameForSlug(slug: string): { name: string; kind: "block" | "component" } {
  const item = componentsList.find((c) => c.slug === slug);
  if (!item) return { name: slug, kind: "component" };
  return { name: item.name, kind: item.kind === "block" ? "block" : "component" };
}

/**
 * Numeric semver compare for the version tie-break. We can't lean on
 * lexicographic string comparison because "1.10.0" < "1.9.0" textually but
 * not semantically. Returns >0 when `a` is newer than `b`.
 *
 * We don't pull `semver` as a dep for a single comparator — the registry
 * schema already enforces `MAJOR.MINOR.PATCH` digits-only, so a three-segment
 * numeric compare is sufficient. Non-numeric or extra segments fall back to
 * string compare on those parts.
 */
function compareSemver(a: string, b: string): number {
  const pa = a.split(".");
  const pb = b.split(".");
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const sa = pa[i] ?? "0";
    const sb = pb[i] ?? "0";
    const na = Number(sa);
    const nb = Number(sb);
    if (Number.isFinite(na) && Number.isFinite(nb) && String(na) === sa && String(nb) === sb) {
      if (na !== nb) return na - nb;
      continue;
    }
    if (sa !== sb) return sa < sb ? -1 : 1;
  }
  return 0;
}

export default async function ChangelogPage() {
  const data = await loadChangelogs();

  // Flatten to one row per (slug, entry); sort newest date first; tie-break by version desc.
  const flat: FlatEntry[] = Object.entries(data).flatMap(([slug, entries]) => {
    const { name, kind } = nameForSlug(slug);
    return entries.map((e) => ({ ...e, slug, name, kind }));
  });
  flat.sort((a, b) => {
    // Dates are ISO YYYY-MM-DD per the changelogs schema, so lexicographic
    // sort is equivalent to chronological. Version tie-break uses a numeric
    // segment compare so "1.10.0" sorts newer than "1.9.0".
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return compareSemver(b.version, a.version);
  });

  // Group by date so the page reads as a chronological release log.
  const byDate = new Map<string, FlatEntry[]>();
  for (const e of flat) {
    const bucket = byDate.get(e.date) ?? [];
    bucket.push(e);
    byDate.set(e.date, bucket);
  }
  const dates = Array.from(byDate.keys());

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-12">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-neutral-500">
          Release log
        </p>
        <h1 className="text-balance text-4xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
          Changelog
        </h1>
        <p className="mt-4 max-w-prose text-pretty text-neutral-600 dark:text-neutral-400">
          Versioned changes for every UniqueUI component, newest first. Each
          entry corresponds to a semver bump on the component manifest (<code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[0.85em] dark:bg-neutral-900">registry/components/&lt;slug&gt;.json</code> → <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[0.85em] dark:bg-neutral-900">changelog</code>).
        </p>
      </header>

      {dates.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">
          No releases yet. Run <code className="font-mono text-[0.85em]">pnpm build:registry</code> to publish the changelog aggregate from per-slug manifests.
        </p>
      ) : null}

      <ol className="space-y-12 border-l border-neutral-200 pl-6 dark:border-neutral-800">
        {dates.map((date) => (
          <li key={date} className="relative">
            <span
              aria-hidden
              className="absolute -left-[33px] top-1.5 h-2.5 w-2.5 rounded-full border border-neutral-300 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-950"
            />
            <time
              dateTime={date}
              className="font-mono text-xs uppercase tracking-[0.16em] text-neutral-500"
            >
              {date}
            </time>
            <ul className="mt-4 space-y-6">
              {byDate.get(date)!.map((entry) => {
                const href =
                  entry.kind === "block"
                    ? `/blocks/${entry.slug}`
                    : `/components/${entry.slug}`;
                return (
                  <li
                    key={`${entry.slug}-${entry.version}`}
                    className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <Link
                        href={href}
                        className="text-base font-semibold tracking-tight text-neutral-900 hover:text-neutral-700 dark:text-neutral-50 dark:hover:text-neutral-300"
                      >
                        {entry.name}
                      </Link>
                      <span className="font-mono text-xs text-neutral-500">
                        v{entry.version}
                      </span>
                    </div>
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-neutral-600 dark:text-neutral-400">
                      {entry.changes.map((change, i) => (
                        <li key={i}>{change}</li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
