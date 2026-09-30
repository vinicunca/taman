import type { EmailQueueBatch } from './email.queue-consumer.ts';
import type { OutgoingEmail, SendEmailBinding } from './email.types.ts';
// @vitest-environment node
import type { EmailJob } from '@taman/emails';
import { consola } from 'consola';
import { describe, expect, it, vi } from 'vitest';
import { EmailJobError } from '@taman/emails';
import { createEmailDeliverer, isEmailAddress } from './email.deliver.ts';
import { createInlineEmailDispatcher } from './email.dispatcher.inline.ts';
import { createQueueEmailDispatcher } from './email.dispatcher.queue.ts';
import { logDeliveryError, maskEmail } from './email.log.ts';
import { consumeEmailBatch } from './email.queue-consumer.ts';
import { createCloudflareEmailSender } from './email.sender.cloudflare.ts';
import { createConsoleEmailSender } from './email.sender.console.ts';
import { createEmailServices } from './index.ts';

const job: EmailJob = {
  template: 'verify-email',
  to: 'ana@user.test',
  locale: 'en-US',
  params: { name: 'Ana', verifyUrl: 'https://api.test/api/auth/verify-email?token=t1' },
};

const from = { email: 'no-reply@taman.test', name: 'Taman' };

type SentMessage = Parameters<SendEmailBinding['send']>[0];

function fakeBinding() {
  const sent: Array<SentMessage> = [];
  const binding: SendEmailBinding = {
    send: vi.fn(async (message: SentMessage) => {
      sent.push(message);
      return { messageId: 'm1' };
    }),
  };

  return { binding, sent };
}

function fakeMessage(body: unknown) {
  return { body, ack: vi.fn(), retry: vi.fn() };
}

describe('maskEmail', () => {
  it.each([
    ['john.doe@example.com', 'j***@example.com'],
    ['a@b.test', 'a***@b.test'],
    ['no-at-sign', '***'],
    ['@example.com', '***'],
    ['example.com@', '***'],
    ['odd@name@example.com', 'o***@example.com'],
  ])('%s → %s', (address, expected) => {
    expect(maskEmail(address)).toBe(expected);
  });
});

describe('logDeliveryError', () => {
  it('logs the template and a masked recipient', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const failure = new Error('boom');

    logDeliveryError('verify-email', 'ana@user.test', failure);

    expect(error).toHaveBeenCalledWith('[EMAIL] delivery failed template=verify-email to=a***@user.test', failure);
    expect(String(error.mock.calls[0]?.[0])).not.toContain('ana@user.test');
    error.mockRestore();
  });
});

describe('isEmailAddress', () => {
  it.each(['a@b.test', 'john.doe+tag@mail.example.com'])('accepts %s', (address) => {
    expect(isEmailAddress(address)).toBe(true);
  });

  it.each([
    'not-an-email',
    'a@b',
    '@b.test',
    'a@.test',
    'a@b.',
    'a@b..test',
    'a@@b.test',
    'a@b@c.test',
    'a b@c.test',
    'a@b.test\n',
    '',
  ])('rejects %j', (address) => {
    expect(isEmailAddress(address)).toBe(false);
  });

  it('handles pathological input in linear time', () => {
    expect(isEmailAddress(`a@${'.'.repeat(100_000)}`)).toBe(false);
    expect(isEmailAddress(`${'a'.repeat(100_000)}@${'b.'.repeat(100_000)} `)).toBe(false);
    expect(isEmailAddress(`${'a'.repeat(100_000)}@${'b.'.repeat(100_000)}c`)).toBe(true);
  });

  it('rejects non-strings', () => {
    expect(isEmailAddress(undefined)).toBe(false);
    expect(isEmailAddress(42)).toBe(false);
  });
});

describe('createCloudflareEmailSender', () => {
  it('sends a named sender as an address object', async () => {
    const { binding, sent } = fakeBinding();
    await createCloudflareEmailSender(binding).send({ to: 'a@b.test', from, subject: 'S', html: '<p>H</p>', text: 'T' });

    expect(sent).toEqual([{
      to: 'a@b.test',
      from: { email: 'no-reply@taman.test', name: 'Taman' },
      subject: 'S',
      html: '<p>H</p>',
      text: 'T',
    }]);
  });

  it('sends a bare address when there is no display name', async () => {
    const { binding, sent } = fakeBinding();
    await createCloudflareEmailSender(binding).send({ to: 'a@b.test', from: { email: 'no-reply@taman.test' }, subject: 'S', html: 'H', text: 'T' });

    expect(sent[0]?.from).toBe('no-reply@taman.test');
  });
});

