import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  envDir: '../../',
  plugins: [
    react(),
    federation({
      name: 'product_reviews',
      filename: 'remoteEntry.js',
      exposes: {
        './ProductReviewsApp': './src/App.tsx',
      },
      shared: ['react', 'react-dom', 'zustand', 'react-router-dom', '@mfe/shared-store'],
    }),
  ],
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
});
