import { $t } from '@taman/locales';
import { ORG_REQUIRED } from '@vinicunca/taman-api-contract';
import { ORPCError } from '@vinicunca/taman-request/orpc';

interface FetchErrorLike {
  code?: string;
  message?: string;
  status?: number;
  statusText?: string;
}

/**
 * Known HTTP status → i18n fallback message, used only when the error
 * itself carries no specific `message`.
 */
// TODO: move these status numbers into the locale's JSON instead.
const HTTP_STATUS_MESSAGE_KEYS: Record<number, string> = {
  400: 'ui.fallback.http.badRequest',
  401: 'ui.fallback.http.unauthorized',
  403: 'ui.fallback.http.forbidden',
  404: 'ui.fallback.http.notFound',
  408: 'ui.fallback.http.requestTimeout',
  500: 'ui.fallback.http.internalServerError',
  503: 'ui.fallback.http.serviceUnavailable',
};

/** oRPC error code → i18n fallback, mirroring the HTTP status map above. */
const ORPC_CODE_MESSAGE_KEYS: Record<string, string> = {
  BAD_REQUEST: 'ui.fallback.http.badRequest',
  UNAUTHORIZED: 'ui.fallback.http.unauthorized',
  FORBIDDEN: 'ui.fallback.http.forbidden',
  NOT_FOUND: 'ui.fallback.http.notFound',
  TIMEOUT: 'ui.fallback.http.requestTimeout',
  INTERNAL_SERVER_ERROR: 'ui.fallback.http.internalServerError',
  SERVICE_UNAVAILABLE: 'ui.fallback.http.serviceUnavailable',
};

function getORPCErrorMessage(error: ORPCError<string, unknown>): string {
  const data = (error.data ?? {}) as { code?: string; issues?: Array<{ message?: string }> };

  if (data.code === ORG_REQUIRED && error.message) {
    return error.message;
  }

  const firstIssue = data.issues?.[0]?.message;
  if (error.code === 'BAD_REQUEST' && firstIssue) {
    return firstIssue;
  }

  const key = ORPC_CODE_MESSAGE_KEYS[error.code];
  if (key) {
    return $t(key);
  }

  return error.message || $t('ui.fallback.internalError');
}

/**
 * Normalize an error into a user-facing message.
 *
 * Handles three shapes:
 * - `TypeError` — fetch rejected (network down / CORS blocked).
 * - `ORPCError` — from the oRPC client (`#/api/orpc`).
 * - Better Auth client error object / `AuthError` — `{ status, statusText,
 *   message?, code? }`. A bodyless 500 only carries `status`/`statusText`,
 *   so fall back through those.
 *
 * Precedence: a known `status` wins first, via the i18n mapping above —
 * better-auth's own error messages are hardcoded English, never localized,
 * so they'd leak untranslated text into non-English locales otherwise.
 * Falls back to the server-provided `message` (e.g. from
 * `@vinicunca/taman-request`, where messages may already be localized),
 * then `statusText`, then a fully generic fallback.
 */
export function getErrors(error: unknown): string {
  if (error instanceof TypeError) {
    return $t('ui.fallback.http.networkError');
  }

  if (error instanceof ORPCError) {
    return getORPCErrorMessage(error);
  }

  if (error && typeof error === 'object') {
    const { message, status, statusText } = error as FetchErrorLike;

    if (status !== undefined && HTTP_STATUS_MESSAGE_KEYS[status]) {
      return $t(HTTP_STATUS_MESSAGE_KEYS[status]);
    }

    if (message) {
      return message;
    }

    if (statusText) {
      return statusText;
    }
  }

  return $t('ui.fallback.internalError');
}
