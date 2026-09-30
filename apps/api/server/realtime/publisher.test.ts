// @vitest-environment node
import type { H3Event } from 'nitro';
import { MemoryPublisher } from '@orpc/experimental-publisher/memory';
import { describe, expect, it } from 'vitest';
import { cloudflareEnv, getTodoPublisher } from './publisher.ts';

describe('getTodoPublisher', () => {
  it('uses the in-process MemoryPublisher when no Durable Object binding exists', async () => {
    expect(await getTodoPublisher(undefined)).toBeInstanceOf(MemoryPublisher);
    expect(await getTodoPublisher({})).toBe(await getTodoPublisher(undefined));
  });
});

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
