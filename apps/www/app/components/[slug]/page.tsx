import { componentsList } from "@/config/components";
import { getInstallCommand, getShadcnInstallCommand } from "@/config/component-registry";
import ComponentPreview from "@/components/component-preview";
import { notFound } from "next/navigation";
import { Terminal } from "lucide-react";
import ClientCopyButton from "./client-copy-button";
import BentoVariantSwitcher from "./bento-variant-switcher";
import PropsTable from "@/components/props-table";
import { codeToHtml } from "shiki";
import { escapeHtml } from "@/lib/escape-html";

// Generate static params for all components
export function generateStaticParams() {
  return componentsList.map((component) => ({
    slug: component.slug,
  }));
}

export const dynamicParams = true;

export default async function ComponentPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const component = componentsList.find((c) => c.slug === params.slug);
  const installCommand = params.slug ? getInstallCommand(params.slug) : "";
  const shadcnInstallCommand = params.slug ? getShadcnInstallCommand(params.slug) : "";

  if (!component) {
    notFound();
  }

  // ── Shared highlight helper ────────────────────────────────────────────────
  async function highlight(code: string): Promise<string> {
    try {
      // usageCode is repo-trusted; this path is normal.
      return await codeToHtml(code, { lang: "tsx", theme: "vitesse-dark" });
    } catch {
      // Full escape on failure — avoids breaking out of <pre><code> if Shiki errors.
      return `<pre><code>${escapeHtml(code)}</code></pre>`;
    }
  }

  // ── Components with variants (e.g. bento-grid) ────────────────────────────
  if (component.variants && component.variants.length > 0) {
    // Pre-highlight ALL variant codes on the server so the client switcher
    // never needs to call shiki — it just swaps pre-highlighted HTML strings.
    const highlightedCodes: Record<string, string> = {};
    const rawCodes: Record<string, string> = {};

    await Promise.all(
      component.variants.map(async (v) => {
        highlightedCodes[v.id] = await highlight(v.usageCode);
        rawCodes[v.id] = v.usageCode;
      })
    );

    return (
      <div className="space-y-10">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white lg:text-4xl">
            {component.name}
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl leading-relaxed">
            {component.description}
          </p>
        </div>

        {/* Install commands */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            UniqueUI CLI
          </p>
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 font-mono text-sm text-neutral-700 dark:text-neutral-300 min-w-0">
              <Terminal className="w-4 h-4 shrink-0 text-neutral-500" />
              <span className="break-all">{installCommand}</span>
            </div>
            <ClientCopyButton text={installCommand} />
          </div>
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400 pt-1">
            shadcn CLI
          </p>
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 font-mono text-sm text-neutral-700 dark:text-neutral-300 min-w-0">
              <Terminal className="w-4 h-4 shrink-0 text-neutral-500" />
              <span className="break-all">{shadcnInstallCommand}</span>
            </div>
            <ClientCopyButton text={shadcnInstallCommand} />
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            shadcn path expects <code className="rounded bg-neutral-200 dark:bg-neutral-800 px-1">@/lib/utils</code> (run{" "}
            <code className="rounded bg-neutral-200 dark:bg-neutral-800 px-1">shadcn init</code> first). Same source file
            is installed to <code className="rounded bg-neutral-200 dark:bg-neutral-800 px-1">components/ui/</code>.
          </p>
        </div>

        {/* Synced variant switcher — handles both Preview and Usage in one block */}
        <BentoVariantSwitcher
          variants={component.variants}
          highlightedCodes={highlightedCodes}
          rawCodes={rawCodes}
        />

        {/* Props Reference */}
        {component.props && component.props.length > 0 && (
          <section className="space-y-4 pt-8 border-t border-neutral-200 dark:border-neutral-800">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Props</h2>
            <PropsTable props={component.props} />
          </section>
        )}
      </div>
    );
  }

  // ── Standard single-demo components (all other components) ────────────────
  let highlightedCode = "";
  if (component.usageCode) {
    highlightedCode = await highlight(component.usageCode);
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white lg:text-4xl">
          {component.name}
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl leading-relaxed">
          {component.description}
        </p>
      </div>

      {/* Install commands */}
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          UniqueUI CLI
        </p>
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 font-mono text-sm text-neutral-700 dark:text-neutral-300 min-w-0">
            <Terminal className="w-4 h-4 shrink-0 text-neutral-500" />
            <span className="break-all">{installCommand}</span>
          </div>
          <ClientCopyButton text={installCommand} />
        </div>
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400 pt-1">
          shadcn CLI
        </p>
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 font-mono text-sm text-neutral-700 dark:text-neutral-300 min-w-0">
            <Terminal className="w-4 h-4 shrink-0 text-neutral-500" />
            <span className="break-all">{shadcnInstallCommand}</span>
          </div>
          <ClientCopyButton text={shadcnInstallCommand} />
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          shadcn path expects <code className="rounded bg-neutral-200 dark:bg-neutral-800 px-1">@/lib/utils</code> (run{" "}
          <code className="rounded bg-neutral-200 dark:bg-neutral-800 px-1">shadcn init</code> first). Same source file
          is installed to <code className="rounded bg-neutral-200 dark:bg-neutral-800 px-1">components/ui/</code>.
        </p>
      </div>

      {/* Preview */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Preview</h2>
        <ComponentPreview slug={component.slug} />
      </section>

      {/* Usage section */}
      {component.usageCode && (
        <section className="space-y-4 pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Usage</h2>
          <div className="relative group rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
            <div 
              className="p-4 overflow-x-auto text-sm font-mono [&>pre]:!bg-transparent [&>pre]:!p-0"
              style={{
                backgroundColor: '#0a0a0a',
              }}
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <ClientCopyButton text={component.usageCode} />
            </div>
          </div>
        </section>
      )}

      {/* Props Reference section */}
      {component.props && component.props.length > 0 && (
        <section className="space-y-4 pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Props</h2>
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-950">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium">Prop</th>
                    <th scope="col" className="px-4 py-3 font-medium">Type</th>
                    <th scope="col" className="px-4 py-3 font-medium">Description</th>
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
                      <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300 border-r border-neutral-200 dark:border-neutral-800/50">
                        <code className="text-blue-600 dark:text-blue-400/80 bg-blue-400/10 px-1.5 py-0.5 rounded text-xs break-all">
                          {prop.type}
                        </code>
                      </td>
                      <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
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
    </div>
  );
}
