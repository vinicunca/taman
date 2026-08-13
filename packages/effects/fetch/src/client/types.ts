import type { $Fetch, FetchOptions } from 'ofetch';

/** The fixed response envelope this backend returns. */
export interface ApiEnvelope<T> {
  code: number;
  data: T;
  message: string;
}

/** Keys owned by the envelope logic: every call forces JSON response parsing. */
type EnvelopeOwnedKeys = 'parseResponse' | 'responseType';

/**
 * Deliberately NOT narrowed to `FetchOptions<'json'>`: `ofetch.create()`'s
 * `defaults` parameter is the general, unparameterized `FetchOptions`, and a
 * `'json'`-narrowed value doesn't satisfy it (contravariant `retryDelay`
 * callback). The envelope logic forces `responseType: 'json'` per-call
 * instead, inside `request()` — these types stay general to match ofetch.
 */
export interface CreateFetchClientOptions
  extends Omit<FetchOptions, 'body' | EnvelopeOwnedKeys> {
  baseURL: string;
  /** Envelope `code` value meaning success. Default 0. */
  successCode?: number;
}

/**
 * Per-call options, mirroring ofetch's own calling convention: `method`
 * defaults to GET when omitted, so pass it explicitly for anything else.
 * `body` keeps ofetch's own type (string | BodyInit | plain object).
 */
export interface RequestOptions
  extends Omit<FetchOptions, 'baseURL' | EnvelopeOwnedKeys> {
}

export interface FetchClient {
  /** Envelope-aware call. `method` defaults to GET; pass it explicitly otherwise. */
  request: <T>(url: string, options?: RequestOptions) => Promise<T>;
  /** Raw ofetch instance sharing baseURL/options — no envelope logic. */
  native: $Fetch;
}
