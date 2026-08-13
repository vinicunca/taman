import { $t } from '@taman/locales';

interface FetchErrorLike {
  code?: string;
  message?: string;
  status?: number;
  statusText?: string;
}

/**
 * Known HTTP status → i18n fallback message, used only when the error
 * itself carries no specific `message` (mirrors the old axios
 * `errorMessageResponseInterceptor`'s status switch).
 */
// TODO: move these status numbers into the locale's JSON instead.
const HTTP_STATUS_MESSAGE_KEYS: Record<number, string> = {
  400: 'ui.fallback.http.badRequest',
  401: 'ui.fallback.http.unauthorized',
  403: 'ui.fallback.http.forbidden',
  404: 'ui.fallback.http.notFound',
  408: 'ui.fallback.http.requestTimeout',
  500: 'ui.fallback.http.internalServerError',
};

/**
 * Normalize an error into a user-facing message.
 *
 * Handles two shapes:
 * - `TypeError` — fetch rejected (network down / CORS blocked).
 * - Better Auth client error object / `AuthError` — `{ status, statusText,
 *   message?, code? }`. A bodyless 500 only carries `status`/`statusText`,
 *   so fall back through those.
 *
 * Precedence: a known `status` wins first, via the i18n mapping above —
 * better-auth's own error messages are hardcoded English, never localized,
 * so they'd leak untranslated text into non-English locales otherwise.
 * Falls back to the server-provided `message` (e.g. from `@taman/request`,
 * where messages may already be localized), then `statusText`, then a
 * fully generic fallback.
 */
export function getErrors(error: unknown): string {
  if (error instanceof TypeError) {
    return $t('ui.fallback.http.networkError');
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
