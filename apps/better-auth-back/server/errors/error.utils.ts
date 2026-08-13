import type { H3Event } from 'nitro';
import { applyCorsToResponse } from '#lib/cors';

export interface ErrorBody {
  error: true;
  status: number;
  message: string;
  hint?: string;
  detail?: unknown;
}

/**
 * Serializes a clean JSON error response. Shared by every error handler so the
 * shape stays consistent across the chain.
 *
 * Takes the event so CORS headers can be re-applied. This builds a brand-new
 * `Response`, which *replaces* the one nitro would have derived from the event
 * — discarding the headers `handleCors` appended there in middleware. Without
 * re-applying them a browser receives an error carrying no
 * `access-control-allow-origin`, blocks it, and reports a CORS failure instead
 * of the real status, hiding the body entirely. REST clients (Bruno, curl) have
 * no same-origin policy, so they show the body fine — which makes this a
 * confusing bug to chase: the API looks correct everywhere except the app.
 */
export function jsonError(
  event: H3Event,
  status: number,
  body: ErrorBody,
): Response {
  return applyCorsToResponse(
    event,
    new Response(JSON.stringify(body, null, 2), {
      status,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    }),
  );
}
