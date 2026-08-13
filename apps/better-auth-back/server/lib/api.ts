import type { H3Event } from 'nitro';
import { defineHandler } from 'nitro';

/**
 * Success envelope for the `/api/*` namespace.
 *
 * Structurally identical to `ApiEnvelope` in `@taman/request` — the two are
 * the same contract seen from either end. Keep them in sync; if a third
 * consumer appears, promote this into a package both sides import.
 *
 * Errors deliberately do NOT use this shape: they keep director's richer
 * `{ error, status, message, detail }` body (see `errors/error.utils.ts`)
 * and are signalled by the HTTP status. The frontend client already reads
 * `message`/`status` off that body when a request rejects.
 */
export interface ApiEnvelope<T> {
  code: number;
  data: T;
  message: string;
}

/** `code` value meaning success; mirrors the client's `successCode` default. */
const SUCCESS_CODE = 0;

/**
 * Like `defineHandler`, but wraps the returned value in the success envelope.
 *
 * Applied per-route rather than as a global response hook on purpose: this
 * server also serves Better Auth (`/api/auth/**`, which returns its own
 * `Response` objects), payment webhooks read by an external provider, and
 * the health probes — all of which must keep their own shapes. An opt-in
 * wrapper can't silently corrupt those.
 */
export function defineApiHandler<T>(
  handler: (event: H3Event) => Promise<T> | T,
) {
  return defineHandler(async (event): Promise<ApiEnvelope<T>> => {
    const data = await handler(event);

    return {
      code: SUCCESS_CODE,
      data,
      message: 'OK',
    };
  });
}
