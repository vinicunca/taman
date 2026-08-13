import { defineErrorHandler, HTTPError } from 'nitro';
import { jsonError } from './error.utils';

/**
 * General catch-all error handler. Last link in the `errorHandler` chain, so it
 * only sees errors that earlier, more specific handlers (e.g. `error-db.ts`)
 * chose not to handle. Always returns a Response, replacing nitro's default
 * error page (raw stack dump) with a clean JSON body.
 *
 * `import.meta.dev` is true under `nitro dev` and false in builds, so it gates
 * verbose, developer-only detail without leaking internals in production.
 */
export default defineErrorHandler((error, event) => {
  const unhandled = error.unhandled ?? !HTTPError.isError(error);

  // Known HTTP errors carry an intentional status/message — pass them through.
  if (!unhandled) {
    return jsonError(event, error.status ?? 500, {
      error: true,
      status: error.status ?? 500,
      message: error.message,
    });
  }

  // Log full detail server-side (CF Observability captures console.error,
  // including the Error's stack) — the response body still hides internals.
  console.error('[unhandled]', error.cause ?? error);

  // Genuinely unexpected error: hide internals in production.
  return jsonError(event, 500, {
    error: true,
    status: 500,
    message: 'Internal Server Error',
    ...(import.meta.dev && { detail: error.cause ?? error.message }),
  });
});
