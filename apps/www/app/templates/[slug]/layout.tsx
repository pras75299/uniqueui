"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "motion/react";
import { ArrowLeft, Download, Eye } from "lucide-react";
import { TEMPLATES } from "@/config/templates";

export default function TemplatePreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const template = TEMPLATES.find((t) => t.id === slug);

  return (
    <div className="relative min-h-screen">
      {/* ── Floating preview bar ── */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="fixed top-0 left-0 right-0 z-[9999] h-12 flex items-center justify-between px-4 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/80"
      >
        {/* Left: back link */}
        <Link
          href="/templates"
          className="flex items-center gap-1.5 text-sm font-medium text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Templates</span>
        </Link>

        {/* Center: template name + preview badge */}
        <div className="flex items-center gap-2">
          <Eye className="w-3.5 h-3.5 text-neutral-500" />
          <span className="text-sm font-semibold text-neutral-200 tracking-tight">
            {template?.name ?? "Preview"}
          </span>
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/15 border border-purple-500/30 text-purple-300 tracking-wide uppercase">
            Live Preview
          </span>
        </div>

        {/* Right: download button */}
        {template?.status === "available" ? (
          <a
            href={`/api/templates/${slug}/download`}
            download={`${slug}.tsx`}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white text-neutral-900 text-xs font-bold hover:bg-neutral-100 active:scale-95 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </a>
        ) : (
          <span className="text-xs text-neutral-600 font-medium">Coming soon</span>
        )}
      </motion.header>

      {/* Push content below the bar */}
      <div className="pt-12">{children}</div>
    </div>
  );
}
