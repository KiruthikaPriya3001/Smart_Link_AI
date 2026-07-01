// vite.config.js
import { defineConfig } from "file:///C:/Users/KIRUTHIKA%20PRIYA%20S%20K/Downloads/Smart%20Link%20AI%20%E2%80%93%20Intelligent%20URL%20Shortener%20&%20Analytics%20Platform/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/KIRUTHIKA%20PRIYA%20S%20K/Downloads/Smart%20Link%20AI%20%E2%80%93%20Intelligent%20URL%20Shortener%20&%20Analytics%20Platform/frontend/node_modules/@vitejs/plugin-react/dist/index.js";
import tailwindcss from "file:///C:/Users/KIRUTHIKA%20PRIYA%20S%20K/Downloads/Smart%20Link%20AI%20%E2%80%93%20Intelligent%20URL%20Shortener%20&%20Analytics%20Platform/frontend/node_modules/@tailwindcss/vite/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 5173,
    host: "127.0.0.1",
    // bind to IPv4 explicitly — avoids IPv6 ::1 ambiguity on Windows
    open: true,
    // auto-open browser on start
    proxy: {
      "/api": {
        // Use 127.0.0.1 instead of localhost — avoids the IPv6 DNS fallback delay
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      },
      // Also proxy the short-link redirect handler (/:shortCode)
      // Match any path that is not an API call, not static assets, and not frontend routes
      "^/(?!(api|login|register|dashboard|create|analytics|stats|profile|assets|favicon.ico|@react-refresh|@vite|@fs|src|node_modules|index.html|$)).*$": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
        secure: false
      }
    }
  },
  // Suppress chunk size warning — expected for a full-featured SPA
  build: {
    chunkSizeWarningLimit: 1e3
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxLSVJVVEhJS0EgUFJJWUEgUyBLXFxcXERvd25sb2Fkc1xcXFxTbWFydCBMaW5rIEFJIFx1MjAxMyBJbnRlbGxpZ2VudCBVUkwgU2hvcnRlbmVyICYgQW5hbHl0aWNzIFBsYXRmb3JtXFxcXGZyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxLSVJVVEhJS0EgUFJJWUEgUyBLXFxcXERvd25sb2Fkc1xcXFxTbWFydCBMaW5rIEFJIFx1MjAxMyBJbnRlbGxpZ2VudCBVUkwgU2hvcnRlbmVyICYgQW5hbHl0aWNzIFBsYXRmb3JtXFxcXGZyb250ZW5kXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9LSVJVVEhJS0ElMjBQUklZQSUyMFMlMjBLL0Rvd25sb2Fkcy9TbWFydCUyMExpbmslMjBBSSUyMCVFMiU4MCU5MyUyMEludGVsbGlnZW50JTIwVVJMJTIwU2hvcnRlbmVyJTIwJiUyMEFuYWx5dGljcyUyMFBsYXRmb3JtL2Zyb250ZW5kL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gJ0B0YWlsd2luZGNzcy92aXRlJztcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIHRhaWx3aW5kY3NzKCksXG4gIF0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDUxNzMsXG4gICAgaG9zdDogJzEyNy4wLjAuMScsICAgLy8gYmluZCB0byBJUHY0IGV4cGxpY2l0bHkgXHUyMDE0IGF2b2lkcyBJUHY2IDo6MSBhbWJpZ3VpdHkgb24gV2luZG93c1xuICAgIG9wZW46IHRydWUsICAgICAgICAgICAvLyBhdXRvLW9wZW4gYnJvd3NlciBvbiBzdGFydFxuICAgIHByb3h5OiB7XG4gICAgICAnL2FwaSc6IHtcbiAgICAgICAgLy8gVXNlIDEyNy4wLjAuMSBpbnN0ZWFkIG9mIGxvY2FsaG9zdCBcdTIwMTQgYXZvaWRzIHRoZSBJUHY2IEROUyBmYWxsYmFjayBkZWxheVxuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vMTI3LjAuMC4xOjUwMDAnLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIHNlY3VyZTogZmFsc2UsXG4gICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLFxuICAgICAgfSxcbiAgICAgIC8vIEFsc28gcHJveHkgdGhlIHNob3J0LWxpbmsgcmVkaXJlY3QgaGFuZGxlciAoLzpzaG9ydENvZGUpXG4gICAgICAvLyBNYXRjaCBhbnkgcGF0aCB0aGF0IGlzIG5vdCBhbiBBUEkgY2FsbCwgbm90IHN0YXRpYyBhc3NldHMsIGFuZCBub3QgZnJvbnRlbmQgcm91dGVzXG4gICAgICAnXi8oPyEoYXBpfGxvZ2lufHJlZ2lzdGVyfGRhc2hib2FyZHxjcmVhdGV8YW5hbHl0aWNzfHN0YXRzfHByb2ZpbGV8YXNzZXRzfGZhdmljb24uaWNvfEByZWFjdC1yZWZyZXNofEB2aXRlfEBmc3xzcmN8bm9kZV9tb2R1bGVzfGluZGV4Lmh0bWx8JCkpLiokJzoge1xuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vMTI3LjAuMC4xOjUwMDAnLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIHNlY3VyZTogZmFsc2UsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIC8vIFN1cHByZXNzIGNodW5rIHNpemUgd2FybmluZyBcdTIwMTQgZXhwZWN0ZWQgZm9yIGEgZnVsbC1mZWF0dXJlZCBTUEFcbiAgYnVpbGQ6IHtcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDEwMDAsXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBd2lCLFNBQVMsb0JBQW9CO0FBQ3JrQixPQUFPLFdBQVc7QUFDbEIsT0FBTyxpQkFBaUI7QUFHeEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sWUFBWTtBQUFBLEVBQ2Q7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQTtBQUFBLElBQ04sTUFBTTtBQUFBO0FBQUEsSUFDTixPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUE7QUFBQSxRQUVOLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLFFBQVE7QUFBQSxRQUNSLFNBQVMsQ0FBQyxTQUFTO0FBQUEsTUFDckI7QUFBQTtBQUFBO0FBQUEsTUFHQSxvSkFBb0o7QUFBQSxRQUNsSixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxRQUFRO0FBQUEsTUFDVjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUVBLE9BQU87QUFBQSxJQUNMLHVCQUF1QjtBQUFBLEVBQ3pCO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
