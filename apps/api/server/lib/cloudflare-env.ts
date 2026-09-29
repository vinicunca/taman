import type { H3Event } from 'nitro';

export function cloudflareEnv<T>(event: H3Event): T | undefined {
  const request = event.req as unknown as { runtime?: { cloudflare?: { env?: T } } } | undefined;
  return request?.runtime?.cloudflare?.env;
}
