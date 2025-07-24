import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/beterano-map/',
  plugins: [react()],
    css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "./src/sass/index.scss";`
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
