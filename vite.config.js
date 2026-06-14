import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    host: '127.0.0.1',   // bind to IPv4 explicitly — avoids IPv6 ::1 ambiguity on Windows
    open: true,           // auto-open browser on start
    proxy: {
      '/api': {
        // Use 127.0.0.1 instead of localhost — avoids the IPv6 DNS fallback delay
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
      // Also proxy the short-link redirect handler (/:shortCode)
      // Match any path that is not an API call, not static assets, and not frontend routes
      '^/(?!(api|login|register|dashboard|create|analytics|stats|profile|assets|favicon.ico|@react-refresh|@vite|@fs|src|node_modules|index.html|$)).*$': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // Suppress chunk size warning — expected for a full-featured SPA
  build: {
    chunkSizeWarningLimit: 1000,
  },
});
