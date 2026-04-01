"use client";

import { motion } from "motion/react";
import { useTheme } from "@/contexts/theme-context";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Terminal,
  ArrowRight,
  Download,
  Zap,
  Copy,
  Check,
  Package,
  FileCode,
  Palette,
} from "lucide-react";
import { useState } from "react";
import { componentsList } from "@/config/components";

function CodeBlock({ code, language = "bash" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("relative group rounded-xl border overflow-hidden", isDark ? "border-neutral-800 bg-neutral-900" : "border-neutral-200 bg-neutral-50")}>
      <div className={cn("flex items-center justify-between px-4 py-2 border-b text-xs font-mono", isDark ? "border-neutral-800 text-neutral-500 bg-neutral-950/60" : "border-neutral-200 text-neutral-400 bg-neutral-100/60")}>
        <span>{language}</span>
        <button
          onClick={copy}
          className={cn("flex items-center gap-1.5 transition-colors px-2 py-1 rounded", isDark ? "hover:text-white" : "hover:text-neutral-700")}
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className={cn("p-4 text-sm font-mono overflow-x-auto", isDark ? "text-neutral-200" : "text-neutral-800")}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

const stepVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.1, type: "spring" as const, stiffness: 260, damping: 24 },
  }),
};

export default function DocsOverview() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const categories = Array.from(new Set(componentsList.map((c) => c.category ?? "Other")));

  return (
    <div className="space-y-16">
      {/* ── Hero ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        className="space-y-4"
      >
        <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border", isDark ? "bg-purple-500/10 border-purple-500/30 text-purple-300" : "bg-purple-50 border-purple-200 text-purple-700")}>
          <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
          Documentation
        </span>
        <h1 className={cn("text-4xl font-bold tracking-tight sm:text-5xl", isDark ? "text-white" : "text-neutral-900")}>
          Introduction
        </h1>
        <p className={cn("text-lg max-w-2xl leading-relaxed", isDark ? "text-neutral-400" : "text-neutral-600")}>
          UniqueUI is a collection of{" "}
          <strong className={isDark ? "text-white" : "text-neutral-900"}>
            {componentsList.length} animated React components
          </strong>{" "}
          built on motion.dev springs and Tailwind CSS. Every component is a single file —
          copy it into your project, no package installs needed.
        </p>
      </motion.div>

      {/* ── What's included ── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06, type: "spring", stiffness: 260, damping: 24 }}
        className="space-y-6"
      >
        <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-neutral-900")}>
          What's included
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {categories.map((cat, i) => (
            <motion.div
              key={cat}
              custom={i}
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              className={cn(
                "flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium",
                isDark ? "border-neutral-800 bg-neutral-900/40 text-neutral-300" : "border-neutral-200 bg-white text-neutral-700"
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0" />
              {cat}
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── Installation ── */}
      <section id="installation" className="space-y-6">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg border", isDark ? "bg-neutral-900 border-neutral-800 text-purple-400" : "bg-purple-50 border-purple-200 text-purple-600")}>
            <Download className="w-5 h-5" />
          </div>
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-neutral-900")}>
            Installation
          </h2>
        </div>

        <p className={cn("text-base leading-relaxed", isDark ? "text-neutral-400" : "text-neutral-600")}>
          UniqueUI uses a CLI to scaffold components directly into your project. Run the
          init command once to set up the config file, then add components individually.
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <p className={cn("text-sm font-medium", isDark ? "text-neutral-300" : "text-neutral-700")}>
              1. Install dependencies (required once)
            </p>
            <CodeBlock code="npm install motion tailwindcss" />
          </div>

          <div className="space-y-2">
            <p className={cn("text-sm font-medium", isDark ? "text-neutral-300" : "text-neutral-700")}>
              2. Initialise UniqueUI in your project
            </p>
            <CodeBlock code="npx uniqueui init" />
          </div>
        </div>

        <div className={cn("rounded-xl border p-4 text-sm leading-relaxed", isDark ? "border-amber-500/20 bg-amber-500/5 text-amber-300" : "border-amber-200 bg-amber-50 text-amber-700")}>
          <strong>Note:</strong> The init command creates a{" "}
          <code className="font-mono text-xs bg-amber-500/10 px-1 rounded">uniqueui.config.json</code>{" "}
          in your project root. This stores your component output path and preferred aliases.
        </div>
      </section>

      {/* ── Quick Start ── */}
      <section id="quickstart" className="space-y-6">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg border", isDark ? "bg-neutral-900 border-neutral-800 text-purple-400" : "bg-purple-50 border-purple-200 text-purple-600")}>
            <Zap className="w-5 h-5" />
          </div>
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-neutral-900")}>
            Quick Start
          </h2>
        </div>

        <p className={cn("text-base leading-relaxed", isDark ? "text-neutral-400" : "text-neutral-600")}>
          Add your first component with the CLI, then import it directly.
        </p>

        <div className="space-y-4">
          <CodeBlock code="npx uniqueui add typewriter-text" />
          <CodeBlock
            language="tsx"
            code={`import { TypewriterText } from "@/components/ui/typewriter-text";

export default function Hero() {
  return (
    <h1 className="text-5xl font-bold text-white">
      Build{" "}
      <TypewriterText
        words={["faster", "smarter", "beautifully"]}
        className="text-purple-400"
      />
    </h1>
  );
}`}
          />
        </div>
      </section>

      {/* ── CLI Reference ── */}
      <section id="cli" className="space-y-6">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg border", isDark ? "bg-neutral-900 border-neutral-800 text-purple-400" : "bg-purple-50 border-purple-200 text-purple-600")}>
            <Terminal className="w-5 h-5" />
          </div>
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-neutral-900")}>
            CLI Reference
          </h2>
        </div>

        <div className="space-y-3">
          {[
            { cmd: "npx uniqueui init", desc: "Create config file and set up your project" },
            { cmd: "npx uniqueui add <component>", desc: "Download a component into your components/ui folder" },
            { cmd: "npx uniqueui list", desc: "List all available components" },
            { cmd: "npx uniqueui add --all", desc: "Add all components at once" },
          ].map(({ cmd, desc }) => (
            <div
              key={cmd}
              className={cn(
                "flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 py-3 rounded-xl border",
                isDark ? "border-neutral-800 bg-neutral-900/30" : "border-neutral-200 bg-white"
              )}
            >
              <code className={cn("text-sm font-mono shrink-0", isDark ? "text-purple-300" : "text-purple-700")}>
                {cmd}
              </code>
              <span className={cn("text-sm", isDark ? "text-neutral-500" : "text-neutral-500")}>—</span>
              <span className={cn("text-sm", isDark ? "text-neutral-400" : "text-neutral-600")}>{desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Key concepts ── */}
      <section className="space-y-6">
        <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-neutral-900")}>
          Key concepts
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: FileCode,
              title: "Single-file components",
              desc: "Each component is one self-contained .tsx file. No internal imports you need to manage.",
            },
            {
              icon: Package,
              title: "No runtime dependencies",
              desc: "Only motion and tailwindcss are peer deps. Everything else is inlined.",
            },
            {
              icon: Palette,
              title: "Theme-aware",
              desc: 'Pass theme="dark" | "light" or wire it to your own context — components adapt instantly.',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className={cn(
                "p-5 rounded-xl border space-y-3",
                isDark ? "border-neutral-800 bg-neutral-900/20" : "border-neutral-200 bg-white"
              )}
            >
              <div className={cn("p-2 w-fit rounded-lg border", isDark ? "bg-neutral-900 border-neutral-800 text-purple-400" : "bg-purple-50 border-purple-200 text-purple-600")}>
                <Icon className="w-4 h-4" />
              </div>
              <h3 className={cn("font-semibold text-sm", isDark ? "text-white" : "text-neutral-900")}>{title}</h3>
              <p className={cn("text-sm leading-relaxed", isDark ? "text-neutral-500" : "text-neutral-600")}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 24 }}
        className={cn(
          "rounded-2xl border p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6",
          isDark ? "border-neutral-800 bg-neutral-900/40" : "border-purple-100 bg-purple-50/50"
        )}
      >
        <div className="space-y-1">
          <p className={cn("font-semibold", isDark ? "text-white" : "text-neutral-900")}>
            Browse component docs
          </p>
          <p className={cn("text-sm", isDark ? "text-neutral-400" : "text-neutral-600")}>
            Each component page includes usage scenarios, props reference, and copy-paste code.
          </p>
        </div>
        <Link
          href="/docs/typewriter-text"
          className={cn(
            "shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors",
            isDark ? "bg-white text-black hover:bg-neutral-200" : "bg-neutral-900 text-white hover:bg-neutral-800"
          )}
        >
          Start with Typewriter
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </div>
  );
}
