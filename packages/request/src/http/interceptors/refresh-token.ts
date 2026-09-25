import type { HttpError } from '../errors';
import type { InternalRequestOptions } from '../internal';
import type { HttpClient, HttpRequestContext, ResponseInterceptor } from '../types';
import { RETRIED } from '../internal';

export interface RefreshTokenInterceptorOptions {
  client: HttpClient;
  /** Obtains a new access token. */
  refresh: () => Promise<string>;
  /** Writes the new token onto the request that will be re-issued. */
  applyToken: (context: HttpRequestContext, token: string) => void;
  /** Log out, show a "session expired" dialog, … */
  onAuthFailure: (error: HttpError) => void | Promise<void>;
  /** Default `true`. When `false`, a 401 goes straight to `onAuthFailure`. */
  enabled?: boolean | (() => boolean);
  /** Default: `error.status === 401`. */
  isUnauthorized?: (error: HttpError) => boolean;
}

interface RefreshAttempt {
  promise: Promise<string>;
  failure?: Promise<void>;
}

/**
 * On 401: refresh the token once (concurrent 401s share the same refresh),
 * then re-issue each failed request once with the new token.
 */
export function refreshTokenInterceptor(options: RefreshTokenInterceptorOptions): ResponseInterceptor {
  const isUnauthorized = options.isUnauthorized ?? ((error: HttpError) => error.status === 401);
  let inflight: RefreshAttempt | undefined;

  function startRefresh(): RefreshAttempt {
    const attempt: RefreshAttempt = { promise: options.refresh() };
    attempt.promise
      .finally(() => {
        if (inflight === attempt) {
          inflight = undefined;
        }
      })
      .catch(() => {});
    return attempt;
  }

  return {
    async rejected(error) {
      if (!isUnauthorized(error)) {
        throw error;
      }

      const enabled = typeof options.enabled === 'function' ? options.enabled() : options.enabled ?? true;
      const context = error.context;

      if (!enabled || !context || context.meta[RETRIED]) {
        await options.onAuthFailure(error);
        throw error;
      }

      const attempt = inflight ??= startRefresh();
      let token: string;
      try {
        token = await attempt.promise;
      } catch {
        attempt.failure ??= Promise.resolve(options.onAuthFailure(error));
        await attempt.failure;
        throw error;
      }

      const retryContext: HttpRequestContext = {
        url: context.url,
        options: { ...context.options, headers: new Headers(context.options.headers) },
        meta: { ...context.meta, [RETRIED]: true },
      };
      options.applyToken(retryContext, token);

      const retryOptions: InternalRequestOptions = { ...retryContext.options, [RETRIED]: true };
      return options.client.request(retryContext.url, retryOptions);
    },
  };
}
