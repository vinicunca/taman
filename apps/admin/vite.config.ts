import { fileURLToPath } from 'node:url';

import { defineConfig } from '@taman/vite-config';

export default defineConfig(async () => {
  return {
    application: {},

    vite: {
      resolve: {
        alias: {
          '~~': fileURLToPath(new URL('./src', import.meta.url)),
        },
      },
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
            // The target address of the mock proxy
            target: 'http://localhost:5320/api',
            ws: true,
          },
        },
      },
    },
  };
});
