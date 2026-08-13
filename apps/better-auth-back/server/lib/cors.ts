import type { H3Event } from 'nitro';

/**
 * Copy CORS headers onto a raw `Response`. Required for Better Auth, which
 * returns its own `Response` (including non-2xx like 401) that bypasses the
 * event-level headers set by the CORS middleware.
 */
export function applyCorsToResponse(event: H3Event, response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set('access-control-allow-origin', origin);
  headers.set('access-control-allow-credentials', 'true');
  headers.set('vary', 'Origin');

  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}
