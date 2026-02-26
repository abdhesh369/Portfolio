import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
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
        manualChunks: {
          // Group core frameworks together to reduce initial request waterfall
          'vendor-core': ['react', 'react-dom', 'wouter', '@tanstack/react-query'],
          // Motion is heavy but critical for hero, keep separate but fewer chunks overall
          'vendor-animation': ['framer-motion'],
          // Truly non-critical/heavy libraries should be separate
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-popover', '@radix-ui/react-select', '@radix-ui/react-tabs', '@radix-ui/react-toast', 'lucide-react'],
          'vendor-editor': ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/extension-code-block-lowlight', '@tiptap/extension-image', '@tiptap/extension-link'],
          'vendor-three': ['three'],
          'vendor-utils': ['recharts', '@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities', 'react-hook-form', '@hookform/resolvers', 'zod'],
        },
      },
    },
  },
})