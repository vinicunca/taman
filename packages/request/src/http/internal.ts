import type { HttpRequestContext, HttpRequestOptions } from './types';

/** Request-context `meta` key set by presets that re-issue a request. */
export const RETRIED = Symbol.for('vinicunca.request.retried');

/**
 * Request option set by presets that re-issue a request: called with the
 * freshly built `HttpRequestContext` right after request interceptors have
 * run, so a preset can apply state (e.g. a refreshed token) that would
 * otherwise be overwritten when interceptors re-run on the re-issue.
 */
export const AFTER_REQUEST_INTERCEPTORS = Symbol.for('vinicunca.request.after-request-interceptors');

/** Options accepted internally: the public options plus the retry marker. */
export type InternalRequestOptions = HttpRequestOptions & {
  [RETRIED]?: boolean;
  [AFTER_REQUEST_INTERCEPTORS]?: (context: HttpRequestContext) => void;
};
