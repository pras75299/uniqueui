
import fs from 'fs-extra';
import path from 'path';
import { registry } from '../registry/config';

const REGISTRY_DIR = path.join(__dirname, '../registry');
const OUTPUT_FILE = path.join(__dirname, '../registry.json'); // Hosting it at root for easy raw access
const APP_PUBLIC_DIR = path.join(__dirname, '../apps/www/public');
const APP_PUBLIC_OUTPUT_FILE = path.join(APP_PUBLIC_DIR, 'registry.json');
const APP_PUBLIC_REGISTRY_DIR = path.join(APP_PUBLIC_DIR, 'registry');
const APP_COMPONENTS_UI_DIR = path.join(__dirname, '../apps/www/components/ui');

type RegistryEntry = (typeof registry)[number] & {
    files: Array<{
        path: string;
        content: string;
        type: string;
    }>;
};

async function syncDocsRegistryArtifacts(entries: RegistryEntry[]) {
    await fs.outputJson(APP_PUBLIC_OUTPUT_FILE, entries, { spaces: 2 });
    await fs.emptyDir(APP_PUBLIC_REGISTRY_DIR);
    await fs.outputJson(
        path.join(APP_PUBLIC_REGISTRY_DIR, 'index.json'),
        { components: entries.map((entry) => entry.name) },
        { spaces: 2 },
    );

    await Promise.all(
        entries.map((entry) =>
            fs.outputJson(path.join(APP_PUBLIC_REGISTRY_DIR, `${entry.name}.json`), entry, { spaces: 2 }),
        ),
    );
}

async function syncDocsUiComponents(entries: RegistryEntry[]) {
    await fs.ensureDir(APP_COMPONENTS_UI_DIR);

    await Promise.all(
        entries.map(async (entry) => {
            const componentFile = entry.files.find((file) => file.type === 'registry:ui');
            if (!componentFile || typeof componentFile.content !== 'string') {
                return;
            }

            await fs.writeFile(path.join(APP_COMPONENTS_UI_DIR, `${entry.name}.tsx`), componentFile.content);
        }),
    );
}

async function buildRegistry() {
    console.log('Building registry...');

    const result: RegistryEntry[] = [];

    for (const component of registry) {
        const componentFiles = [];

        for (const file of component.files) {
            if (file.content) {
                componentFiles.push({
                    path: file.path,
                    content: file.content,
                    type: file.type
                });
                continue;
            }

            const filePath = path.join(REGISTRY_DIR, file.path);
            try {
                const content = await fs.readFile(filePath, 'utf-8');
                componentFiles.push({
                    path: file.path,
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

    await fs.outputJson(OUTPUT_FILE, result, { spaces: 2 });
    await syncDocsRegistryArtifacts(result);
    await syncDocsUiComponents(result);
    console.log(`Registry built successfully: ${OUTPUT_FILE}`);
    console.log(`Registry synced to docs public root: ${APP_PUBLIC_OUTPUT_FILE}`);
    console.log(`Registry synced to docs public directory: ${APP_PUBLIC_REGISTRY_DIR}`);
    console.log(`Registry synced to docs ui components: ${APP_COMPONENTS_UI_DIR}`);
}

buildRegistry().catch((err) => {
    console.error(err);
    process.exit(1);
});
