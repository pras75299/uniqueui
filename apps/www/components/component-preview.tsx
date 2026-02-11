"use client";

import { componentDemos } from "@/config/demos";

export default function ComponentPreview({ slug }: { slug: string }) {
  const demo = componentDemos[slug];

  if (!demo) {
    return (
      <div className="flex items-center justify-center p-12 text-neutral-500 bg-neutral-900/10 border border-neutral-800 rounded-lg border-dashed">
        Preview not available
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl border border-neutral-800 bg-neutral-950/50 overflow-hidden relative min-h-[300px] flex items-center justify-center">
        {/* Background grid for context */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none [background-image:linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)] [background-size:24px_24px]"></div>
        <div className="relative z-10 w-full">
            {demo}
        </div>
    </div>
  );
}
