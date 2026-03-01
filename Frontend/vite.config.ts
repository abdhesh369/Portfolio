import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: false, filename: 'stats.html', gzipSize: true, brotliSize: true }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './Resources'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1200,
    target: 'es2020',
    cssCodeSplit: true,
    // Only preload chunks needed on every page — skip admin-only heavy chunks
    modulePreload: {
      resolveDependencies: (_filename: string, deps: string[]) => {
        return deps.filter(dep =>
          !dep.includes('vendor-editor') &&
          !dep.includes('vendor-admin') &&
          !dep.includes('vendor-three') &&
          !dep.includes('AdminDashboard') &&
          !dep.includes('RichTextEditor')
        );
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.warn', 'console.info', 'console.debug'],
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          const nm = id.split('node_modules/').pop()?.split('/').slice(0, id.includes('@') ? 2 : 1).join('/');

          // Admin-only: rich text editor + all prosemirror/tiptap deps
          if (
            id.includes('/@tiptap/') ||
            id.includes('/prosemirror') ||
            id.includes('/lowlight/') ||
            id.includes('/highlight.js/') ||
            id.includes('/@lezer/') ||
            id.includes('/y-prosemirror/') ||
            id.includes('/orderedmap/')
          ) return 'vendor-editor';

          // Admin-only: 3D background
          if (id.includes('/three/')) return 'vendor-three';

          // Admin-only: charts + drag-and-drop + their transitive deps
          // Intentionally routed to vendor-misc (not a separate chunk) to avoid
          // Rollup placing the CJS interop helper here and creating a cross-dep
          // from vendor-core → vendor-admin that forces 400KB on every page.
          if (
            id.includes('/recharts/') ||
            id.includes('/d3-') ||
            id.includes('/internmap/') ||
            id.includes('/react-redux/') ||
            id.includes('/redux/') ||
            id.includes('/@redux') ||
            id.includes('/victory-vendor/') ||
            id.includes('/react-smooth/') ||
            id.includes('/decimal.js-light/') ||
            id.includes('/eventemitter3/') ||
            id.includes('/es-toolkit/') ||
            id.includes('/immer/') ||
            id.includes('/reselect/') ||
            id.includes('/@dnd-kit/')
          ) return 'vendor-misc';

          // Core framework — always needed
          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/wouter/') ||
            id.includes('/@tanstack/react-query') ||
            id.includes('/@tanstack/query-core') ||
            id.includes('/react-is/') ||
            id.includes('/use-sync-external-store/') ||
            id.includes('/scheduler/') ||
            id.includes('/regexparam/')
          ) return 'vendor-core';

          // Motion — used on hero, keep separate
          if (
            id.includes('/framer-motion/') ||
            id.includes('/motion-dom/') ||
            id.includes('/motion-utils/')
          ) return 'vendor-animation';

          // UI primitives — shared across many components
          if (
            id.includes('/@radix-ui/') ||
            id.includes('/lucide-react/') ||
            id.includes('/clsx/') ||
            id.includes('/class-variance-authority/') ||
            id.includes('/tailwind-merge/')
          ) return 'vendor-ui';

          // Forms: used by Contact (lazy-loaded public page)
          if (
            id.includes('/react-hook-form/') ||
            id.includes('/@hookform/') ||
            id.includes('/zod/')
          ) return 'vendor-forms';

          // Catch-all: keep remaining node_modules out of index chunk
          return 'vendor-misc';
        },
      },
    },
  },
})