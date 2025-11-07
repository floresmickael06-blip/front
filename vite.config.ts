import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' 
    ? (process.env.VITE_BASE_PATH || '/app-bateau-client/') 
    : '/',
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'build',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': [
            'react',
            'react-dom',
            'axios',
          ],
          'ui-components': [
            './src/components/ui/card',
            './src/components/ui/button',
            './src/components/ui/dialog',
            './src/components/ui/input',
            './src/components/ui/label',
            './src/components/ui/form',
            './src/components/ui/select',
            './src/components/ui/accordion',
          ],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    // ✅ Sans proxy - utilise directement l'API Railway via VITE_API_URL
  },
});
