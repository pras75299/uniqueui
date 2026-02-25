import { componentsList } from "@/config/components";
import ComponentPreview from "@/components/component-preview";
import { notFound } from "next/navigation";
import { Terminal } from "lucide-react";
import ClientCopyButton from "./client-copy-button"; // We'll make this small client component

// Generate static params for all components
export function generateStaticParams() {
  return componentsList.map((component) => ({
    slug: component.slug,
  }));
}

export const dynamicParams = false;

export default async function ComponentPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const component = componentsList.find((c) => c.slug === params.slug);

  if (!component) {
    notFound();
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-white lg:text-4xl">
          {component.name}
        </h1>
        <p className="text-lg text-neutral-400 max-w-3xl leading-relaxed">
          {component.description}
        </p>
      </div>

      {/* Install Command */}
      <div className="rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 font-mono text-sm text-neutral-300">
            <Terminal className="w-4 h-4 text-neutral-500" />
            <span>{component.installCmd}</span>
        </div>
        <ClientCopyButton text={component.installCmd} />
      </div>

      {/* Preview */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Preview</h2>
        <ComponentPreview slug={component.slug} />
      </section>

      {/* Usage section */}
      {component.usageCode && (
        <section className="space-y-4 pt-8 border-t border-neutral-800">
          <h2 className="text-xl font-semibold text-white">Usage</h2>
          <div className="relative group rounded-lg overflow-hidden border border-neutral-800 bg-neutral-950">
            <pre className="p-4 overflow-x-auto text-sm text-neutral-300 font-mono">
              <code>{component.usageCode}</code>
            </pre>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <ClientCopyButton text={component.usageCode} />
            </div>
          </div>
        </section>
      )}

      {/* Props Reference section */}
      {component.props && component.props.length > 0 && (
        <section className="space-y-4 pt-8 border-t border-neutral-800">
          <h2 className="text-xl font-semibold text-white">Props</h2>
          <div className="rounded-lg border border-neutral-800 overflow-hidden bg-neutral-950">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-neutral-900 text-neutral-400 border-b border-neutral-800">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium">Prop</th>
                    <th scope="col" className="px-4 py-3 font-medium">Type</th>
                    <th scope="col" className="px-4 py-3 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {component.props.map((prop, idx) => (
                    <tr key={idx} className="hover:bg-neutral-900/50 transition-colors">
                      <td className="px-4 py-3 border-r border-neutral-800/50">
                        <code className="text-purple-400 bg-purple-400/10 px-1.5 py-0.5 rounded text-xs">
                          {prop.name}
                        </code>
                      </td>
                      <td className="px-4 py-3 text-neutral-300 border-r border-neutral-800/50">
                        <code className="text-blue-400/80 bg-blue-400/10 px-1.5 py-0.5 rounded text-xs break-all">
                          {prop.type}
                        </code>
                      </td>
                      <td className="px-4 py-3 text-neutral-400">
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
