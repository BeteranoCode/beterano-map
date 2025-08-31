import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  base: '/beterano-map/',
  plugins: [
    react(),
    viteStaticCopy({
      targets: [{ src: 'src/data/*.json', dest: 'data' }]
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@sass': path.resolve(__dirname, './src/sass')
    },
    dedupe: ['react', 'react-dom']   // ✅ clave para evitar “invalid hook call”
  },
  build: {
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html')
    }
  }
});
