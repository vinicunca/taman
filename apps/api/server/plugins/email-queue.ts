import type { EmailQueueBatch } from '#email/email.queue-consumer.ts';
import type { EmailEnv } from '#email/email.types.ts';
import { definePlugin } from 'nitro';
import { consumeEmailBatch, EMAIL_QUEUE_NAME } from '#email/email.queue-consumer.ts';
import { useEmail } from '#email/index.ts';

export default definePlugin((nitroApp) => {
  nitroApp.hooks.hook('cloudflare:queue', async ({ batch, env }) => {
    if (batch.queue !== EMAIL_QUEUE_NAME) {
      return;
    }
    await consumeEmailBatch(batch as unknown as EmailQueueBatch, useEmail(env as EmailEnv).deliver);
  });
});
