import type { $Fetch } from 'ofetch';
import type { HttpError } from './errors';

export type HttpMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type ResponseReturn = 'raw' | 'body' | 'data';
export type ArrayFormat = 'repeat' | 'brackets' | 'indices' | 'comma';
export type HttpQuery = Record<string, unknown> | URLSearchParams | string;
export type HttpResponseType = 'json' | 'text' | 'blob' | 'arrayBuffer' | 'stream';

export interface HttpClientOptions {
  baseURL?: string;
  headers?: HeadersInit;
  /** No default: cookies are only sent when you ask for them. */
  credentials?: RequestCredentials;
  /** Milliseconds. Default 10_000. `0` disables the timeout. */
  timeout?: number;
  /** ofetch retry count (idempotent methods by default). */
  retry?: number | false;
  retryDelay?: number;
  retryStatusCodes?: Array<number>;
  /** Default `'body'`. */
  responseReturn?: ResponseReturn;
  /** Unset: `query` is handed to ofetch (ufo). Set: qs-style serialization. */
  arrayFormat?: ArrayFormat;
  querySerializer?: (query: Record<string, unknown>) => string;
  parseResponse?: (text: string) => unknown;
  fetch?: typeof globalThis.fetch;
}

export interface HttpRequestOptions extends Omit<HttpClientOptions, 'baseURL' | 'fetch'> {
  method?: HttpMethod;
  query?: HttpQuery;
  body?: unknown;
  responseType?: HttpResponseType;
  signal?: AbortSignal;
}

export interface HttpRequestContext {
  /** Path or URL as passed to the client (before `baseURL`). */
  url: string;
  options: Omit<HttpRequestOptions, 'headers' | 'method'> & {
    method: HttpMethod;
    headers: Headers;
    responseReturn: ResponseReturn;
  };
  /** Free-form per-request state for interceptors (e.g. retry markers). */
  meta: Record<PropertyKey, unknown>;
}

export interface HttpResponse<T = unknown> {
  status: number;
  headers: Headers;
  data: T;
  request: HttpRequestContext;
  response: Response;
}

export type RequestInterceptor = (context: HttpRequestContext) => void | Promise<void>;

export interface ResponseInterceptor {
  /** May transform the response. Throw to turn it into an error. */
  fulfilled?: (response: HttpResponse) => HttpResponse | Promise<HttpResponse>;
  /**
   * May recover: return an `HttpResponse` to continue through the remaining
   * `fulfilled` handlers, or any other value to finish with it as the result.
   * Throw to keep the request failed.
   */
  rejected?: (error: HttpError) => unknown;
}

export interface HttpClient {
  request: <T = unknown>(url: string, options?: HttpRequestOptions) => Promise<T>;
  get: <T = unknown>(url: string, options?: HttpRequestOptions) => Promise<T>;
  delete: <T = unknown>(url: string, options?: HttpRequestOptions) => Promise<T>;
  post: <T = unknown>(url: string, body?: unknown, options?: HttpRequestOptions) => Promise<T>;
  put: <T = unknown>(url: string, body?: unknown, options?: HttpRequestOptions) => Promise<T>;
  patch: <T = unknown>(url: string, body?: unknown, options?: HttpRequestOptions) => Promise<T>;
  /** Returns a function that removes the interceptor. */
  addRequestInterceptor: (interceptor: RequestInterceptor) => () => void;
  /** Returns a function that removes the interceptor. */
  addResponseInterceptor: (interceptor: ResponseInterceptor) => () => void;
  /** The configured ofetch instance, for anything the client doesn't cover. */
  readonly raw: $Fetch;
}
