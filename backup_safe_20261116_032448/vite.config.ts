import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [
        VitePWA({
          workbox: {
            maximumFileSizeToCacheInBytes: 5 * 1024 * 1024 // 5 MB
          },
          registerType: 'autoUpdate',
          includeAssets: ['yr-logo.png', 'icon-512.png'],
          manifest: {
            name: 'يمن ريتنج',
            short_name: 'يمن ريتنج',
            description: 'منصة يمن ريتنج',
            theme_color: '#000000',
            background_color: '#000000',
            display: 'standalone',
            icons: [
              {
                src: 'icon-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable'
              }
            ]
          }
        }),react()],
  server: {
    port: 5174,
    strictPort: false,
    proxy: {
      "/supabase-api": {
        target: "https://rnmuncxkfyoknmqejghl.supabase.co",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/supabase-api/, ""),
        secure: false,
        ws: true,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.removeHeader("cookie");
          });
        },
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        banks: fileURLToPath(new URL("./banks.html", import.meta.url)),
        bank: fileURLToPath(new URL("./bank.html", import.meta.url)),
      },
    },
  },
});
