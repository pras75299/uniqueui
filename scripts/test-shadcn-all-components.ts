/**
 * E2E harness: install every UniqueUI component via the **shadcn CLI** using the
 * generated registry items in `apps/www/public/r/{slug}.json` (same URLs as production:
 * `https://uniqueui.com/r/{slug}.json`).
 *
 * Prereq: network access for `npx shadcn@latest` (and create-next-app on first run).
 *
 * Usage (from repo root):
 *   npx ts-node scripts/test-shadcn-all-components.ts
 *
 * Optional: limit how many components to install (debug / smoke):
 *   SHADCN_E2E_LIMIT=3 npx ts-node scripts/test-shadcn-all-components.ts
 *
 * Compare: `scripts/test-all-components.ts` uses `uniqueui add` + generated pages;
 * this script runs `shadcn add` + writes `/preview/[slug]` pages using each component’s
 * docs `usageCode` (imports `@/components/ui/<slug>`) so you can verify CLI output in the browser.
 *
 * Note: We do **not** run `shadcn init` here. The current shadcn defaults target Tailwind v4 /
 * Nova CSS, which conflicts with `create-next-app@14` (Tailwind v3). Instead we add a minimal
 * `components.json` + `src/lib/utils.ts` (`cn`) compatible with the shadcn CLI — the same
 * approach as a typical Tailwind v3 + shadcn project.
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const TEST_DIR_NAME = 'e2e-shadcn-components-test';

/** Match test-all-components: demo pages must be client components when they use hooks / motion. */
function ensureUseClient(code: string): string {
    const stripped = code.trimStart();
    if (stripped.startsWith('"use client"') || stripped.startsWith("'use client'")) return code;
    return '"use client";\n\n' + code;
}

