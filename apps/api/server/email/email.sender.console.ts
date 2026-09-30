import type { EmailSender, OutgoingEmail } from './email.types.ts';
import { consola } from 'consola';

export function createConsoleEmailSender(log: (...args: Array<unknown>) => void = consola.log): EmailSender {
  return {
    async send(email: OutgoingEmail) {
      log('[EMAIL]', `to=${email.to}`, `subject: ${email.subject}`, `\n${email.text}`);
    },
  };
}
