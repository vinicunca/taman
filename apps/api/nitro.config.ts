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
      // Deployed worker name: renaming creates a new worker. Generated projects get `<name>-api` (template.manifest.ts).
      name: 'taman-better-auth-back',
      queues: {
        consumers: [{ queue: 'taman-email', max_retries: 5, dead_letter_queue: 'taman-email-dlq' }],
        producers: [{ binding: 'EMAIL_QUEUE', queue: 'taman-email' }],
      },
      send_email: [{ name: 'EMAIL' }],
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
    appUrl: '',
    emailFrom: '',
    emailFromName: '',
  },

  serverDir: './server',
});
