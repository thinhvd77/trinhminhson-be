import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['src/**/*.test.js'],
        mockReset: true,
        clearMocks: true,
        restoreMocks: true,
    },
});
