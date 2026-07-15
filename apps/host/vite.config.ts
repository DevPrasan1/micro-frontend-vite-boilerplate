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
        { path: path.resolve(__dirname, '../video-browser/dist/assets'), watching: false },
        { path: path.resolve(__dirname, '../player/dist/assets'), watching: false },
        { path: path.resolve(__dirname, '../community/dist/assets'), watching: false }
      ];

      const startWatching = () => {
        dirs.forEach((dirObj) => {
          if (!dirObj.watching && fs.existsSync(dirObj.path)) {
            try {
              fs.watch(dirObj.path, (eventType, filename) => {
                if (filename === 'remoteEntry.js') {
                  server.ws.send({
                    type: 'full-reload',
                    path: '*'
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
    }
  };
}

export default defineConfig({
  envDir: '../../',
  plugins: [
    react(),
    federation({
      name: 'host',
      remotes: {
        video_browser: 'http://localhost:5001/assets/remoteEntry.js',
        player: 'http://localhost:5002/assets/remoteEntry.js',
        community: 'http://localhost:5003/assets/remoteEntry.js',
      },
      shared: ['react', 'react-dom', 'zustand', 'react-router-dom', '@streamhub/shared-store'],
    }),
    watchRemoteEntries()
  ],
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
});
