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
        },
    };
});
