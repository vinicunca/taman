import type { H3Event } from 'nitro';
import { useRuntimeConfig } from 'nitro/runtime-config';

/**
 * Frontend origins allowed to call this API. Read from the comma-separated
 * `TRUSTED_ORIGINS` env var, with a localhost fallback for local dev.
 */
export function resolveTrustedOrigins(): Array<string> {
  const trustedOrigins: string = useRuntimeConfig().trustedOrigins;

  const configured = (trustedOrigins ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configured.length > 0) {
    return configured;
  }

  return [];
}

/**
 * Shared `handleCors` options. `origin` must be the allow-list, never `*`:
 * `credentials: true` plus a wildcard is rejected by browsers, and Nitro
 * merges these event headers onto 2xx Responses (overwriting a more
 * specific ACAO from `applyCorsToResponse`).
 */
export function createCorsOptions(
  origins: Array<string> = resolveTrustedOrigins(),
) {
  return {
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
    origin: origins,
    preflight: { statusCode: 204 },
  };
}

/** The request's `Origin` if it is in the allow-list, otherwise `null`. */
function resolveAllowedOrigin(event: H3Event): null | string {
  const origin = event.req.headers.get('origin');
  if (!origin) {
    return null;
  }
  const allowed = resolveTrustedOrigins();
  return allowed.includes(origin) ? origin : null;
}

/**
 * Copy CORS headers onto a raw `Response`. Required for Better Auth, which
 * returns its own `Response` (including non-2xx like 401) that bypasses the
 * event-level headers set by the CORS middleware.
 */
export function applyCorsToResponse(event: H3Event, response: Response): Response {
  const origin = resolveAllowedOrigin(event);
  if (!origin) {
    return response;
  }

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
