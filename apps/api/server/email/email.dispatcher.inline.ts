import type { EmailJob } from '@taman/emails';
import type { DeliverEmail, EmailDispatcher } from './email.types.ts';

export function createInlineEmailDispatcher(deliver: DeliverEmail, onError: (job: EmailJob, error: unknown) => void = () => {}): EmailDispatcher {
  return {
    async dispatch(job) {
      try {
        await deliver(job);
      } catch (error) {
        onError(job, error);
      }
    },
  };
}
