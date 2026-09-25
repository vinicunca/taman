import type { TodoEvent } from '@vinicunca/taman-request/orpc';
import { LIVE_RETRY } from '@vinicunca/taman-request/orpc';
import { onScopeDispose, ref } from 'vue';
import { client } from '#/api/orpc';

export interface TodoLogEntry {
  at: Date;
  event: TodoEvent;
}

const MAX_ENTRIES = 50;

/**
 * Consumes `todo.live` with the plain client: a `for await` over the event
 * iterator. `LIVE_RETRY` reconnects after drops and resumes via lastEventId;
 * aborting on scope dispose closes the stream when the page unmounts.
 */
export function useTodoLive(onEvent?: (event: TodoEvent) => void) {
  const entries = ref<Array<TodoLogEntry>>([]);
  const status = ref<'closed' | 'connecting' | 'error' | 'open'>('connecting');
  const controller = new AbortController();

  async function run() {
    try {
      const stream = await client.todo.live(undefined, { signal: controller.signal, context: LIVE_RETRY });
      status.value = 'open';

      for await (const event of stream) {
        entries.value = [{ at: new Date(), event }, ...entries.value].slice(0, MAX_ENTRIES);
        onEvent?.(event);
      }

      // The iterator ended without throwing (server closed the stream
      // cleanly) — `LIVE_RETRY` only reconnects on error, so reflect that
      // there is no live connection anymore instead of staying 'open'.
      if (!controller.signal.aborted) {
        status.value = 'closed';
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        status.value = 'error';
        console.error('[todo.live]', error);
      }
    }
  }

  void run();
  onScopeDispose(() => controller.abort());

  return { entries, status };
}
