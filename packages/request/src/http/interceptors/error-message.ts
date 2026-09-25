import type { HttpError } from '../errors';
import type { ResponseInterceptor } from '../types';
import { getServerMessage } from '../errors';

export type ErrorMessageKey = 'network' | 'timeout' | 'default' | 400 | 401 | 403 | 404 | 408;

export const DEFAULT_ERROR_MESSAGES: Record<ErrorMessageKey, string> = {
  network: 'Network error. Please check your connection.',
  timeout: 'The request timed out. Please try again.',
  default: 'Something went wrong. Please try again.',
  400: 'The request was invalid.',
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have permission to do that.',
  404: 'The requested resource was not found.',
  408: 'The request timed out. Please try again.',
};

export interface ErrorMessageInterceptorOptions {
  notify: (message: string, error: HttpError) => void;
  /** Override any default message, e.g. with translated strings. */
  messages?: Partial<Record<ErrorMessageKey, string>>;
  /** Prefer `data.message` / `data.error` from the server. Default `true`. */
  preferServerMessage?: boolean;
}

const NOTIFIED = Symbol.for('vinicunca.request.notified');

/** Shows one message per failed request, then rethrows. Aborts are silent. */
export function errorMessageInterceptor(options: ErrorMessageInterceptorOptions): ResponseInterceptor {
  const messages = { ...DEFAULT_ERROR_MESSAGES, ...options.messages };
  const preferServerMessage = options.preferServerMessage ?? true;

  return {
    rejected(error) {
      const flagged = error as HttpError & { [NOTIFIED]?: boolean };
      if (error.kind === 'abort' || flagged[NOTIFIED]) {
        throw error;
      }

      const serverMessage = preferServerMessage ? getServerMessage(error.data) : undefined;
      const kindMessage = error.kind === 'network' || error.kind === 'timeout' ? messages[error.kind] : undefined;
      const statusMessage = error.status === undefined ? undefined : messages[error.status as ErrorMessageKey];

      flagged[NOTIFIED] = true;
      options.notify(serverMessage ?? kindMessage ?? statusMessage ?? messages.default, error);
      throw error;
    },
  };
}
