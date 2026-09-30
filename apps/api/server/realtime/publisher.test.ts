// @vitest-environment node
import { MemoryPublisher } from '@orpc/experimental-publisher/memory';
import { describe, expect, it } from 'vitest';
import { getTodoPublisher } from './publisher.ts';

describe('getTodoPublisher', () => {
  it('uses the in-process MemoryPublisher when no Durable Object binding exists', async () => {
    expect(await getTodoPublisher(undefined)).toBeInstanceOf(MemoryPublisher);
    expect(await getTodoPublisher({})).toBe(await getTodoPublisher(undefined));
  });
});
