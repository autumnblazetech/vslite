import {defineConfig} from 'vite';
import reactSWC from '@vitejs/plugin-react-swc';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: globalThis.process?.env.VITE_BASE || '/',
  plugins: [
    globalThis.process?.versions?.webcontainer
      ? react()
      : reactSWC(),
  ],
  build: {
    chunkSizeWarningLimit: 3500,
  },
  server: {
    port: 3000,
    host: globalThis.process?.env.VITE_HOST || 'localhost',
    strictPort: true,
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
});
