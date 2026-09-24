import type { Publisher } from '@orpc/experimental-publisher';
import type { TodoEvent } from '@vinicunca/taman-api-contract';
import { MemoryPublisher } from '@orpc/experimental-publisher/memory';

export type TodoPublisher = Publisher<Record<string, TodoEvent>>;

/** One channel per organization, so a subscriber only ever sees its own org. */
export function todoChannel(organizationId: string): string {
  return `todo:${organizationId}`;
}

let publisherPromise: Promise<TodoPublisher> | undefined;

/**
 * The only place that decides how realtime events fan out. Handlers never
 * know which implementation they got.
 *
 * `MemoryPublisher` only fans out inside one process — correct for
 * `nitro dev` and a single Node instance, wrong across Worker isolates.
 */
export function getTodoPublisher(): Promise<TodoPublisher> {
  publisherPromise ??= Promise.resolve(
    new MemoryPublisher<Record<string, TodoEvent>>({
      resumeRetentionSeconds: 300,
    }),
  );

  return publisherPromise;
}
