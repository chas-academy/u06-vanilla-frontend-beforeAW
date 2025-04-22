
import { defineConfig } from "vite";
import { resolve } from 'path';

export default defineConfig({
  root: 'public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '/src': resolve(__dirname, 'src')
    }
  },
});