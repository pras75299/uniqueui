
import fs from 'fs-extra';
import path from 'path';
import { registry } from '../registry/config';

const REGISTRY_DIR = path.join(__dirname, '../registry');
const ROOT_OUTPUT = path.join(__dirname, '../registry.json');
const WWW_MONOLITH_OUTPUT = path.join(__dirname, '../apps/www/public/registry.json');
const WWW_SPLIT_DIR = path.join(__dirname, '../apps/www/public/registry');
const WWW_UI_DIR = path.join(__dirname, '../apps/www/components/ui');

async function buildRegistry() {
    console.log('Building registry...');

    const result = [];

    for (const component of registry) {
        const componentFiles = [];

        for (const file of component.files) {
            if (file.content) {
                componentFiles.push({
                    path: file.path,
                    content: file.content,
                    type: file.type,
                });
                continue;
            }

            const filePath = path.join(REGISTRY_DIR, file.path);
            try {
                const content = await fs.readFile(filePath, 'utf-8');
                // Normalize output path: registry:ui files always use <slug>.tsx so the CLI
                // writes the correct filename to the user's project (not "component.tsx").
                const outputPath = file.type === 'registry:ui'
                    ? `${component.name}.tsx`
                    : file.path;
                componentFiles.push({
                    path: outputPath,
                    content,
                    type: file.type,
                });
            } catch (error) {
                console.error(`Error reading file ${file.path} for component ${component.name}:`, error);
                process.exit(1);
            }
        }

        result.push({
            ...component,
            files: componentFiles,
        });
    }

    // 1. Write monolith registry.json at repo root (for GitHub raw access + backward compat)
    await fs.outputJson(ROOT_OUTPUT, result, { spaces: 2 });
    console.log(`  ✓ registry.json (root)`);

    // 2. Write monolith copy for apps/www/public (served by Next.js)
    await fs.outputJson(WWW_MONOLITH_OUTPUT, result, { spaces: 2 });
    console.log(`  ✓ apps/www/public/registry.json`);

    // 3. Write per-component split files (96% payload reduction per CLI install)
    await fs.ensureDir(WWW_SPLIT_DIR);

    const indexData = { components: result.map((c) => c.name) };
    await fs.outputJson(path.join(WWW_SPLIT_DIR, 'index.json'), indexData, { spaces: 2 });

    for (const component of result) {
        await fs.outputJson(
            path.join(WWW_SPLIT_DIR, `${component.name}.json`),
            component,
            { spaces: 2 }
        );
    }
    console.log(`  ✓ apps/www/public/registry/ (${result.length} component files + index.json)`);

    // 4. Auto-sync component source files to apps/www/components/ui/
    //    Eliminates the manual "copy to apps/www/components/ui/" step.
    await fs.ensureDir(WWW_UI_DIR);
    let synced = 0;
    let skipped = 0;

    for (const component of registry) {
        for (const file of component.files) {
            if (file.type !== 'registry:ui') continue;
            if (file.content) { skipped++; continue; } // inline content — no source file on disk

            const srcPath = path.join(REGISTRY_DIR, file.path);
            if (!await fs.pathExists(srcPath)) { skipped++; continue; }

            // Always write as <slug>.tsx regardless of the source path structure
            const destPath = path.join(WWW_UI_DIR, `${component.name}.tsx`);
            await fs.copy(srcPath, destPath, { overwrite: true });
            synced++;
        }
    }
    console.log(`  ✓ ${synced} component files synced to apps/www/components/ui/`);

    console.log('\nBuild complete.');
}

buildRegistry().catch((err) => {
    console.error(err);
    process.exit(1);
});
