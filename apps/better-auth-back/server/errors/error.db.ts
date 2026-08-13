import { isString } from '@vinicunca/perkakas';
import { defineErrorHandler } from 'nitro';
import { jsonError } from './error.utils';

/**
 * Postgres / network failure codes worth a friendlier message.
 * These surface when the DB is unreachable (e.g. Docker not running).
 */
const CONNECTION_ERROR_CODES = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'ENOTFOUND',
  'ETIMEDOUT',
  'EAI_AGAIN',
]);

/**
 * Database-specific error handler. First link in the `errorHandler` chain.
 *
 * Unhandled errors thrown from a handler are wrapped by h3 as
 * `HTTPError({ cause: originalError, unhandled: true })`, so the original
 * error (e.g. a pg `ECONNREFUSED`) is reachable via `error.cause`.
 *
 * Returns a 503 only for connection failures; anything else returns `void` so
 * the chain falls through to the general handler.
 *
 * `import.meta.dev` is true under `nitro dev` and false in builds, so it gates
 * verbose, developer-only detail without leaking internals in production.
 */
export default defineErrorHandler((error, event) => {
  const connectionCode = findConnectionErrorCode(error);

  if (!connectionCode) {
    return;
  }

  return jsonError(event, 503, {
    error: true,
    status: 503,
    message: 'Unable to reach the database. Is it running?',
    ...(import.meta.dev && {
      hint: 'Start the local database with `docker compose up -d db`.',
      detail: connectionCode,
    }),
  });
});

/**
 * Walks the `cause` chain (errors can nest, and pg may throw an
 * `AggregateError`) looking for a known connection-failure code.
 */
function findConnectionErrorCode(error: unknown, depth = 0): string | undefined {
  if (!error || typeof error !== 'object' || depth > 5) {
    return undefined;
  }

  const code = (error as { code?: unknown }).code;
  if (isString(code) && CONNECTION_ERROR_CODES.has(code)) {
    return code;
  }

  const aggregated = (error as { errors?: unknown }).errors;
  if (Array.isArray(aggregated)) {
    for (const inner of aggregated) {
      const found = findConnectionErrorCode(inner, depth + 1);
      if (found) {
        return found;
      }
    }
  }

  return findConnectionErrorCode((error as { cause?: unknown }).cause, depth + 1);
}
