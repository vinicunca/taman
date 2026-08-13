import { defineConfig } from 'nitro';

// @keep-sorted
export default defineConfig({
  devServer: {
    port: 8788,
  },

  errorHandler: [
    '#errors/error.validation',
    '#errors/error.db',
    '#errors/error.handler',
  ],

  runtimeConfig: {
    databaseUrl: '',
  },

  serverDir: './server',
});
