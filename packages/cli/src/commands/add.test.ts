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
    execSync: vi.fn()
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

describe('CLI: add command', () => {
    beforeEach(() => {
        vi.clearAllMocks();

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
    });

    it('should use cache if available and young', async () => {
        (fs.existsSync as any).mockReturnValue(true);
        (fs.stat as any).mockResolvedValue({ mtimeMs: Date.now() - 1000 }); // 1 sec old
        (fs.readJson as any).mockImplementation((path: string) => {
            if (path === 'components.json') return Promise.resolve({ paths: {} });
            if (path.includes('registry-cache')) return Promise.resolve(mockRegistry);
            return Promise.reject(new Error());
        });

        await add('test-component', { url: 'http://example.com/registry' });

        expect(fetch).not.toHaveBeenCalled(); // Cache hit
        expect(fs.writeFile).toHaveBeenCalled();
    });
});
