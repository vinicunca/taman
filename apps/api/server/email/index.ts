import type { DeliverEmail, EmailDispatcher, EmailEnv, EmailServiceConfig } from './email.types.ts';
import { useRuntimeConfig } from 'nitro/runtime-config';
import { createEmailDeliverer } from './email.deliver.ts';
import { createInlineEmailDispatcher } from './email.dispatcher.inline.ts';
import { createQueueEmailDispatcher } from './email.dispatcher.queue.ts';
import { logDeliveryError } from './email.log.ts';
import { createCloudflareEmailSender } from './email.sender.cloudflare.ts';
import { createConsoleEmailSender } from './email.sender.console.ts';

export function createEmailServices(env: EmailEnv = {}, config: EmailServiceConfig) {
  const sender = env.EMAIL ? createCloudflareEmailSender(env.EMAIL) : createConsoleEmailSender();
  const deliver = createEmailDeliverer({
    sender,
    from: { email: config.emailFrom, ...(config.emailFromName ? { name: config.emailFromName } : {}) },
  });
  const dispatcher: EmailDispatcher = env.EMAIL_QUEUE
    ? createQueueEmailDispatcher(env.EMAIL_QUEUE)
    : createInlineEmailDispatcher(deliver, (job, error) => logDeliveryError(job.template, job.to, error));

  return { deliver, dispatcher };
}

let emailServices: ReturnType<typeof createEmailServices> | undefined;

export function useEmail(env?: EmailEnv) {
  if (!emailServices) {
    // Nitro injects runtime config through the request middleware before auth callbacks run.
    const config = useRuntimeConfig();
    emailServices = createEmailServices(env, {
      emailFrom: config.emailFrom,
      emailFromName: config.emailFromName,
    });
  }
  return emailServices;
}

export type { DeliverEmail };