describe('createConsoleEmailSender', () => {
  it('prints recipient, subject and the plaintext body', async () => {
    const lines: Array<string> = [];
    await createConsoleEmailSender((...parts) => {
      lines.push(parts.join(' '));
    }).send({ to: 'a@b.test', from, subject: 'Hello', html: '<p>x</p>', text: 'Open https://x.test' });

    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain('to=a@b.test');
    expect(lines[0]).toContain('subject: Hello');
    expect(lines[0]).toContain('Open https://x.test');
  });
});

describe('createEmailDeliverer', () => {
  it('renders the job and sends it from the configured address', async () => {
    const outbox: Array<OutgoingEmail> = [];
    const deliver = createEmailDeliverer({
      sender: {
        send: async (email) => {
          outbox.push(email);
        },
      },
      from,
    });

    await deliver(job);

    expect(outbox).toHaveLength(1);
    expect(outbox[0]).toMatchObject({ to: 'ana@user.test', from, subject: 'Verify your Taman email address' });
    expect(outbox[0]?.html).toContain('href="https://api.test/api/auth/verify-email?token=t1"');
  });

  it('refuses to send without a from address, as a retryable error', async () => {
    const send = vi.fn();
    const promise = createEmailDeliverer({ sender: { send }, from: { email: '' } })(job);

    await expect(promise).rejects.toThrow(/NITRO_EMAIL_FROM/);
    await expect(promise).rejects.not.toBeInstanceOf(EmailJobError);
    expect(send).not.toHaveBeenCalled();
  });

  it('rejects a job without a valid recipient as EmailJobError', async () => {
    const deliver = createEmailDeliverer({ sender: { send: vi.fn() }, from });

    await expect(deliver({ ...job, to: 'not-an-email' })).rejects.toBeInstanceOf(EmailJobError);
    await expect(deliver(null as unknown as EmailJob)).rejects.toBeInstanceOf(EmailJobError);
  });
});

describe('createInlineEmailDispatcher', () => {
  it('delivers during the call', async () => {
    const deliver = vi.fn(async () => {});
    await createInlineEmailDispatcher(deliver).dispatch(job);

    expect(deliver).toHaveBeenCalledWith(job);
  });

  it('reports delivery errors instead of throwing', async () => {
    const failure = new Error('provider down');
    const onError = vi.fn();
    const dispatcher = createInlineEmailDispatcher(async () => {
      throw failure;
    }, onError);

    await expect(dispatcher.dispatch(job)).resolves.toBeUndefined();
    expect(onError).toHaveBeenCalledWith(job, failure);
  });
});

describe('createQueueEmailDispatcher', () => {
  it('enqueues the job unrendered', async () => {
    const send = vi.fn(async () => {});
    await createQueueEmailDispatcher({ send }).dispatch(job);

    expect(send).toHaveBeenCalledWith(job);
  });

  it('lets enqueue failures propagate', async () => {
    const dispatcher = createQueueEmailDispatcher({
      send: async () => {
        throw new Error('queue down');
      },
    });

    await expect(dispatcher.dispatch(job)).rejects.toThrow('queue down');
  });
});

