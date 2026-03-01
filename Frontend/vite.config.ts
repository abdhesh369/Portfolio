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
          // Core framework — always needed
          'vendor-core': ['react', 'react-dom', 'wouter', '@tanstack/react-query'],
          // Motion is heavy but used on hero, keep separate
          'vendor-animation': ['framer-motion'],
          // UI primitives — shared across many components  
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-popover', '@radix-ui/react-select', '@radix-ui/react-tabs', '@radix-ui/react-toast', 'lucide-react'],
          // Admin-only: rich text editor
          'vendor-editor': ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/extension-code-block-lowlight', '@tiptap/extension-image', '@tiptap/extension-link'],
          // Admin-only: 3D background
          'vendor-three': ['three'],
          // Admin-only: charts + drag-and-drop
          'vendor-admin': ['recharts', 'react-is', '@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          // Forms: used by Contact (lazy-loaded public page)
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
        },
      },
    },
  },
})