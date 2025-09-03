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
      targets: [{ src: 'src/data/*.json', dest: 'data' }]
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@sass': path.resolve(__dirname, './src/sass')
    },
    dedupe: ['react', 'react-dom']
  },
  server: {
    host: true,                 // 127.0.0.1 y LAN
    port: 5173,
    strictPort: true,
    open: '/beterano-map/'      // abre la ruta correcta
  },
  preview: {
    port: 5174,
    strictPort: true,
    open: '/beterano-map/'
  },
  build: {
    rollupOptions: { input: path.resolve(__dirname, 'index.html') }
  }
});
