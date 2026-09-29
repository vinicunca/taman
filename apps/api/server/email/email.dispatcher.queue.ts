import type { EmailDispatcher, EmailQueueBinding } from './email.types.ts';

export function createQueueEmailDispatcher(queue: EmailQueueBinding): EmailDispatcher {
  return { dispatch: (job) => queue.send(job) };
}
