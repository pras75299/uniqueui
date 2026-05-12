import { notFound } from "next/navigation";
import { Terminal } from "lucide-react";
import { codeToHtml } from "shiki";
import { componentsList } from "@/config/components";
import { docsScenarios } from "@/config/docs-scenarios";
import { getInstallCommand, getShadcnInstallCommand } from "@/config/component-registry";
import { escapeHtml } from "@/lib/escape-html";
import PropsTable from "@/components/props-table";
import ClientCopyButton from "@/app/components/[slug]/client-copy-button";
import BlockPreview from "../block-preview";

export function generateStaticParams() {
  return componentsList
    .filter((c) => c.kind === "block")
    .map((c) => ({ slug: c.slug }));
}

export const dynamicParams = true;

async function highlight(code: string): Promise<string> {
  try {
    return await codeToHtml(code, { lang: "tsx", theme: "vitesse-dark" });
  } catch {
    return `<pre><code>${escapeHtml(code)}</code></pre>`;
  }
}

export default async function BlockPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const block = componentsList.find((c) => c.slug === params.slug && c.kind === "block");

  if (!block) {
    notFound();
  }

  const installCommand = getInstallCommand(block.slug);
  const shadcnInstallCommand = getShadcnInstallCommand(block.slug);
  const docs = docsScenarios[block.slug];
  const usageHighlighted = block.usageCode ? await highlight(block.usageCode) : "";

  const scenarioHighlights: Record<string, string> = {};
  if (docs?.scenarios) {
    await Promise.all(
      docs.scenarios.map(async (s, i) => {
        scenarioHighlights[`${i}`] = await highlight(s.code);
      }),
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 lg:py-12">
      <header className="mb-8 space-y-4">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
          {block.category ?? "Block"}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white lg:text-4xl">
          {block.name}
        </h1>
        <p className="max-w-3xl text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
          {block.description}
        </p>
      </header>

      <section className="mb-10 space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          UniqueUI CLI
        </p>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-neutral-100 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex min-w-0 items-center gap-3 font-mono text-sm text-neutral-700 dark:text-neutral-300">
            <Terminal className="h-4 w-4 shrink-0 text-neutral-500" />
            <span className="break-all">{installCommand}</span>
          </div>
          <ClientCopyButton text={installCommand} />
        </div>
        <p className="pt-1 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          shadcn CLI
        </p>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-neutral-100 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex min-w-0 items-center gap-3 font-mono text-sm text-neutral-700 dark:text-neutral-300">
            <Terminal className="h-4 w-4 shrink-0 text-neutral-500" />
            <span className="break-all">{shadcnInstallCommand}</span>
          </div>
          <ClientCopyButton text={shadcnInstallCommand} />
        </div>
      </section>

      <section className="mb-12 space-y-4">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Preview</h2>
        <BlockPreview slug={block.slug} />
      </section>

      {block.usageCode && (
        <section className="mb-12 space-y-4 border-t border-neutral-200 pt-8 dark:border-neutral-800">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Usage</h2>
          <div className="group relative overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
            <div
              className="overflow-x-auto p-4 text-sm font-mono [&>pre]:!bg-transparent [&>pre]:!p-0"
              style={{ backgroundColor: "#0a0a0a" }}
              dangerouslySetInnerHTML={{ __html: usageHighlighted }}
            />
            <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
              <ClientCopyButton text={block.usageCode} />
            </div>
          </div>
        </section>
      )}

      {docs?.scenarios?.length ? (
        <section className="mb-12 space-y-6 border-t border-neutral-200 pt-8 dark:border-neutral-800">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Scenarios</h2>
          <div className="space-y-8">
            {docs.scenarios.map((s, i) => (
              <article key={s.title} className="space-y-3">
                <h3 className="text-base font-medium text-neutral-900 dark:text-white">{s.title}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{s.description}</p>
                <div className="group relative overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
                  <div
                    className="overflow-x-auto p-4 text-sm font-mono [&>pre]:!bg-transparent [&>pre]:!p-0"
                    style={{ backgroundColor: "#0a0a0a" }}
                    dangerouslySetInnerHTML={{ __html: scenarioHighlights[`${i}`] ?? "" }}
                  />
                  <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <ClientCopyButton text={s.code} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {block.props && block.props.length > 0 && (
        <section className="space-y-4 border-t border-neutral-200 pt-8 dark:border-neutral-800">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Props</h2>
          <PropsTable props={block.props} />
        </section>
      )}
    </div>
  );
}
