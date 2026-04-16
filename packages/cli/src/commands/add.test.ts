import { describe, it, expect, vi, beforeEach } from 'vitest';
import { add } from './add';
import fs from 'fs-extra';
import fetch from 'node-fetch';

vi.mock('fs-extra', () => ({
    default: {
        existsSync: vi.fn(),
        readJson: vi.fn(),
        writeJson: vi.fn(),
        writeFile: vi.fn(),
        ensureDir: vi.fn(),
        stat: vi.fn()
    }
}));

vi.mock('node-fetch');

vi.mock('child_process', () => ({
    spawnSync: vi.fn(() => ({ status: 0, error: undefined, stdout: '', stderr: '' })),
}));

const mockRegistry = [
    {
        name: 'test-component',
        dependencies: ['framer-motion'],
        files: [
            { type: 'registry:ui', path: 'test-component.tsx', content: 'export const Test = () => <div />;' }
        ]
    }
];

import { spawnSync } from 'child_process';

describe('CLI: add command', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.UNIQUEUI_SKIP_REGISTRY_WARN = '1';

        // Mock components.json
        (fs.readJson as any).mockImplementation((path: string) => {
            if (path === 'components.json') {
                return Promise.resolve({
                    paths: { components: 'components/ui', lib: 'utils' },
                    tailwind: { config: 'tailwind.config.js' }
                });
            }
            return Promise.reject(new Error('File not found'));
        });
    });

    it('should fetch from url and write component files', async () => {
        (fetch as any).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockRegistry)
        });

        (fs.existsSync as any).mockReturnValue(false); // Cache miss

        await add('test-component', { url: 'http://example.com/registry' });

        expect(fetch).toHaveBeenCalledWith('http://example.com/registry/registry.json');
        expect(fs.writeFile).toHaveBeenCalledWith(
            expect.stringContaining('test-component.tsx'),
            'export const Test = () => <div />;'
        );
        expect(spawnSync).toHaveBeenCalledWith(
            expect.any(String),
            expect.arrayContaining(['framer-motion']),
            expect.objectContaining({ shell: false }),
        );
    });

    it('should fetch registry each time while in-memory cache is disabled in CLI', async () => {
        (fs.existsSync as any).mockReturnValue(true);
        (fs.stat as any).mockResolvedValue({ mtimeMs: Date.now() - 1000 });
        (fs.readJson as any).mockImplementation((path: string) => {
            if (path === 'components.json') {
                return Promise.resolve({
                    paths: { components: 'components/ui', lib: 'utils' },
                    tailwind: { config: 'tailwind.config.js' },
                });
            }
            if (path.includes('registry-cache')) return Promise.resolve(mockRegistry);
            return Promise.reject(new Error());
        });

        (fetch as any).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockRegistry),
        });

        await add('test-component', { url: 'http://example.com/registry' });

        expect(fetch).toHaveBeenCalled();
        expect(fs.writeFile).toHaveBeenCalled();
    });
});
