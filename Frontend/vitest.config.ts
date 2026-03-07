/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@shared': path.resolve(__dirname, '../packages/shared/src'),
            '@portfolio/shared/schema': path.resolve(__dirname, '../packages/shared/src/schema.ts'),
            '@portfolio/shared/routes': path.resolve(__dirname, '../packages/shared/src/routes.ts'),
            '@portfolio/shared': path.resolve(__dirname, '../packages/shared/src/index.ts'),
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts'],
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/services/**/*', 'src/hooks/**/*', 'src/components/admin/**/*'],
        },
    },
})
