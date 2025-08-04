// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  base: '/beterano-map/',
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'src/data/*.json',
          dest: 'data'
        }
      ]
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      input: 'index.html'
    }
  }
});
