"use client";

import { useEffect, useState } from "react";
import { Star, GitFork, Download } from "lucide-react";
import { cn } from "@/lib/utils";

type Stats = {
  stars: number | null;
  forks: number | null;
  downloads: number | null;
};

const compact = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function format(n: number | null) {
  return n == null ? "—" : compact.format(n);
}

/** GitHub stars / forks and total npm downloads, fetched from the cached /api/stats route. */
export function RepoStats({ isDark }: { isDark: boolean }) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Stats | null) => {
        if (active && d) setStats(d);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const loaded = stats !== null;

  const items = [
    {
      icon: Star,
      value: stats?.stars ?? null,
      label: "GitHub stars",
      href: "https://github.com/pras75299/uniqueui/stargazers",
    },
    {
      icon: GitFork,
      value: stats?.forks ?? null,
      label: "GitHub forks",
      href: "https://github.com/pras75299/uniqueui/forks",
    },
    {
      icon: Download,
      value: stats?.downloads ?? null,
      label: "npm downloads",
      href: "https://www.npmjs.com/package/uniqueui-cli",
    },
  ];

  return (
    <div
      className={cn(
        "hidden items-center rounded-lg border lg:flex",
        isDark ? "border-neutral-800" : "border-neutral-200",
      )}
    >
      {items.map((item, i) => (
        <a
          key={item.label}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={item.label}
          title={item.label}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 text-sm transition-colors duration-200 ease-out tabular-nums",
            i > 0 && (isDark ? "border-l border-neutral-800" : "border-l border-neutral-200"),
            isDark
              ? "text-neutral-400 hover:text-white"
              : "text-neutral-600 hover:text-neutral-900",
          )}
        >
          <item.icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {loaded ? (
            <span>{format(item.value)}</span>
          ) : (
            <span
              className={cn(
                "inline-block h-3 w-5 animate-pulse rounded",
                isDark ? "bg-neutral-700" : "bg-neutral-200",
              )}
              aria-hidden
            />
          )}
        </a>
      ))}
    </div>
  );
}
