import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { updateTailwindConfig } from './add';

describe('updateTailwindConfig', () => {
    let tmpDir: string;

    beforeEach(async () => {
        tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'uniqueui-tailwind-test-'));
    });

    afterEach(async () => {
        await fs.remove(tmpDir);
        vi.restoreAllMocks();
    });

    // Test 1: Merges animation into empty tailwind config
    it('merges animation into empty tailwind config', async () => {
        const configPath = path.join(tmpDir, 'tailwind.config.ts');
        await fs.writeFile(configPath, [
            'export default {',
            '  content: [],',
            '  theme: {},',
            '  plugins: [],',
            '}',
        ].join('\n'));

        await updateTailwindConfig(configPath, {
            theme: { extend: { animation: { "spin-slow": "spin 3s linear infinite" } } },
        });

        const result = await fs.readFile(configPath, 'utf-8');
        expect(result).toContain('"spin-slow"');
        expect(result).toContain('spin 3s linear infinite');
    });

    // Test 2: Merges keyframes into empty tailwind config
    it('merges keyframes into empty tailwind config', async () => {
        const configPath = path.join(tmpDir, 'tailwind.config.ts');
        await fs.writeFile(configPath, [
            'export default {',
            '  content: [],',
            '  theme: {},',
            '  plugins: [],',
            '}',
        ].join('\n'));

        await updateTailwindConfig(configPath, {
            theme: {
                extend: {
                    keyframes: {
                        "fade-in": {
                            "0%": { opacity: "0" },
                            "100%": { opacity: "1" },
                        },
                    },
                },
            },
        });

        const result = await fs.readFile(configPath, 'utf-8');
        expect(result).toContain('"fade-in"');
        expect(result).toContain('"0%"');
        expect(result).toContain('"100%"');
    });

    // Test 3: Does not overwrite existing animation values
    it('does not overwrite existing animation values', async () => {
        const configPath = path.join(tmpDir, 'tailwind.config.ts');
        await fs.writeFile(configPath, [
            'export default {',
            '  content: [],',
            '  theme: {',
            '    extend: {',
            '      animation: {',
            '        "existing-anim": "something 1s ease-in-out",',
            '      },',
            '    },',
            '  },',
            '  plugins: [],',
            '}',
        ].join('\n'));

        await updateTailwindConfig(configPath, {
            theme: {
                extend: {
                    animation: {
                        "existing-anim": "different 2s linear",
                        "new-anim": "new 1s",
                    },
                },
            },
        });

        const result = await fs.readFile(configPath, 'utf-8');
        // Existing value must not be changed
        expect(result).toContain('something 1s ease-in-out');
        expect(result).not.toContain('different 2s linear');
        // New key must be added
        expect(result).toContain('"new-anim"');
        expect(result).toContain('new 1s');
    });

    // Test 4: Preserves unrelated theme.extend properties
    it('preserves existing theme.extend properties when merging animations', async () => {
        const configPath = path.join(tmpDir, 'tailwind.config.ts');
        await fs.writeFile(configPath, [
            'export default {',
            '  content: [],',
            '  theme: {',
            '    extend: {',
            '      colors: { primary: "#ff0000" },',
            '    },',
            '  },',
            '  plugins: [],',
            '}',
        ].join('\n'));

        await updateTailwindConfig(configPath, {
            theme: { extend: { animation: { "bounce-in": "bounce 0.5s" } } },
        });

        const result = await fs.readFile(configPath, 'utf-8');
        expect(result).toContain('primary');
        expect(result).toContain('#ff0000');
        expect(result).toContain('"bounce-in"');
    });

    // Test 5: Handles CommonJS module.exports style config
    it('handles module.exports (CommonJS) tailwind config', async () => {
        const configPath = path.join(tmpDir, 'tailwind.config.js');
        await fs.writeFile(configPath, [
            'module.exports = {',
            '  content: [],',
            '  theme: {},',
            '  plugins: [],',
            '}',
        ].join('\n'));

        await updateTailwindConfig(configPath, {
            theme: { extend: { animation: { "pulse-slow": "pulse 3s" } } },
        });

        const result = await fs.readFile(configPath, 'utf-8');
        expect(result).toContain('"pulse-slow"');
        expect(result).toContain('pulse 3s');
    });

    // Test 6: Handles missing config file gracefully (no throw)
    it('handles missing config file gracefully', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const missingPath = path.join(tmpDir, 'nonexistent.config.ts');

        // Should not throw
        await expect(
            updateTailwindConfig(missingPath, {
                theme: { extend: { animation: { "test": "test 1s" } } },
            })
        ).resolves.toBeUndefined();

        expect(warnSpy).toHaveBeenCalled();
    });

    // Test 7: Idempotent — running twice produces same output (no duplicates)
    it('is idempotent — running twice does not duplicate entries', async () => {
        const configPath = path.join(tmpDir, 'tailwind.config.ts');
        await fs.writeFile(configPath, [
            'export default {',
            '  content: [],',
            '  theme: {},',
            '  plugins: [],',
            '}',
        ].join('\n'));

        const newConfig = {
            theme: { extend: { animation: { "wiggle": "wiggle 1s ease-in-out infinite" } } },
        };

        await updateTailwindConfig(configPath, newConfig);
        await updateTailwindConfig(configPath, newConfig);

        const result = await fs.readFile(configPath, 'utf-8');
        // Count occurrences of the key — must appear exactly once
        const occurrences = (result.match(/"wiggle"/g) || []).length;
        expect(occurrences).toBe(1);
    });

    // Test 8: Creates theme.extend when it doesn't exist
    it('creates theme.extend when it does not exist', async () => {
        const configPath = path.join(tmpDir, 'tailwind.config.ts');
        await fs.writeFile(configPath, [
            'export default {',
            '  content: [],',
            '  theme: {',
            '    screens: { sm: "640px" },',
            '  },',
            '  plugins: [],',
            '}',
        ].join('\n'));

        await updateTailwindConfig(configPath, {
            theme: { extend: { animation: { "slide-in": "slideIn 0.3s ease" } } },
        });

        const result = await fs.readFile(configPath, 'utf-8');
        // Existing theme.screens must be preserved
        expect(result).toContain('screens');
        expect(result).toContain('640px');
        // New animation must be added under theme.extend
        expect(result).toContain('"slide-in"');
        expect(result).toContain('slideIn 0.3s ease');
    });
});
