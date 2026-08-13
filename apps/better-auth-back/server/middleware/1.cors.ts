import { defineHandler } from 'nitro';
import { handleCors } from 'nitro/h3';

/**
 * Global CORS middleware. `handleCors` answers preflight (`OPTIONS`) requests
 * directly and appends CORS headers to the event, which covers every response
 * nitro derives from it.
 *
 * It does NOT cover handlers that return a raw `Response`, since that replaces
 * the event-derived one and carries only its own headers. Those must re-apply
 * the headers themselves via `applyCorsToResponse` — the auth passthrough
 * (`routes/api/auth/[...all].ts`) and every error handler (via `jsonError`) do.
 */
export default defineHandler((event) => {
  const cors = handleCors(
    event,
    {
      allowHeaders: [
        'Content-Type',
        'Authorization',
      ],
      credentials: true,
      maxAge: '86400',
      methods: [
        'GET',
        'HEAD',
        'POST',
        'PUT',
        'PATCH',
        'DELETE',
        'OPTIONS',
      ],
      preflight: { statusCode: 204 },
    },
  );

  if (cors !== false) {
    return cors;
  }

  return undefined;
});
