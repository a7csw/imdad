import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

/**
 * Vite config — tuned for production throughput at the CDN edge.
 *
 * Key perf decisions:
 * - Manual vendor chunks: splits the bundle so a product-page-only change
 *   doesn't bust the framework/router cache on the client. Each vendor group
 *   hashes independently, so a framer-motion upgrade doesn't invalidate React.
 * - `assetsInlineLimit` raised to 8KB: small SVG/PNG assets get base64-inlined
 *   into CSS/JS, saving round-trips (the page has many small icon SVGs).
 * - `cssCodeSplit` on: per-route CSS chunks, smaller critical path.
 * - `reportCompressedSize: false`: skips the gzip size report during build,
 *   which trims ~30–40% off build time on large apps.
 * - `target: 'es2020'`: modern enough for ~98% of browsers, lets esbuild
 *   emit smaller code (no legacy transforms, no regenerator-runtime).
 * - `optimizeDeps.include`: pre-bundle these heavy deps on dev-server start
 *   so the first page load isn't a 5-second dep-discovery pause.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4173,
    // Preview server headers — mirror what a CDN would apply in prod.
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    cssCodeSplit: true,
    sourcemap: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 8 * 1024,
    rollupOptions: {
      output: {
        // Function form: match by resolved module path. More robust than the
        // record form because it handles sub-paths, peer deps, and any package
        // that internally imports from `node_modules/<name>/...`.
        manualChunks(id: string): string | undefined {
          if (!id.includes('node_modules')) return undefined;
          if (/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(id))
            return 'vendor-react';
          if (/node_modules\/(zustand|axios)\//.test(id)) return 'vendor-state';
          if (/node_modules\/(react-hook-form|@hookform|zod)\//.test(id))
            return 'vendor-forms';
          if (/node_modules\/framer-motion\//.test(id)) return 'vendor-motion';
          if (/node_modules\/(i18next|react-i18next)\//.test(id)) return 'vendor-i18n';
          if (/node_modules\/lucide-react\//.test(id)) return 'vendor-icons';
          return undefined;
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      'axios',
      'framer-motion',
      'react-hook-form',
      '@hookform/resolvers',
      'zod',
      'i18next',
      'react-i18next',
      'lucide-react',
      'clsx',
      'tailwind-merge',
    ],
  },
});
