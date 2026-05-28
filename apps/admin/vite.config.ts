import { defineConfig } from '@taman/vite-config';

export default defineConfig(async () => {
  return {
    application: {},

    vite: {
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
