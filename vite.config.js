import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  // GitHub Pages sirve la app en /beterano-map/
  base: '/beterano-map/',

  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: 'src/data/*.json', dest: 'data' } // copia los JSON al build
      ]
    })
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@sass': path.resolve(__dirname, './src/sass')
    },
    // 🔒 fuerza una sola instancia de React en el bundle
    dedupe: ['react', 'react-dom']
  },

  build: {
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html')
    }
  }
});