async function run() {
    const ROOT_DIR = path.join(__dirname, '..');
    const TEST_DIR = path.join(ROOT_DIR, TEST_DIR_NAME);
    const SHADCN_R_DIR = path.join(ROOT_DIR, 'apps/www/public/r');

    // ── 1. Component slugs + usageCode (for preview routes — same source as test-all-components)
    console.log('📖  Loading component slugs + usageCode from apps/www/config/components...');
    let slugs: string[] = [];
    const usageBySlug = new Map<string, string>();
    try {
        const componentsModule = require(path.join(ROOT_DIR, 'apps/www/config/components'));
        const componentsList = Array.isArray(componentsModule?.componentsList)
            ? componentsModule.componentsList
            : [];
        for (const c of componentsList as { slug?: string; usageCode?: string }[]) {
            if (typeof c?.slug !== 'string') continue;
            slugs.push(c.slug);
            if (typeof c?.usageCode === 'string' && c.usageCode.trim() !== '') {
                usageBySlug.set(c.slug, c.usageCode);
            }
        }
    } catch (e) {
        console.error('Failed to load components config. Run `pnpm build:registry` first.');
        throw e;
    }

    if (slugs.length === 0) {
        console.error('No components found in componentsList.');
        process.exit(1);
    }

    const limitRaw = process.env.SHADCN_E2E_LIMIT;
    if (limitRaw) {
        const n = parseInt(limitRaw, 10);
        if (!Number.isNaN(n) && n > 0) {
            slugs = slugs.slice(0, n);
            console.log(`   (SHADCN_E2E_LIMIT=${n} — partial run)\n`);
        }
    }

    console.log(`   ${slugs.length} components.\n`);

    // ── 2. Ensure registry + shadcn JSON artifacts exist ───────────────────────
    console.log('🔨  Running build:registry (generates apps/www/public/r/*.json)...');
    try {
        execSync(`npx ts-node ${path.join(__dirname, 'build-registry.ts')}`, {
            cwd: ROOT_DIR,
            stdio: 'pipe',
        });
        console.log('    ✅ Done.\n');
    } catch (e: unknown) {
        const err = e as { stdout?: Buffer; stderr?: Buffer };
        console.error('    ❌ build:registry failed:', err.stdout?.toString(), err.stderr?.toString());
        process.exit(1);
    }

    for (const slug of slugs) {
        const p = path.join(SHADCN_R_DIR, `${slug}.json`);
        if (!fs.existsSync(p)) {
            console.error(`Missing shadcn registry file: ${p}`);
            process.exit(1);
        }
    }

    // ── 3. Fresh Next.js app ───────────────────────────────────────────────────
    if (fs.existsSync(TEST_DIR)) {
        console.log(`🗑   Removing previous ${TEST_DIR_NAME}...`);
        fs.rmSync(TEST_DIR, { recursive: true, force: true });
        const pollStart = Date.now();
        const pollTimeout = 2000;
        while (fs.existsSync(TEST_DIR)) {
            if (Date.now() - pollStart > pollTimeout) {
                console.error(`    ❌ Timed out waiting for ${TEST_DIR} to be removed.`);
                process.exit(1);
            }
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
    }

    console.log('🚀  Creating fresh Next.js app...');
    try {
        execSync(
            `echo "\\n" | npx create-next-app@14 ${TEST_DIR_NAME} --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes`,
            { cwd: ROOT_DIR, stdio: 'pipe' },
        );
        console.log('    ✅ Next.js app created.\n');
    } catch (e: unknown) {
        const err = e as { stdout?: Buffer; stderr?: Buffer };
        console.error('create-next-app failed:\n', err.stdout?.toString(), err.stderr?.toString());
        process.exit(1);
    }

    // ── 4. Minimal shadcn project glue (no `shadcn init` — see file header) ───
    console.log('⚙️  Bootstrapping components.json + @/lib/utils (Tailwind v3 / Next 14)...');
    const libDir = path.join(TEST_DIR, 'src/lib');
    fs.mkdirSync(libDir, { recursive: true });
    fs.writeFileSync(
        path.join(libDir, 'utils.ts'),
        `import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`,
        'utf-8',
    );

    const componentsJson = {
        $schema: 'https://ui.shadcn.com/schema.json',
        style: 'new-york',
        rsc: true,
        tsx: true,
        tailwind: {
            config: 'tailwind.config.ts',
            css: 'src/app/globals.css',
            baseColor: 'slate',
            cssVariables: true,
            prefix: '',
        },
        aliases: {
            components: '@/components',
            utils: '@/lib/utils',
            ui: '@/components/ui',
            lib: '@/lib',
        },
    };
    fs.writeFileSync(path.join(TEST_DIR, 'components.json'), JSON.stringify(componentsJson, null, 2) + '\n', 'utf-8');

    try {
        execSync('npm install clsx tailwind-merge lucide-react motion --save', {
            cwd: TEST_DIR,
            stdio: 'pipe',
        });
        console.log('    ✅ Ready for shadcn add.\n');
    } catch (e: unknown) {
        const err = e as { stdout?: Buffer; stderr?: Buffer };
        console.error(
            'npm install clsx tailwind-merge lucide-react motion failed:',
            err.stdout?.toString(),
            err.stderr?.toString(),
        );
        process.exit(1);
    }

    // Same as test-all-components: relax build strictness so we focus on install + compile
    const nextConfigContent =
        [
            "/** @type {import('next').NextConfig} */",
            'const nextConfig = {',
            '  eslint:     { ignoreDuringBuilds: true },',
            '  typescript: { ignoreBuildErrors: true },',
            '};',
            'module.exports = nextConfig;',
        ].join('\n') + '\n';
    fs.writeFileSync(path.join(TEST_DIR, 'next.config.js'), nextConfigContent);
    for (const name of ['next.config.ts', 'next.config.mjs']) {
        const p = path.join(TEST_DIR, name);
        if (fs.existsSync(p)) fs.unlinkSync(p);
    }

    // ── 5. Add each component via shadcn CLI (local path = same payload as hosted URL) ─
    console.log('📦  shadcn add <apps/www/public/r/{slug}.json> ...\n');
    let ok = 0;
    let fail = 0;
    const errors: string[] = [];

    for (const slug of slugs) {
        const itemPath = path.join(SHADCN_R_DIR, `${slug}.json`);
        const quoted = JSON.stringify(itemPath);
        process.stdout.write(`    ${slug.padEnd(36)} `);
        try {
            execSync(`npx shadcn@latest add ${quoted} -y`, {
                cwd: TEST_DIR,
                stdio: 'pipe',
                env: { ...process.env, CI: '1' },
            });
            console.log('✅');
            ok++;
        } catch (e: unknown) {
            const err = e as { stdout?: Buffer; stderr?: Buffer };
            const msg = (err.stdout?.toString() ?? '') + (err.stderr?.toString() ?? '');
            console.log('❌');
            errors.push(`${slug}: ${msg.slice(0, 200)}`);
            fail++;
        }
    }

    if (fail > 0) {
        console.log(`\n    ${ok} ok, ${fail} failed:`);
        errors.forEach((line) => console.log(`      • ${line}`));
        process.exit(1);
    }
    console.log(`\n    All ${ok} components added via shadcn CLI.\n`);

    // ── 6. Preview routes: docs usageCode + shadcn-installed files (validates CLI output) ─
    const previewSlugs = slugs.filter((s) => usageBySlug.has(s));
    const skippedPreview = slugs.length - previewSlugs.length;
    console.log(
        `🖊   Writing preview pages from usageCode (${previewSlugs.length} routes` +
            (skippedPreview ? `, ${skippedPreview} without usageCode skipped` : '') +
            ')...\n',
    );
    for (const slug of previewSlugs) {
        const usage = usageBySlug.get(slug)!;
        const previewDir = path.join(TEST_DIR, 'src/app/preview', slug);
        fs.mkdirSync(previewDir, { recursive: true });
        fs.writeFileSync(path.join(previewDir, 'page.tsx'), ensureUseClient(usage), 'utf-8');
    }

    // ── 7. Sandbox home page — links to /preview/[slug] ─────────────────────────
    console.log('🖊   Writing src/app/page.tsx — index + preview links...\n');
    const slugsJson = JSON.stringify(slugs, null, 2);
    const previewSlugsJson = JSON.stringify(previewSlugs, null, 2);
    const homePage = `// Auto-generated by scripts/test-shadcn-all-components.ts
const SLUGS: string[] = ${slugsJson};
const PREVIEW_SLUGS: string[] = ${previewSlugsJson};

export default function Home() {
  const previewSet = new Set(PREVIEW_SLUGS);
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-8 md:p-12">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-medium text-indigo-400">UniqueUI · shadcn CLI E2E</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
          Installed components
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
          Components were added with{" "}
          <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-200">
            npx shadcn add …/public/r/&lt;slug&gt;.json
          </code>
          . Each{" "}
          <span className="font-medium text-zinc-200">Open preview</span> route imports the same{" "}
          <code className="rounded bg-zinc-800 px-1.5 py-0.5">usageCode</code> as the docs app
          (from <code className="rounded bg-zinc-800 px-1.5 py-0.5">@/components/ui/&lt;slug&gt;</code>
          ), so you can confirm the shadcn-installed file works end-to-end.
        </p>
        <p className="mt-4 text-sm text-zinc-500">
          Total: <span className="font-semibold text-zinc-300">{SLUGS.length}</span> installed ·{" "}
          <span className="font-semibold text-emerald-400/90">{PREVIEW_SLUGS.length}</span> with preview
        </p>
        <ul className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {SLUGS.map((slug) => (
            <li
              key={slug}
              className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 font-mono text-xs text-zinc-300"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span>{slug}</span>
                {previewSet.has(slug) ? (
                  <a
                    className="rounded-md bg-indigo-600 px-2 py-1 text-[11px] font-semibold text-white no-underline hover:bg-indigo-500"
                    href={\`/preview/\${slug}\`}
                  >
                    Open preview
                  </a>
                ) : (
                  <span className="text-[11px] text-zinc-600">no usageCode</span>
                )}
              </div>
              <div className="mt-1 truncate text-[11px] text-zinc-500">
                src/components/ui/{slug}.tsx
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
`;
    fs.writeFileSync(path.join(TEST_DIR, 'src/app/page.tsx'), homePage, 'utf-8');

    // ── 8. Production build ─────────────────────────────────────────────────────
    console.log('🏗   npm run build (verifies project still compiles)...\n');
    try {
        execSync(`CI=1 NEXT_TELEMETRY_DISABLED=1 npm run build`, {
            cwd: TEST_DIR,
            stdio: 'inherit',
        });
        console.log('\n' + '═'.repeat(60));
        console.log('✅  shadcn E2E PASSED');
        console.log('═'.repeat(60));
        console.log(`\n  Components installed: ${slugs.length}`);
        console.log(`  Test app:             ./${TEST_DIR_NAME}`);
        console.log('  Inspect with:         cd ' + TEST_DIR_NAME + ' && npm run dev\n');
    } catch {
        console.error('\n' + '═'.repeat(60));
        console.error('❌  BUILD FAILED');
        console.error('═'.repeat(60));
        process.exit(1);
    }
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
