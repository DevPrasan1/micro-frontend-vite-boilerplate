import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import path from 'path';
import fs from 'fs';

function watchRemoteEntries() {
  return {
    name: 'watch-remote-entries',
    configureServer(server: any) {
      const dirs = [
        { path: path.resolve(__dirname, '../product-catalog/dist/assets'), watching: false },
        { path: path.resolve(__dirname, '../product-details/dist/assets'), watching: false },
        { path: path.resolve(__dirname, '../product-reviews/dist/assets'), watching: false },
      ];

      const startWatching = () => {
        dirs.forEach((dirObj) => {
          if (!dirObj.watching && fs.existsSync(dirObj.path)) {
            try {
              fs.watch(dirObj.path, (eventType, filename) => {
                if (filename === 'remoteEntry.js') {
                  server.ws.send({
                    type: 'full-reload',
                    path: '*',
                  });
                }
              });
              dirObj.watching = true;
            } catch (e) {
              // Fail silently if folder is locked/deleted momentarily during build
            }
          }
        });
      };

      startWatching();
      // Periodically check if directories became available
      setInterval(startWatching, 2000);
    },
  };
}

export default defineConfig(({ mode }) => {
  // Remote URLs: set VITE_REMOTE_* env vars in Netlify dashboard for production
  const catalogUrl = process.env.VITE_REMOTE_CATALOG || 'http://localhost:5001/assets/remoteEntry.js';
  const detailsUrl = process.env.VITE_REMOTE_DETAILS || 'http://localhost:5002/assets/remoteEntry.js';
  const reviewsUrl = process.env.VITE_REMOTE_REVIEWS || 'http://localhost:5003/assets/remoteEntry.js';

  return {
    envDir: '../../',
    plugins: [
      react(),
      federation({
        name: 'host',
        remotes: {
          product_catalog: catalogUrl,
          product_details: detailsUrl,
          product_reviews: reviewsUrl,
        },
        shared: ['react', 'react-dom', 'zustand', 'react-router-dom', '@mfe/shared-store'],
      }),
      watchRemoteEntries(),
    ],
    build: {
      modulePreload: false,
      target: 'esnext',
      minify: false,
      cssCodeSplit: false,
    },
  };
});
