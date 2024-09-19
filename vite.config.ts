import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import envify from 'process-envify';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      manifest: {
        name: 'NoPalco',
        short_name: 'NoPalco',
        display: 'standalone',
        scope: '/',
        start_url: '/',
      },
    }),
  ],
  server: {
    watch: {
      usePolling: true,
    },
    host: true,
    strictPort: true,
    port: 5173,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  define: envify({
    VITE_STATEMENT_REQUEST_BASE_URL: process.env.VITE_STATEMENT_REQUEST_BASE_URL,
    VITE_VAR_TEST_ENVFILE_DIRECT: process.env.VITE_VAR_TEST_ENVFILE_DIRECT,
    VITE_VAR_TEST_REPLACETOKENS_A: process.env.VITE_VAR_TEST_REPLACETOKENS_A,
    env: process.env.env,
  }),
});
