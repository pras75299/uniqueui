"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function DocsAiCta() {
  return (
    <div className="animate-fade-in-up animate-delay-300 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
      <div className="space-y-1">
        <p className="font-semibold text-neutral-900 dark:text-white">Use with AI</p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Install components from Cursor or Claude Code via the shadcn MCP server, plus{" "}
          <code className="font-mono text-xs">llms.txt</code> endpoints for agent context.
        </p>
      </div>
      <Link
        href="/docs/ai"
        className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800 transition-colors"
      >
        Set up MCP
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
