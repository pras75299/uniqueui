import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DocScenario {
    title: string;
    description: string;
    code: string;
}

interface ComponentDocs {
    slug: string;
    overview: string;
    scenarios: DocScenario[];
}

interface ComponentEntry {
    slug: string;
    usageCode: string;
    scenarios: DocScenario[];
    overview: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toPascalCase(slug: string): string {
    const pascal = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
    // JS identifiers cannot start with a digit — prefix with 'Comp' in that case
    return /^\d/.test(pascal) ? 'Comp' + pascal : pascal;
}

/**
 * Extract the content of a backtick-delimited template literal from `content`
 * starting at position `startTick`. Handles escaped backticks and ${...} nesting.
 */
function extractTemplateLiteral(src: string, startTick: number): { raw: string; end: number } {
    let i = startTick + 1;
    let depth = 0;
    while (i < src.length) {
        const ch = src[i];
        if (ch === '\\') { i += 2; continue; }
        if (depth === 0 && ch === '`') return { raw: src.substring(startTick + 1, i), end: i };
        if (ch === '$' && src[i + 1] === '{') { depth++; i += 2; continue; }
        if (ch === '}' && depth > 0) { depth--; i++; continue; }
        i++;
    }
    return { raw: src.substring(startTick + 1, i), end: i };
}

/**
 * Ensure a code snippet has "use client" at the top. Avoids duplicates.
 */
function ensureUseClient(code: string): string {
    const stripped = code.trimStart();
    if (stripped.startsWith('"use client"') || stripped.startsWith("'use client'")) return code;
    return '"use client";\n\n' + code;
}

/**
 * Escape a string for safe inline use inside JSX attributes.
 */
function escapeJsx(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run() {
    const ROOT_DIR = path.join(__dirname, '..');
    const COMPONENTS_FILE = path.join(ROOT_DIR, 'apps/www/config/components.ts');

    // ── 1. Parse components.ts for slugs + usageCodes ─────────────────────────
    console.log('📖  Extracting component configurations from components.ts...');
    const rawComponents: { slug: string; usageCode: string }[] = [];
    try {
        // Prefer loading the generated module directly. This is resilient to
        // formatting changes (quoted keys, string literals, etc.) in components.ts.
        const componentsModule = require(path.join(ROOT_DIR, 'apps/www/config/components'));
        const componentsList = Array.isArray(componentsModule?.componentsList) ? componentsModule.componentsList : [];
        for (const component of componentsList) {
            if (typeof component?.slug !== 'string') continue;
            if (typeof component?.usageCode !== 'string') continue;
            rawComponents.push({ slug: component.slug, usageCode: component.usageCode });
        }
    } catch (e) {
        // Fallback parser for environments where requiring TS config fails.
        const content = fs.readFileSync(COMPONENTS_FILE, 'utf-8');
        const slugRegex = /(?:slug|"slug")\s*:\s*"([^"]+)"/g;
        let match: RegExpExecArray | null;
        while ((match = slugRegex.exec(content)) !== null) {
            const slug = match[1];
            const usageMatch = content.slice(match.index).match(/(?:usageCode|"usageCode")\s*:\s*("((?:\\.|[^"\\])*)"|`)/);
            if (!usageMatch) continue;

            let usageCode = '';
            if (usageMatch[1] === '`') {
                const startTick = content.indexOf('`', match.index);
                if (startTick === -1) continue;
                const { raw } = extractTemplateLiteral(content, startTick);
                usageCode = raw.replace(/\\`/g, '`').replace(/\\\$/g, '$');
            } else {
                try {
                    usageCode = JSON.parse(usageMatch[1]);
                } catch {
                    usageCode = usageMatch[2]?.replace(/\\"/g, '"').replace(/\\n/g, '\n') ?? '';
                }
            }

            if (usageCode) {
                rawComponents.push({ slug, usageCode });
            }
        }
    }

    console.log(`   Found ${rawComponents.length} components.\n`);

    // ── 2. Load scenarios from docs-scenarios.ts (no external imports — safe) ─
    let docsScenarios: Record<string, ComponentDocs> = {};
    try {
        // ts-node handles .ts requires directly
        const mod = require(path.join(ROOT_DIR, 'apps/www/config/docs-scenarios'));
        docsScenarios = mod.docsScenarios ?? {};
        const totalScenarios = Object.values(docsScenarios).reduce(
            (sum, d) => sum + (d.scenarios?.length ?? 0), 0
        );
        console.log(`📋  Loaded ${Object.keys(docsScenarios).length} component docs — ${totalScenarios} scenarios total.\n`);
    } catch (e: any) {
        console.warn(`⚠️   Could not load docs-scenarios.ts: ${e.message}`);
        console.warn('    Scenario pages will be skipped.\n');
    }

    // ── 3. Merge components + scenarios ───────────────────────────────────────
    const components: ComponentEntry[] = rawComponents.map(c => ({
        ...c,
        scenarios: docsScenarios[c.slug]?.scenarios ?? [],
        overview: docsScenarios[c.slug]?.overview ?? '',
    }));

    const totalScenarioPages = components.reduce((sum, c) => sum + c.scenarios.length, 0);
    const totalPages = components.length /* hub */ + components.length /* demo */ + totalScenarioPages;

    console.log(`📊  Breakdown:`);
    console.log(`    ${components.length} components`);
    console.log(`    ${totalScenarioPages} scenario pages`);
    console.log(`    ${totalPages} total pages to generate\n`);

    // ── 4. Rebuild registry.json so it always reflects the current registry ───
    console.log('🔨  Rebuilding registry.json...');
    try {
        execSync(`npx ts-node ${path.join(__dirname, 'build-registry.ts')}`, {
            cwd: ROOT_DIR,
            stdio: 'pipe',
        });
        console.log('    ✅ registry.json rebuilt.\n');
    } catch (e: any) {
        console.error('    ❌ registry build failed:', e.stdout?.toString(), e.stderr?.toString());
        process.exit(1);
    }

    // ── 5. Create a fresh Next.js app ──────────────────────────────────────────
    const TEST_DIR = path.join(ROOT_DIR, 'e2e-components-test');
    if (fs.existsSync(TEST_DIR)) {
        console.log('🗑   Removing previous e2e-components-test directory...');
        fs.rmSync(TEST_DIR, { recursive: true, force: true });

        // Wait until the directory is fully gone before proceeding.
        // On some systems (macOS APFS, network volumes) the filesystem flushes
        // asynchronously, so create-next-app can still see residual entries
        // like .next/ even right after rmSync returns.
        const pollStart = Date.now();
        const pollTimeout = 2000; // ms
        while (fs.existsSync(TEST_DIR)) {
            if (Date.now() - pollStart > pollTimeout) {
                console.error(`    ❌ Timed out waiting for ${TEST_DIR} to be removed.`);
                process.exit(1);
            }
            execSync('sleep 0.1');
        }
    }

    console.log('🚀  Creating fresh Next.js app...');
    try {
        execSync(
            `echo "\\n" | npx create-next-app@14 e2e-components-test --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes`,
            { cwd: ROOT_DIR, stdio: 'pipe' }
        );
        console.log('    ✅ Next.js app created.\n');
    } catch (e: any) {
        console.error('create-next-app failed:\n', e.stdout?.toString(), e.stderr?.toString());
        process.exit(1);
    }

    // ── 5. Bootstrap the test project ─────────────────────────────────────────
    console.log('⚙️   Bootstrapping project config...');

    const configData = {
        $schema: 'https://uniqueui.com/schema.json',
        style: 'default',
        rsc: true,
        tsx: true,
        tailwind: { config: 'tailwind.config.ts', css: 'app/globals.css', baseColor: 'slate', cssVariables: true },
        aliases: { components: '@/components', utils: '@/utils' },
        paths: { components: 'src/components/ui', lib: 'src/utils' },
    };
    fs.writeFileSync(path.join(TEST_DIR, 'components.json'), JSON.stringify(configData, null, 2));

    const cnContent = `import { type ClassValue, clsx } from "clsx";\nimport { twMerge } from "tailwind-merge";\n\nexport function cn(...inputs: ClassValue[]) {\n  return twMerge(clsx(inputs));\n}\n`;
    const utilsDir = path.join(TEST_DIR, 'src/utils');
    const libDir   = path.join(TEST_DIR, 'src/lib');
    fs.mkdirSync(utilsDir, { recursive: true });
    fs.mkdirSync(libDir,   { recursive: true });
    fs.writeFileSync(path.join(utilsDir, 'cn.ts'),   cnContent);
    fs.writeFileSync(path.join(libDir,   'utils.ts'), cnContent);

    // next.config.js — disable ESLint + type-check during build to keep the test focused on runtime
    const nextConfigContent = [
        '/** @type {import(\'next\').NextConfig} */',
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

    // Install runtime dependencies
    console.log('    Installing lucide-react + motion...');
    try {
        execSync('npm install lucide-react motion --save', { cwd: TEST_DIR, stdio: 'pipe' });
        console.log('    ✅ Dependencies installed.\n');
    } catch (e: any) {
        console.warn('    ⚠️  Dependency install warning:', e.stdout?.toString());
    }

    // ── 6. Add every component via CLI ────────────────────────────────────────
    console.log('📦  Adding components via CLI...\n');
    let addPassed = 0;
    let addFailed = 0;
    const addErrors: string[] = [];

    for (const comp of components) {
        process.stdout.write(`    Adding ${comp.slug}... `);
        try {
            execSync(
                `npx ts-node ../packages/cli/src/index.ts add ${comp.slug} --url ../registry.json`,
                { cwd: TEST_DIR, stdio: 'pipe' }
            );
            console.log('✅');
            addPassed++;
        } catch (e: any) {
            const msg = (e.stdout?.toString() ?? '') + (e.stderr?.toString() ?? '');
            console.log('❌');
            addErrors.push(`${comp.slug}: ${msg.slice(0, 120)}`);
            addFailed++;
        }
    }

    if (addFailed > 0) {
        console.log(`\n    ${addPassed} added, ${addFailed} failed:`);
        addErrors.forEach(e => console.log(`      • ${e}`));
    } else {
        console.log(`\n    All ${addPassed} components added successfully.\n`);
    }

    // ── 7. Generate pages ──────────────────────────────────────────────────────
    console.log('🖊   Generating pages...\n');

    for (const comp of components) {
        const compDir = path.join(TEST_DIR, 'src/app', comp.slug);
        fs.mkdirSync(compDir, { recursive: true });

        const name = toPascalCase(comp.slug);

        // ── Hub page: lists demo + all scenario links ────────────────────────
        const scenarioItems = comp.scenarios.map((s, i) => [
            `        <a href="/${comp.slug}/scenario-${i + 1}" style={{ display: 'block', padding: '14px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', textDecoration: 'none', color: 'inherit', background: '#fff', transition: 'box-shadow 0.15s' }}>`,
            `          <div style={{ fontWeight: 600, fontSize: '14px', color: '#1a202c' }}>Scenario ${i + 1}: ${escapeJsx(s.title)}</div>`,
            `          <div style={{ fontSize: '12px', color: '#718096', marginTop: '4px' }}>${escapeJsx(s.description)}</div>`,
            `        </a>`,
        ].join('\n')).join('\n');

        const hubPage = [
            `export default function ${name}Hub() {`,
            `  return (`,
            `    <main style={{ minHeight: '100vh', padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>`,
            `      <a href="/" style={{ fontSize: '13px', color: '#6366f1', textDecoration: 'none' }}>← Back to index</a>`,
            `      <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '12px 0 8px' }}>${comp.slug}</h1>`,
            comp.overview
                ? `      <p style={{ color: '#4a5568', fontSize: '15px', maxWidth: '600px', lineHeight: 1.6, marginBottom: '28px' }}>${escapeJsx(comp.overview)}</p>`
                : `      <div style={{ marginBottom: '28px' }} />`,
            `      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>`,
            `        <a href="/${comp.slug}/demo" style={{ display: 'block', padding: '14px 16px', border: '2px solid #6366f1', borderRadius: '8px', textDecoration: 'none', background: '#eef2ff' }}>`,
            `          <div style={{ fontWeight: 700, fontSize: '14px', color: '#4338ca' }}>▶ Main Demo</div>`,
            `          <div style={{ fontSize: '12px', color: '#6366f1', marginTop: '4px' }}>Primary usageCode example</div>`,
            `        </a>`,
            scenarioItems || `        <p style={{ color: '#a0aec0', fontSize: '13px' }}>No scenarios defined yet.</p>`,
            `      </div>`,
            `    </main>`,
            `  );`,
            `}`,
        ].join('\n');

        fs.writeFileSync(path.join(compDir, 'page.tsx'), hubPage);

        // ── Demo page: usageCode ─────────────────────────────────────────────
        const demoDir = path.join(compDir, 'demo');
        fs.mkdirSync(demoDir, { recursive: true });
        fs.writeFileSync(path.join(demoDir, 'page.tsx'), ensureUseClient(comp.usageCode));

        // ── Scenario pages ───────────────────────────────────────────────────
        for (let i = 0; i < comp.scenarios.length; i++) {
            const scenario = comp.scenarios[i];
            const scenarioDir = path.join(compDir, `scenario-${i + 1}`);
            fs.mkdirSync(scenarioDir, { recursive: true });

            // Write the scenario code as a standalone page. The scenario exports
            // `export default function Foo()` which Next.js treats as the page.
            const scenarioPage = ensureUseClient(scenario.code);
            fs.writeFileSync(path.join(scenarioDir, 'page.tsx'), scenarioPage);
        }

        const statusLine = comp.scenarios.length > 0
            ? `hub + demo + ${comp.scenarios.length} scenario${comp.scenarios.length > 1 ? 's' : ''}`
            : 'hub + demo';
        console.log(`    ${comp.slug.padEnd(38)} ${statusLine}`);
    }

    // ── 8. Summary page ───────────────────────────────────────────────────────
    const summaryDir = path.join(TEST_DIR, 'src/app/summary');
    fs.mkdirSync(summaryDir, { recursive: true });

    const summaryRows = components.map(c => [
        `    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>`,
        `      <td style={{ padding: '10px 14px' }}><a href="/${c.slug}" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 500 }}>${c.slug}</a></td>`,
        `      <td style={{ padding: '10px 14px', textAlign: 'center' }}><a href="/${c.slug}/demo" style={{ color: '#6366f1', textDecoration: 'none' }}>demo</a></td>`,
        `      <td style={{ padding: '10px 14px', color: '#718096', fontSize: '13px' }}>`,
        c.scenarios.length > 0
            ? c.scenarios.map((s, i) =>
                `        <a href="/${c.slug}/scenario-${i + 1}" style={{ color: '#6366f1', textDecoration: 'none', marginRight: '8px', display: 'inline-block' }}>${i + 1}. ${escapeJsx(s.title)}</a>`
              ).join('\n')
            : `        <span style={{ color: '#cbd5e0' }}>—</span>`,
        `      </td>`,
        `    </tr>`,
    ].join('\n')).join('\n');

    const summaryPage = [
        `export default function Summary() {`,
        `  return (`,
        `    <main style={{ minHeight: '100vh', padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>`,
        `      <a href="/" style={{ fontSize: '13px', color: '#6366f1', textDecoration: 'none' }}>← Back to index</a>`,
        `      <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '12px 0 4px' }}>Test Summary</h1>`,
        `      <p style={{ color: '#718096', fontSize: '14px', marginBottom: '28px' }}>`,
        `        ${components.length} components &nbsp;·&nbsp; ${totalScenarioPages} scenarios &nbsp;·&nbsp; ${totalPages} pages compiled`,
        `      </p>`,
        `      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>`,
        `        <thead>`,
        `          <tr style={{ background: '#f7fafc', borderBottom: '2px solid #e2e8f0' }}>`,
        `            <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600 }}>Component</th>`,
        `            <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600 }}>Demo</th>`,
        `            <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600 }}>Scenarios</th>`,
        `          </tr>`,
        `        </thead>`,
        `        <tbody>`,
        summaryRows,
        `        </tbody>`,
        `      </table>`,
        `    </main>`,
        `  );`,
        `}`,
    ].join('\n');

    fs.writeFileSync(path.join(summaryDir, 'page.tsx'), summaryPage);

    // ── 9. Index page ─────────────────────────────────────────────────────────
    const cards = components.map(c => {
        const scenarioCount = c.scenarios.length;
        const badge = scenarioCount > 0 ? ` (${scenarioCount} scenario${scenarioCount > 1 ? 's' : ''})` : '';
        return [
            `        <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', background: '#fff' }}>`,
            `          <a href="/${c.slug}" style={{ display: 'block', padding: '14px 16px 8px', textDecoration: 'none', color: 'inherit' }}>`,
            `            <div style={{ fontWeight: 600, fontSize: '13px', color: '#1a202c' }}>${c.slug}</div>`,
            `            <div style={{ fontSize: '11px', color: '#a0aec0', marginTop: '2px' }}>hub${badge}</div>`,
            `          </a>`,
            `          <div style={{ display: 'flex', gap: '6px', padding: '0 16px 12px', flexWrap: 'wrap' }}>`,
            `            <a href="/${c.slug}/demo" style={{ fontSize: '11px', padding: '2px 8px', background: '#eef2ff', borderRadius: '99px', color: '#4338ca', textDecoration: 'none' }}>demo</a>`,
            ...c.scenarios.map((s, i) =>
                `            <a href="/${c.slug}/scenario-${i + 1}" style={{ fontSize: '11px', padding: '2px 8px', background: '#f0fdf4', borderRadius: '99px', color: '#166534', textDecoration: 'none' }}>s${i + 1}</a>`
            ),
            `          </div>`,
            `        </div>`,
        ].join('\n');
    }).join('\n');

    const indexPage = [
        `export default function Home() {`,
        `  return (`,
        `    <main style={{ minHeight: '100vh', padding: '40px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>`,
        `      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>`,
        `        <div>`,
        `          <h1 style={{ fontSize: '30px', fontWeight: 800, margin: '0 0 6px' }}>UniqueUI Sandbox</h1>`,
        `          <p style={{ color: '#718096', fontSize: '14px', margin: 0 }}>`,
        `            ${components.length} components &nbsp;·&nbsp; ${totalScenarioPages} scenario pages &nbsp;·&nbsp; ${totalPages} pages compiled`,
        `          </p>`,
        `        </div>`,
        `        <a href="/summary" style={{ padding: '8px 16px', background: '#6366f1', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>View Summary →</a>`,
        `      </div>`,
        `      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>`,
        cards,
        `      </div>`,
        `    </main>`,
        `  );`,
        `}`,
    ].join('\n');

    fs.writeFileSync(path.join(TEST_DIR, 'src/app/page.tsx'), indexPage);
    console.log(`\n    ✅ Pages written (index + summary + ${totalPages} component pages)\n`);

    // ── 10. Build verification ─────────────────────────────────────────────────
    console.log('🏗   Building Next.js app (this verifies every page compiles)...\n');
    try {
        execSync(`CI=1 NEXT_TELEMETRY_DISABLED=1 npm run build`, { cwd: TEST_DIR, stdio: 'inherit' });

        console.log('\n' + '═'.repeat(60));
        console.log('✅  E2E Test PASSED');
        console.log('═'.repeat(60));
        console.log(`\n  Components : ${components.length}`);
        console.log(`  Demos      : ${components.length}`);
        console.log(`  Scenarios  : ${totalScenarioPages}`);
        console.log(`  Total pages: ${totalPages}`);
        console.log('\n  Browse the sandbox at:   ./e2e-components-test');
        console.log('  Run it with:             cd e2e-components-test && npm run dev');
        console.log('  Full test map:           http://localhost:3000/summary\n');
    } catch (e: any) {
        console.error('\n' + '═'.repeat(60));
        console.error('❌  E2E Test FAILED during build');
        console.error('═'.repeat(60));
        console.error('\nCheck the output above for the failing page.\n');
        process.exit(1);
    }
}

run().catch(console.error);
