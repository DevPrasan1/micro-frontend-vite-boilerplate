import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  envDir: '../../',
  plugins: [
    react(),
    federation({
      name: 'product_catalog',
      filename: 'remoteEntry.js',
      exposes: {
        './ProductCatalogApp': './src/App.tsx',
        './CategorySelector': './src/CategorySelector.tsx',
        './RelatedProducts': './src/components/RelatedProducts.tsx',
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
