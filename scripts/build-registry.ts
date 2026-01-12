
import fs from 'fs-extra';
import path from 'path';
import { registry } from '../registry/config';

const REGISTRY_DIR = path.join(__dirname, '../registry');
const OUTPUT_FILE = path.join(__dirname, '../registry.json'); // Hosting it at root for easy raw access

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
    console.log(`Registry built successfully: ${OUTPUT_FILE}`);
}

buildRegistry().catch((err) => {
    console.error(err);
    process.exit(1);
});
