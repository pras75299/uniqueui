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

      {/* Props/Documentation Placeholder */}
      <section className="space-y-4 pt-8 border-t border-neutral-800">
        <h2 className="text-xl font-semibold text-white">Usage</h2>
        <div className="p-4 rounded-lg bg-neutral-900/30 border border-neutral-800 text-neutral-400 text-sm">
           Documentation and props reference coming soon.
        </div>
      </section>
    </div>
  );
}
