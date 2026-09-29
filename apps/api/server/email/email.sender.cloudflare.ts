import type { EmailSender, SendEmailBinding } from './email.types.ts';

export function createCloudflareEmailSender(binding: SendEmailBinding): EmailSender {
  return {
    async send(email) {
      await binding.send({
        to: email.to,
        from: email.from,
        subject: email.subject,
        html: email.html,
        text: email.text,
      });
    },
  };
}
