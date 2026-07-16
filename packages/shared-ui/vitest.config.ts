import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.shims.d.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/storybook-static/**'],
  },
  resolve: {
    alias: {
      '@mfe/shared-types': path.resolve(dirname, '../../packages/shared-types/src/index.ts'),
      '@mfe/shared-utils': path.resolve(dirname, '../../packages/shared-utils/src/index.ts'),
    },
  },
});
