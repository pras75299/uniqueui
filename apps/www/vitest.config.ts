import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';

export default defineConfig(async () => {
    const { default: react } = await import('@vitejs/plugin-react');

    return {
        plugins: [react()],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./', import.meta.url)),
            },
        },
        test: {
            environment: 'jsdom',
            globals: true,
            setupFiles: ['./tests/setup.ts'],
            // Playwright E2E specs live in `./e2e` and must NOT be picked up by Vitest.
            exclude: ['node_modules', 'dist', '.next', 'e2e/**'],
        },
    };
});
