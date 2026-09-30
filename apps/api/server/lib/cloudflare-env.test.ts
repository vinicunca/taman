// @vitest-environment node
import type { H3Event } from 'nitro';
import { describe, expect, it } from 'vitest';
import { cloudflareEnv } from './cloudflare-env.ts';

describe('cloudflareEnv', () => {
  it('reads the Worker env Nitro attaches to the request', () => {
    const env = { TODO_PUBLISHER: {} };
    const event = { req: { runtime: { cloudflare: { env } } } } as unknown as H3Event;

    expect(cloudflareEnv(event)).toBe(env);
  });

  it('is undefined under nitro dev / Node', () => {
    expect(cloudflareEnv({ req: {} } as unknown as H3Event)).toBeUndefined();
  });
});
