import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
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
