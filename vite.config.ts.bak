import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        banks: fileURLToPath(new URL('./banks.html', import.meta.url)),
        bank: fileURLToPath(new URL('./bank.html', import.meta.url)),
      },
    },
  },
});
