import type { EmailEnv } from '#email/email.types.ts';
import { defineHandler } from 'nitro';
import { useEmail } from '#email/index.ts';
import { cloudflareEnv } from '#lib/cloudflare-env.ts';

export default defineHandler((event) => {
  useEmail(cloudflareEnv<EmailEnv>(event));
  return undefined;
});
