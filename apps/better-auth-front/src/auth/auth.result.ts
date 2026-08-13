import { getErrors } from '#/api/errors';

/**
 * Shape every `authClient` method resolves to (better-fetch's discriminated
 * union): `{ data, error: null }` on success, `{ data: null, error }`
 * otherwise. `authClient` calls never reject for API-level failures — only
 * genuine network/transport errors throw.
 */
export interface AuthClientResult<T> {
  data: null | T;
  error: null | { message?: string; status: number; statusText: string };
}

/**
 * Thrown by `unwrapAuthResult` on a better-auth API failure. Carries
 * `status`/`statusText` as real properties (not buried in `cause`) so
 * `getErrors` can read them directly, mirroring `@taman/fetch`'s `ApiError`.
 */
export class AuthError extends Error {
  readonly status?: number;
  readonly statusText?: string;

  constructor(init: {
    message: string;
    status?: number;
    statusText?: string;
    cause?: unknown;
  }) {
    super(init.message, { cause: init.cause });
    this.name = 'AuthError';
    this.status = init.status;
    this.statusText = init.statusText;
  }
}

/**
 * Unwraps an `authClient` call: returns `data` on success, throws
 * `AuthError` on `error` (message/status/statusText + the original error
 * preserved via `cause`). Use this wherever a better-auth call should
 * surface as a query/mutation error rather than being silently treated as
 * empty (contrast with `sessionQueryOptions`, which treats a failed
 * session fetch as "signed out" instead of an error).
 *
 * Message resolution is delegated to `getErrors` rather than duplicated
 * here, so a bodyless failure (e.g. `{ status: 403, statusText: 'Forbidden' }`
 * with no `message`) still gets the i18n-mapped message instead of the raw
 * `statusText`.
 */
export async function unwrapAuthResult<T>(
  request: Promise<AuthClientResult<T>>,
): Promise<T> {
  const { data, error } = await request;
  if (error) {
    throw new AuthError({
      cause: error,
      message: getErrors(error),
      status: error.status,
      statusText: error.statusText,
    });
  }
  return data as T;
}
