import type { HttpError } from '../errors';
import type { InternalRequestOptions } from '../internal';
import type { HttpClient, HttpRequestContext, ResponseInterceptor } from '../types';
import { AFTER_REQUEST_INTERCEPTORS, RETRIED } from '../internal';

export interface RefreshTokenInterceptorOptions {
  client: HttpClient;
  /**
   * Obtains a new access token. Must call the refresh endpoint with
   * `skipAuthRefresh: true` (or through a client without this interceptor) —
   * otherwise the refresh request's own 401 re-enters this interceptor and
   * awaits the very attempt it is part of, deadlocking forever.
   */
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

  /** M6: never let a throwing `onAuthFailure` replace the original error or escape the dedupe. */
  function notifyAuthFailure(error: HttpError): Promise<void> {
    return Promise.resolve()
      .then(() => options.onAuthFailure(error))
      .catch((failure: unknown) => {
        console.error('[refreshToken] onAuthFailure failed', failure);
      });
  }

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

      const context = error.context;

      // C1: this is the refresh call itself (or any request the caller opted
      // out for) — never route it back through the refresh flow, or a
      // failing refresh endpoint would await its own in-flight attempt forever.
      // Never touch `inflight` here — only read it: when it's set, this
      // failure is the refresh endpoint's own 401 inside an attempt that's
      // already in flight, and the waiting request(s) will notify once via
      // their own "refresh failed" dedupe below; only notify directly for a
      // standalone request (no attempt in flight to dedupe with).
      if (context?.options.skipAuthRefresh) {
        if (!inflight) {
          await notifyAuthFailure(error);
        }
        throw error;
      }

      const enabled = typeof options.enabled === 'function' ? options.enabled() : options.enabled ?? true;

      if (!enabled || !context || context.meta[RETRIED]) {
        await notifyAuthFailure(error);
        throw error;
      }

      const attempt = inflight ??= startRefresh();
      let token: string;
      try {
        token = await attempt.promise;
      } catch {
        attempt.failure ??= notifyAuthFailure(error);
        await attempt.failure;
        throw error;
      }

      // I1: apply the token after the re-issue's own request interceptors
      // run, so a preset that re-applies a stale token from closure state
      // doesn't overwrite the refreshed one.
      const retryOptions: InternalRequestOptions = {
        ...context.options,
        headers: new Headers(context.options.headers),
        [RETRIED]: true,
        [AFTER_REQUEST_INTERCEPTORS]: (retryContext: HttpRequestContext) => options.applyToken(retryContext, token),
      };
      return options.client.request(context.url, retryOptions);
    },
  };
}