describe('consumeEmailBatch', () => {
  it('acks delivered messages, retries transient failures and acks jobs that can never succeed', async () => {
    const ok = fakeMessage(job);
    const transient = fakeMessage({ ...job, to: 'flaky@user.test' });
    const broken = fakeMessage({ ...job, template: 'welcome' });
    const deliver = vi.fn(async (body: EmailJob) => {
      if (body.to === 'flaky@user.test') {
        throw new Error('rate limited');
      }

      if ((body.template as string) === 'welcome') {
        throw new EmailJobError('Unknown email template "welcome"');
      }
    });
    const onError = vi.fn();
    const batch: EmailQueueBatch = { queue: 'taman-email', messages: [ok, transient, broken] };

    await consumeEmailBatch(batch, deliver, onError);

    expect(ok.ack).toHaveBeenCalledOnce();
    expect(ok.retry).not.toHaveBeenCalled();
    expect(transient.retry).toHaveBeenCalledOnce();
    expect(transient.ack).not.toHaveBeenCalled();
    expect(broken.ack).toHaveBeenCalledOnce();
    expect(broken.retry).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledTimes(2);
  });

  it('acks a malformed body with the real deliverer instead of retrying it forever', async () => {
    const message = fakeMessage(null);
    const deliver = createEmailDeliverer({ sender: { send: vi.fn() }, from });

    await consumeEmailBatch({ queue: 'taman-email', messages: [message] }, deliver, vi.fn());

    expect(message.ack).toHaveBeenCalledOnce();
    expect(message.retry).not.toHaveBeenCalled();
  });

  it('acks a job from an older deploy with an invalid date instead of retrying it', async () => {
    const message = fakeMessage({
      template: 'invitation',
      to: 'new@user.test',
      locale: 'en-US',
      params: {
        inviterName: 'Ana',
        inviterEmail: 'ana@org.test',
        organizationName: 'Acme',
        role: 'admin',
        inviteUrl: 'https://app.test/auth/accept-invitation/inv_1',
        expiresAt: 'not a date',
      },
    });
    const deliver = createEmailDeliverer({ sender: { send: vi.fn() }, from });

    await consumeEmailBatch({ queue: 'taman-email', messages: [message] }, deliver, vi.fn());

    expect(message.ack).toHaveBeenCalledOnce();
    expect(message.retry).not.toHaveBeenCalled();
  });

  it('retries every message while NITRO_EMAIL_FROM is missing', async () => {
    const message = fakeMessage(job);
    const deliver = createEmailDeliverer({ sender: { send: vi.fn() }, from: { email: '' } });

    await consumeEmailBatch({ queue: 'taman-email', messages: [message] }, deliver, vi.fn());

    expect(message.retry).toHaveBeenCalledOnce();
    expect(message.ack).not.toHaveBeenCalled();
  });
});

describe('createEmailServices', () => {
  const config = { emailFrom: 'no-reply@taman.test', emailFromName: 'Taman' };

  it('queues jobs and sends through Cloudflare when both bindings exist', async () => {
    const { binding, sent } = fakeBinding();
    const queue = { send: vi.fn(async () => {}) };
    const { dispatcher, deliver } = createEmailServices({ EMAIL: binding, EMAIL_QUEUE: queue }, config);

    await dispatcher.dispatch(job);

    expect(queue.send).toHaveBeenCalledWith(job);
    expect(sent).toHaveLength(0);

    await deliver(job);

    expect(sent[0]).toMatchObject({ to: 'ana@user.test', from: { email: 'no-reply@taman.test', name: 'Taman' } });
  });

  it('sends inline through Cloudflare when there is no queue', async () => {
    const { binding, sent } = fakeBinding();
    await createEmailServices({ EMAIL: binding }, config).dispatcher.dispatch(job);

    expect(sent).toHaveLength(1);
  });

  it('omits an empty display name', async () => {
    const { binding, sent } = fakeBinding();
    await createEmailServices({ EMAIL: binding }, { emailFrom: 'no-reply@taman.test', emailFromName: '' }).dispatcher.dispatch(job);

    expect(sent[0]?.from).toBe('no-reply@taman.test');
  });

  it('falls back to inline console delivery without bindings (nitro dev)', async () => {
    const log = vi.spyOn(consola, 'log').mockImplementation(() => {});

    await createEmailServices(undefined, config).dispatcher.dispatch(job);

    expect(log).toHaveBeenCalledOnce();
    expect(log.mock.calls[0]?.join(' ')).toContain('to=ana@user.test');
    log.mockRestore();
  });

  it('logs inline delivery failures with a masked recipient instead of throwing', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(createEmailServices(undefined, { emailFrom: '' }).dispatcher.dispatch(job)).resolves.toBeUndefined();

    expect(error).toHaveBeenCalledOnce();
    expect(String(error.mock.calls[0]?.[0])).toContain('to=a***@user.test');
    error.mockRestore();
  });
});
