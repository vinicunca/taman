import type { EmailEnv } from '#email/email.types.ts';
import { useEmail } from '#email/index.ts';
import { cloudflareEnv } from '#lib/cloudflare-env.ts';
import { defineHandler } from 'nitro';

export default defineHandler((event) => {
  useEmail(cloudflareEnv<EmailEnv>(event));
  return undefined;
});
