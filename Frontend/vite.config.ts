import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    visualizer({ open: false, filename: 'stats.html', gzipSize: true, brotliSize: true }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png', 'offline.html'],
      manifest: {
        name: 'Abdhesh Sah | Portfolio',
        short_name: 'Abdhesh',
        description: 'Senior Full-Stack Engineer specializing in high-performance web systems.',
        theme_color: '#00B4D8',
        background_color: '#050510',
        display: 'standalone',
        icons: [
          {
            src: 'icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icons/pwa-512x512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        offlineFallbackPage: '/offline.html',
        runtimeCaching: [
          // Public API routes: StaleWhileRevalidate, 7-day TTL
          {
            urlPattern: /\/api\/v1\/(projects|skills|articles|experiences)(\/|$|\?)/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-public-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7  // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Admin & auth routes: NetworkOnly (never cached)
          {
            urlPattern: /\/api\/v1\/(admin|auth)(\/|$|\?)/i,
            handler: 'NetworkOnly',
          },
          // Google Fonts stylesheets
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Google Fonts files
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    }),
  ],
  esbuild: mode === 'production' ? {
    drop: ['console', 'debugger'],
  } : {},
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
      '/health': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/ping': {
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
    // Use esbuild (Vite default) instead of Terser — Terser's variable
    // collapsing breaks Zod v3/v4 dual-bundle TDZ semantics.
    minify: 'esbuild',
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
          // react-hook-form + @hookform MUST live here with React to avoid
          // Rollup cross-chunk TDZ errors (vendor-forms → vendor-core circular).
          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/wouter/') ||
            id.includes('/@tanstack/react-query') ||
            id.includes('/@tanstack/query-core') ||
            id.includes('/react-is/') ||
            id.includes('/use-sync-external-store/') ||
            id.includes('/scheduler/') ||
            id.includes('/regexparam/') ||
            id.includes('/react-hook-form/') ||
            id.includes('/@hookform/')
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

          // Zod — pure JS, no React dependency, safe in its own chunk
          if (id.includes('/zod/')) return 'vendor-forms';

          // Let Rollup auto-split remaining node_modules — DO NOT use a
          // catch-all here. Forcing unrelated packages into one chunk
          // causes TDZ (Temporal Dead Zone) errors when esbuild reorders
          // minified variable declarations across modules.
          return;
        },
      },
    },
  },
}))