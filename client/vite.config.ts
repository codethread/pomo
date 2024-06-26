/// <reference types="vitest" />
import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react-swc';
import circleDependency from 'vite-plugin-circular-dependency';

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    globals: true,
    setupFiles: [path.resolve(__dirname, './src/testHelpers/test.setup.ts')],
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, './src/utils'),
      '@client': path.resolve(__dirname, './src'),
      '@test': path.resolve(__dirname, './src/testHelpers'),
    },
  },
  plugins: [react(), circleDependency()],
  clearScreen: false,
  server: {
    strictPort: true,
  },
  // to access the Tauri environment variables set by the CLI with information about the current target
  envPrefix: [
    'VITE_',
    'TAURI_PLATFORM',
    'TAURI_ARCH',
    'TAURI_FAMILY',
    'TAURI_PLATFORM_VERSION',
    'TAURI_PLATFORM_TYPE',
    'TAURI_DEBUG',
  ],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    // Tauri uses Chromium on Windows and WebKit on macOS and Linux
    target: process.env.TAURI_PLATFORM == 'windows' ? 'chrome105' : 'safari13',
    // don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,
  },
});
