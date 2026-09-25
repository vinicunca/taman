import type { DurablePublisher } from '@orpc/experimental-publisher-durable-object';
import type { Publisher } from '@orpc/experimental-publisher';
import type { TodoEvent } from '@vinicunca/taman-api-contract';
import type { H3Event } from 'nitro';
import { MemoryPublisher } from '@orpc/experimental-publisher/memory';

export type TodoPublisher = Publisher<Record<string, TodoEvent>>;

type DurableObjectNamespaceLike = ConstructorParameters<typeof DurablePublisher>[0];

export interface TodoPublisherEnv {
  /** Durable Object namespace bound in the Worker (see nitro.config.ts). */
  TODO_PUBLISHER?: DurableObjectNamespaceLike;
}

/** One channel per organization, so a subscriber only ever sees its own org. */
export function todoChannel(organizationId: string): string {
  return `todo:${organizationId}`;
}

/** The Worker env Nitro's cloudflare preset attaches to each request. */
export function cloudflareEnv(event: H3Event): TodoPublisherEnv | undefined {
  const request = event.req as unknown as { runtime?: { cloudflare?: { env?: TodoPublisherEnv } } } | undefined;
  return request?.runtime?.cloudflare?.env;
}

let publisherPromise: Promise<TodoPublisher> | undefined;

/**
 * The only place that decides how realtime events fan out.
 *
 * - Cloudflare (binding present): `DurablePublisher` — one Durable Object per
 *   channel relays events between Worker isolates.
 * - `nitro dev` / Node: `MemoryPublisher`, which only fans out in-process.
 *
 * `@orpc/experimental-publisher-durable-object` imports `cloudflare:workers`, so it is loaded lazily and
 * never evaluated under Node.
 *
 * Every Workers request context passes `cloudflareEnv(event)` here, so the first call
 * on a given isolate always sees the binding and memoizes the right publisher for it.
 */
export function getTodoPublisher(env?: TodoPublisherEnv): Promise<TodoPublisher> {
  publisherPromise ??= createTodoPublisher(env);
  return publisherPromise;
}

async function createTodoPublisher(env?: TodoPublisherEnv): Promise<TodoPublisher> {
  if (env?.TODO_PUBLISHER) {
    const { DurablePublisher } = await import('@orpc/experimental-publisher-durable-object');
    return new DurablePublisher<Record<string, TodoEvent>>(env.TODO_PUBLISHER);
  }

  return new MemoryPublisher<Record<string, TodoEvent>>({
    resumeRetentionSeconds: 300,
  });
}
