import { componentsList } from "@/config/components";
import { docsScenarios } from "@/config/docs-scenarios";
import { notFound } from "next/navigation";
import { Terminal, ExternalLink, BookOpen } from "lucide-react";
import { codeToHtml } from "shiki";
import { escapeHtml } from "@/lib/escape-html";
import Link from "next/link";
import ClientCopyButton from "@/app/components/[slug]/client-copy-button";

export function generateStaticParams() {
  return componentsList.map((c) => ({ slug: c.slug }));
}

export const dynamicParams = true;

async function highlight(code: string): Promise<string> {
  try {
    return await codeToHtml(code, { lang: "tsx", theme: "vitesse-dark" });
  } catch {
    return `<pre><code>${escapeHtml(code)}</code></pre>`;
  }
}

export default async function DocSlugPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const component = componentsList.find((c) => c.slug === slug);

  if (!component) notFound();

  const docData = docsScenarios[slug] ?? null;

  // Pre-highlight install command usage code
  let highlightedUsage = "";
  if (component.usageCode) {
    highlightedUsage = await highlight(component.usageCode);
  }

  // Pre-highlight scenario codes
  const highlightedScenarios: { title: string; description: string; html: string }[] = [];
  if (docData?.scenarios) {
    for (const scenario of docData.scenarios) {
      const html = await highlight(scenario.code);
      highlightedScenarios.push({ title: scenario.title, description: scenario.description, html });
    }
  }

  return (
    <div className="space-y-12">
      {/* ── Header ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-500">
          <Link href="/docs" className="hover:text-purple-500 transition-colors">
            Docs
          </Link>
          <span>/</span>
          <span className="text-neutral-400 dark:text-neutral-400">{component.name}</span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white lg:text-4xl">
          {component.name}
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl leading-relaxed">
          {docData?.overview ?? component.description}
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href={`/components/${component.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            View live demo
          </Link>
          {component.category && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-500">
              <BookOpen className="w-3 h-3" />
              {component.category}
            </span>
          )}
        </div>
      </div>

      {/* ── Install ── */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
          Installation
        </h2>
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 font-mono text-sm text-neutral-700 dark:text-neutral-300">
            <Terminal className="w-4 h-4 text-neutral-400 dark:text-neutral-500 shrink-0" />
            <span>{component.installCmd}</span>
          </div>
          <ClientCopyButton text={component.installCmd} />
        </div>
      </section>

      {/* ── Basic Usage ── */}
      {component.usageCode && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
            Basic usage
          </h2>
          <div className="relative group rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800">
            <div
              className="p-4 overflow-x-auto text-sm font-mono [&>pre]:!bg-transparent [&>pre]:!p-0"
              style={{ backgroundColor: "#0a0a0a" }}
              dangerouslySetInnerHTML={{ __html: highlightedUsage }}
            />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <ClientCopyButton text={component.usageCode} />
            </div>
          </div>
        </section>
      )}

      {/* ── Scenarios ── */}
      {highlightedScenarios.length > 0 && (
        <section className="space-y-8 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
              Usage scenarios
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-500">
              Real-world patterns for integrating this component into your project.
            </p>
          </div>

          <div className="space-y-10">
            {highlightedScenarios.map((scenario, idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-purple-500/10 border border-purple-500/20 text-purple-400 dark:text-purple-400 shrink-0">
                    {idx + 1}
                  </span>
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                    {scenario.title}
                  </h3>
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-500 leading-relaxed pl-9">
                  {scenario.description}
                </p>
                <div className="relative group rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800">
                  <div
                    className="p-4 overflow-x-auto text-sm font-mono [&>pre]:!bg-transparent [&>pre]:!p-0"
                    style={{ backgroundColor: "#0a0a0a" }}
                    dangerouslySetInnerHTML={{ __html: scenario.html }}
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ClientCopyButton text={docsScenarios[slug]!.scenarios[idx].code} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── No custom docs fallback ── */}
      {!docData && (
        <section className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-6 text-center space-y-3">
            <p className="text-sm text-neutral-500 dark:text-neutral-500">
              Detailed usage scenarios for this component are coming soon.
            </p>
            <Link
              href={`/components/${component.slug}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View interactive demo & props
            </Link>
          </div>
        </section>
      )}

      {/* ── Props Reference ── */}
      {component.props && component.props.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Props</h2>
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-950">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-neutral-100 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-500 border-b border-neutral-200 dark:border-neutral-800">
                  <tr>
                    <th className="px-4 py-3 font-medium">Prop</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium hidden sm:table-cell">Default</th>
                    <th className="px-4 py-3 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {component.props.map((prop, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                      <td className="px-4 py-3 border-r border-neutral-200 dark:border-neutral-800/50">
                        <code className="text-purple-600 dark:text-purple-400 bg-purple-400/10 px-1.5 py-0.5 rounded text-xs">
                          {prop.name}
                        </code>
                      </td>
                      <td className="px-4 py-3 border-r border-neutral-200 dark:border-neutral-800/50">
                        <code className="text-blue-600 dark:text-blue-400/80 bg-blue-400/10 px-1.5 py-0.5 rounded text-xs break-all">
                          {prop.type}
                        </code>
                      </td>
                      <td className="px-4 py-3 border-r border-neutral-200 dark:border-neutral-800/50 hidden sm:table-cell">
                        {prop.default ? (
                          <code className="text-neutral-500 dark:text-neutral-500 text-xs">
                            {prop.default}
                          </code>
                        ) : (
                          <span className="text-neutral-400 dark:text-neutral-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400 text-sm">
                        {prop.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ── Next component ── */}
      <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
        {(() => {
          const idx = componentsList.findIndex((c) => c.slug === slug);
          const next = componentsList[idx + 1];
          if (!next) return null;
          return (
            <Link
              href={`/docs/${next.slug}`}
              className="group flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Next: {next.name}
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          );
        })()}
      </div>
    </div>
  );
}
