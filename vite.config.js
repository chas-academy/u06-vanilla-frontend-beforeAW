import { defineConfig } from "vite";
import { resolve } from 'path';
import { glob } from 'glob';

// Find HTML files relative to the public directory
const htmlFiles = glob.sync('**/*.html', { 
  cwd: resolve(__dirname, 'public') 
});

// Create input object with proper paths
const input = Object.fromEntries(
  htmlFiles.map(file => [
    // Name entry points after file path without the extension
    file.replace(/\.html$/, ''),
    // Resolve full path
    resolve(__dirname, 'public', file)
  ])
);

export default defineConfig({
  root: 'public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: Object.keys(input).length ? input : resolve(__dirname, 'public/index.html')
    }
  },
  resolve: {
    alias: {
      '/src': resolve(__dirname, 'src')
    }
  },
});