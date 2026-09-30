import { defineHandler } from 'nitro';
import { handleCors } from 'nitro/h3';
import { createCorsOptions } from '#lib/cors';

/**
 * Global CORS middleware. `handleCors` answers preflight (`OPTIONS`) requests
 * directly and appends CORS headers to the event, which covers every response
 * nitro derives from it — including 2xx raw `Response`s, whose headers Nitro
 * merges with these. Origin must therefore be the trusted list, not `*`.
 *
 * Non-2xx raw Responses skip that merge and need `applyCorsToResponse` —
 * the auth passthrough (`routes/api/auth/[...all].ts`) and every error
 * handler (via `jsonError`) do.
 */
export default defineHandler((event) => {
  const cors = handleCors(
    event,
    createCorsOptions(),
  );

  if (cors !== false) {
    return cors;
  }

  return undefined;
});
