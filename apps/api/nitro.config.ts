import { defineConfig } from 'nitro';

// @keep-sorted
export default defineConfig({
  cloudflare: {
    deployConfig: true,
    nodeCompat: true,
    wrangler: {
      durable_objects: {
        bindings: [{ name: 'TODO_PUBLISHER', class_name: 'TodoPublisherObject' }],
      },
      migrations: [{ tag: 'v1', new_sqlite_classes: ['TodoPublisherObject'] }],
      name: 'taman-better-auth-back',
    },
  },

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
    trustedOrigins: '',
    googleClientId: '',
    googleClientSecret: '',
    betterAuthSecret: '',
    baseUrl: '',
  },

  serverDir: './server',
});
