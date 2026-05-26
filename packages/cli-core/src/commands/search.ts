import chalk from "chalk";
import { loadRegistryEntries } from "./list";
import { warnIfUntrustedRegistry } from "./add";

type Entry = { name: string; title?: string; description?: string };

type Ranked = Entry & { score: number };

/**
 * Score an entry against a normalized lowercase query. Higher is better; 0 means no match.
 *
 * Tiers (descending priority):
 *   100 — exact name match
 *    80 — name starts with query
 *    60 — name contains query
 *    40 — title contains query
 *    20 — description contains query
 *
 * The +0..9 length bonus for substring tiers slightly favors shorter names
 * (tighter matches) when two entries land in the same tier.
 */
export function scoreEntry(entry: Entry, query: string): number {
    const q = query.toLowerCase();
    if (!q) return 0;

    const name = entry.name.toLowerCase();
    if (name === q) return 100;
    if (name.startsWith(q)) return 80 + tightnessBonus(name.length, q.length);

    const nameIdx = name.indexOf(q);
    if (nameIdx !== -1) return 60 + tightnessBonus(name.length, q.length);

    const title = entry.title?.toLowerCase();
    if (title && title.includes(q)) return 40 + tightnessBonus(title.length, q.length);

    const description = entry.description?.toLowerCase();
    if (description && description.includes(q)) return 20;

    return 0;
}

function tightnessBonus(fieldLen: number, queryLen: number): number {
    if (fieldLen <= queryLen) return 9;
    // Inverse-ratio bonus capped to [0, 9]: shorter fields get higher bonus.
    const ratio = queryLen / fieldLen;
    return Math.max(0, Math.min(9, Math.round(ratio * 9)));
}

export function rankEntries(entries: Entry[], query: string): Ranked[] {
    const trimmed = query.trim();
    if (!trimmed) return [];
    const scored: Ranked[] = [];
    for (const entry of entries) {
        const score = scoreEntry(entry, trimmed);
        if (score > 0) scored.push({ ...entry, score });
    }
    // Stable secondary sort by name so equal-score results are deterministic
    // (important for test snapshots and reproducible output).
    scored.sort((a, b) => (b.score - a.score) || a.name.localeCompare(b.name));
    return scored;
}

function formatRow(entry: Ranked, nameWidth: number): string {
    const slug = chalk.white(entry.name.padEnd(nameWidth));
    const tail = entry.description ?? entry.title ?? "";
    return tail ? `${slug}  ${chalk.gray(tail)}` : slug;
}

export async function search(query: string, options: { url: string; limit?: number }) {
    const trimmed = query.trim();
    if (!trimmed) {
        console.error(chalk.red("Search query cannot be empty."));
        process.exitCode = 1;
        return;
    }

    warnIfUntrustedRegistry(options.url);

    const entries = await loadRegistryEntries(options.url);
    if (!entries) {
        console.error(chalk.red(`Could not load registry from ${options.url}.`));
        process.exitCode = 1;
        return;
    }
    if (entries.length === 0) {
        console.error(chalk.yellow(`Registry at ${options.url} is empty.`));
        return;
    }

    const ranked = rankEntries(entries, trimmed);
    if (ranked.length === 0) {
        console.log(chalk.yellow(`\nNo matches for "${trimmed}" in ${entries.length} component(s).`));
        console.log(chalk.gray(`Tip: run \`npx uniqueui list\` to see every available component.`));
        return;
    }

    // Default limit keeps output to one screen for broad queries; users can raise it.
    const limit = options.limit && options.limit > 0 ? options.limit : 20;
    const shown = ranked.slice(0, limit);
    const nameWidth = shown.reduce((m, e) => Math.max(m, e.name.length), 0);

    console.log(chalk.bold(`\nResults for "${trimmed}" — ${ranked.length} match${ranked.length === 1 ? "" : "es"}`));
    console.log(chalk.gray(`Source: ${options.url}\n`));
    for (const entry of shown) {
        console.log(formatRow(entry, nameWidth));
    }
    if (ranked.length > shown.length) {
        console.log(chalk.gray(`\n… ${ranked.length - shown.length} more. Re-run with --limit ${ranked.length} to see all.`));
    }
    console.log(chalk.gray(`\nInspect one with: npx uniqueui info <name>`));
}
