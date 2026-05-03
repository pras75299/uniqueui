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

const mockRegistryItem = {
    name: 'test-component',
    dependencies: ['framer-motion'],
    files: [
        { type: 'registry:ui', path: 'test-component/component.tsx', content: 'export const Test = () => <div />;' }
    ]
};

const mockRegistryIndex = {
    components: ['test-component']
};

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

    it('should fetch remote index first and then fetch the component payload', async () => {
        (fetch as any).mockImplementation((url: string) => {
            if (url === 'http://example.com/registry/index.json') {
                return Promise.resolve({
                    ok: true,
                    text: () => Promise.resolve(JSON.stringify(mockRegistryIndex))
                });
            }

            if (url === 'http://example.com/registry/test-component.json') {
                return Promise.resolve({
                    ok: true,
                    text: () => Promise.resolve(JSON.stringify(mockRegistryItem))
                });
            }

            return Promise.resolve({
                ok: false,
                text: () => Promise.resolve(JSON.stringify(null))
            });
        });

        (fs.existsSync as any).mockReturnValue(false); // Cache miss

        await add('test-component', { url: 'http://example.com/registry' });

        expect(fetch).toHaveBeenNthCalledWith(1, 'http://example.com/registry/index.json');
        expect(fetch).toHaveBeenNthCalledWith(2, 'http://example.com/registry/test-component.json');
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

    it('should load local directory registries via index.json and component json files', async () => {
        (fs.existsSync as any).mockReturnValue(false);
        (fs.readJson as any).mockImplementation((path: string) => {
            if (path === 'components.json') {
                return Promise.resolve({
                    paths: { components: 'components/ui', lib: 'utils' },
                    tailwind: { config: 'tailwind.config.js' },
                });
            }
            if (path.endsWith('local-registry/index.json')) return Promise.resolve(mockRegistryIndex);
            if (path.endsWith('local-registry/test-component.json')) return Promise.resolve(mockRegistryItem);
            return Promise.reject(new Error());
        });

        await add('test-component', { url: './local-registry' });

        expect(fetch).not.toHaveBeenCalled();
        expect(fs.readJson).toHaveBeenCalledWith(expect.stringContaining('local-registry/index.json'));
        expect(fs.readJson).toHaveBeenCalledWith(expect.stringContaining('local-registry/test-component.json'));
        expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should treat absolute filesystem registry paths as local sources', async () => {
        (fs.existsSync as any).mockReturnValue(false);
        (fs.readJson as any).mockImplementation((path: string) => {
            if (path === 'components.json') {
                return Promise.resolve({
                    paths: { components: 'components/ui', lib: 'utils' },
                    tailwind: { config: 'tailwind.config.js' },
                });
            }
            if (path.endsWith('/tmp/local-registry/index.json')) return Promise.resolve(mockRegistryIndex);
            if (path.endsWith('/tmp/local-registry/test-component.json')) return Promise.resolve(mockRegistryItem);
            return Promise.reject(new Error());
        });

        await add('test-component', { url: '/tmp/local-registry' });

        expect(fetch).not.toHaveBeenCalled();
        expect(fs.readJson).toHaveBeenCalledWith('/tmp/local-registry/index.json');
        expect(fs.readJson).toHaveBeenCalledWith('/tmp/local-registry/test-component.json');
        expect(fs.writeFile).toHaveBeenCalledWith(
            expect.stringContaining('test-component.tsx'),
            'export const Test = () => <div />;'
        );
    });

    it('should load local split registries when given index.json directly', async () => {
        (fs.existsSync as any).mockReturnValue(false);
        (fs.readJson as any).mockImplementation((path: string) => {
            if (path === 'components.json') {
                return Promise.resolve({
                    paths: { components: 'components/ui', lib: 'utils' },
                    tailwind: { config: 'tailwind.config.js' },
                });
            }
            if (path.endsWith('/tmp/local-registry/index.json')) return Promise.resolve(mockRegistryIndex);
            if (path.endsWith('/tmp/local-registry/test-component.json')) return Promise.resolve(mockRegistryItem);
            return Promise.reject(new Error());
        });

        await add('test-component', { url: '/tmp/local-registry/index.json' });

        expect(fetch).not.toHaveBeenCalled();
        expect(fs.readJson).toHaveBeenCalledWith('/tmp/local-registry/index.json');
        expect(fs.readJson).toHaveBeenCalledWith('/tmp/local-registry/test-component.json');
    });

    it('should load a direct local component payload json', async () => {
        (fs.existsSync as any).mockReturnValue(false);
        (fs.readJson as any).mockImplementation((path: string) => {
            if (path === 'components.json') {
                return Promise.resolve({
                    paths: { components: 'components/ui', lib: 'utils' },
                    tailwind: { config: 'tailwind.config.js' },
                });
            }
            if (path === '/tmp/local-registry/test-component.json') return Promise.resolve(mockRegistryItem);
            return Promise.reject(new Error());
        });

        await add('test-component', { url: '/tmp/local-registry/test-component.json' });

        expect(fetch).not.toHaveBeenCalled();
        expect(fs.readJson).toHaveBeenCalledWith('/tmp/local-registry/test-component.json');
        expect(fs.writeFile).toHaveBeenCalledWith(
            expect.stringContaining('test-component.tsx'),
            'export const Test = () => <div />;'
        );
    });

    it('should fall back to colocated legacy registry.json for local registry directories', async () => {
        (fs.existsSync as any).mockReturnValue(false);
        (fs.readJson as any).mockImplementation((path: string) => {
            if (path === 'components.json') {
                return Promise.resolve({
                    paths: { components: 'components/ui', lib: 'utils' },
                    tailwind: { config: 'tailwind.config.js' },
                });
            }
            if (path.endsWith('/tmp/local-registry/index.json')) return Promise.resolve(null);
            if (path.endsWith('/tmp/local-registry/registry.json')) return Promise.resolve([mockRegistryItem]);
            return Promise.reject(new Error());
        });

        await add('test-component', { url: '/tmp/local-registry' });

        expect(fs.readJson).toHaveBeenCalledWith('/tmp/local-registry/index.json');
        expect(fs.readJson).toHaveBeenCalledWith('/tmp/local-registry/registry.json');
        expect(fs.writeFile).toHaveBeenCalledWith(
            expect.stringContaining('test-component.tsx'),
            'export const Test = () => <div />;'
        );
    });

    it('should try the hosted split registry path before legacy fallbacks', async () => {
        (fetch as any).mockImplementation((url: string) => {
            if (url === 'https://uniqueui-platform.vercel.app/registry/index.json') {
                return Promise.resolve({
                    ok: true,
                    text: () => Promise.resolve(JSON.stringify(mockRegistryIndex))
                });
            }

            if (url === 'https://uniqueui-platform.vercel.app/registry/test-component.json') {
                return Promise.resolve({
                    ok: true,
                    text: () => Promise.resolve(JSON.stringify(mockRegistryItem))
                });
            }

            return Promise.resolve({
                ok: false,
                text: () => Promise.resolve(JSON.stringify(null))
            });
        });

        (fs.existsSync as any).mockReturnValue(false);

        await add('test-component', { url: 'https://uniqueui-platform.vercel.app' });

        expect(fetch).toHaveBeenNthCalledWith(1, 'https://uniqueui-platform.vercel.app/registry/index.json');
        expect(fetch).toHaveBeenNthCalledWith(2, 'https://uniqueui-platform.vercel.app/registry/test-component.json');
        expect(fs.writeFile).toHaveBeenCalledWith(
            expect.stringContaining('test-component.tsx'),
            'export const Test = () => <div />;'
        );
    });

    it('should fetch remote split registries when given index.json directly', async () => {
        (fetch as any).mockImplementation((url: string) => {
            if (url === 'https://uniqueui-platform.vercel.app/registry/index.json') {
                return Promise.resolve({
                    ok: true,
                    text: () => Promise.resolve(JSON.stringify(mockRegistryIndex))
                });
            }

            if (url === 'https://uniqueui-platform.vercel.app/registry/test-component.json') {
                return Promise.resolve({
                    ok: true,
                    text: () => Promise.resolve(JSON.stringify(mockRegistryItem))
                });
            }

            return Promise.resolve({
                ok: false,
                text: () => Promise.resolve(JSON.stringify(null))
            });
        });

        (fs.existsSync as any).mockReturnValue(false);

        await add('test-component', { url: 'https://uniqueui-platform.vercel.app/registry/index.json' });

        expect(fetch).toHaveBeenNthCalledWith(1, 'https://uniqueui-platform.vercel.app/registry/index.json');
        expect(fetch).toHaveBeenNthCalledWith(2, 'https://uniqueui-platform.vercel.app/registry/test-component.json');
        expect(fs.writeFile).toHaveBeenCalledWith(
            expect.stringContaining('test-component.tsx'),
            'export const Test = () => <div />;'
        );
    });

    it('should fetch a direct remote component payload json', async () => {
        (fetch as any).mockImplementation((url: string) => {
            if (url === 'https://uniqueui-platform.vercel.app/registry/test-component.json') {
                return Promise.resolve({
                    ok: true,
                    text: () => Promise.resolve(JSON.stringify(mockRegistryItem))
                });
            }

            return Promise.resolve({
                ok: false,
                text: () => Promise.resolve(JSON.stringify(null))
            });
        });

        (fs.existsSync as any).mockReturnValue(false);

        await add('test-component', { url: 'https://uniqueui-platform.vercel.app/registry/test-component.json' });

        expect(fetch).toHaveBeenCalledWith('https://uniqueui-platform.vercel.app/registry/test-component.json');
        expect(fs.writeFile).toHaveBeenCalledWith(
            expect.stringContaining('test-component.tsx'),
            'export const Test = () => <div />;'
        );
    });

    it('should fall back to legacy registry.json from direct split endpoints', async () => {
        (fetch as any).mockImplementation((url: string) => {
            if (url === 'https://uniqueui-platform.vercel.app/registry/index.json') {
                return Promise.resolve({
                    ok: false,
                    text: () => Promise.resolve(JSON.stringify(null))
                });
            }

            if (url === 'https://uniqueui-platform.vercel.app/registry.json') {
                return Promise.resolve({
                    ok: true,
                    text: () => Promise.resolve(JSON.stringify([mockRegistryItem]))
                });
            }

            return Promise.resolve({
                ok: false,
                text: () => Promise.resolve(JSON.stringify(null))
            });
        });

        (fs.existsSync as any).mockReturnValue(false);

        await add('test-component', { url: 'https://uniqueui-platform.vercel.app/registry/index.json' });

        expect(fetch).toHaveBeenNthCalledWith(1, 'https://uniqueui-platform.vercel.app/registry/index.json');
        expect(fetch).toHaveBeenNthCalledWith(2, 'https://uniqueui-platform.vercel.app/registry/registry.json');
        expect(fs.writeFile).toHaveBeenCalledWith(
            expect.stringContaining('test-component.tsx'),
            'export const Test = () => <div />;'
        );
    });

    it('should fall back to directory-scoped legacy registry.json for direct registry URLs', async () => {
        (fetch as any).mockImplementation((url: string) => {
            if (url === 'https://uniqueui-platform.vercel.app/registry/index.json') {
                return Promise.resolve({
                    ok: false,
                    text: () => Promise.resolve(JSON.stringify(null))
                });
            }

            if (url === 'https://uniqueui-platform.vercel.app/registry/registry.json') {
                return Promise.resolve({
                    ok: true,
                    text: () => Promise.resolve(JSON.stringify([mockRegistryItem]))
                });
            }

            return Promise.resolve({
                ok: false,
                text: () => Promise.resolve(JSON.stringify(null))
            });
        });

        (fs.existsSync as any).mockReturnValue(false);

        await add('test-component', { url: 'https://uniqueui-platform.vercel.app/registry' });

        expect(fetch).toHaveBeenNthCalledWith(1, 'https://uniqueui-platform.vercel.app/registry/index.json');
        expect(fetch).toHaveBeenNthCalledWith(2, 'https://uniqueui-platform.vercel.app/registry/registry.json');
        expect(fs.writeFile).toHaveBeenCalledWith(
            expect.stringContaining('test-component.tsx'),
            'export const Test = () => <div />;'
        );
    });
});
