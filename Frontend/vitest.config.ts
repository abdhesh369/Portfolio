/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
    plugins: [
        react(),
        VitePWA({ disable: true }),
    ] as any[],
    resolve: {
        alias: {
            '#src': path.resolve(__dirname, './src'),
            '#shared': path.resolve(__dirname, '../packages/shared/src'),
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
            include: ['src/**/*.{ts,tsx}'],
            exclude: [
                'src/**/*.test.{ts,tsx}',
                'src/**/*.spec.{ts,tsx}',
                'src/test/**',
                'src/vite-env.d.ts',
                'src/main.tsx',
            ],
        },
    },
})

