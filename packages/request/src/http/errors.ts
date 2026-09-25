import type { HttpRequestContext } from './types';

export type HttpErrorKind = 'network' | 'timeout' | 'abort' | 'http' | 'envelope';

export interface HttpErrorInit {
  kind: HttpErrorKind;
  message: string;
  request: { url: string; method: string };
  context?: HttpRequestContext;
  status?: number;
  code?: unknown;
  data?: unknown;
  response?: Response;
  cause?: unknown;
}

/** The single error type every `./http` request rejects with. */
export class HttpError extends Error {
  override readonly name = 'HttpError';
  readonly kind: HttpErrorKind;
  readonly request: { url: string; method: string };
  /** Full request context, used by presets that re-issue the request. */
  readonly context?: HttpRequestContext;
  readonly status?: number;
  readonly code?: unknown;
  readonly data?: unknown;
  readonly response?: Response;

  constructor(init: HttpErrorInit) {
    super(init.message, { cause: init.cause });
    this.kind = init.kind;
    this.request = init.request;
    this.context = init.context;
    this.status = init.status;
    this.code = init.code;
    this.data = init.data;
    this.response = init.response;
  }
}

export function isHttpError(error: unknown): error is HttpError {
  return error instanceof HttpError
    || (typeof error === 'object' && error !== null
      && (error as { name?: unknown }).name === 'HttpError'
      && 'kind' in error);
}

/** `data.message` or `data.error` when the server sent a string there. */
export function getServerMessage(data: unknown): string | undefined {
  if (typeof data !== 'object' || data === null) {
    return undefined;
  }
  const { message, error } = data as { message?: unknown; error?: unknown };
  if (typeof message === 'string' && message) {
    return message;
  }
  return typeof error === 'string' && error ? error : undefined;
}

interface FetchErrorLike {
  data?: unknown;
  response?: Response;
  cause?: unknown;
}

/** Normalizes anything a request can throw into an `HttpError`. */
export function toHttpError(error: unknown, context: HttpRequestContext): HttpError {
  if (isHttpError(error)) {
    return error;
  }

  const request = { url: context.url, method: context.options.method };

  // The caller's own signal was aborted (any reason) — this always wins over
  // however the underlying fetch happened to shape the error.
  if (context.options.signal?.aborted) {
    return new HttpError({ kind: 'abort', message: `${request.method} ${request.url} was aborted`, request, context, cause: error });
  }

  const fetchError = (error ?? {}) as FetchErrorLike;
  const isFetchError = (error as { name?: unknown } | null | undefined)?.name === 'FetchError';

  if (!isFetchError) {
    // ofetch only wraps transport failures in a `FetchError`; anything else
    // thrown out of `$fetch.raw` (e.g. a custom `parseResponse` throwing on
    // an unparsable 200 body) is a response-parsing failure, not a network one.
    return new HttpError({
      kind: 'http',
      message: `${request.method} ${request.url} returned a response that could not be parsed`,
      request,
      context,
      cause: error,
    });
  }

  if (fetchError.response) {
    const { status } = fetchError.response;
    return new HttpError({
      kind: 'http',
      message: getServerMessage(fetchError.data) ?? `${request.method} ${request.url} failed with status ${status}`,
      request,
      context,
      status,
      data: fetchError.data,
      response: fetchError.response,
      cause: error,
    });
  }

  const cause = fetchError.cause ?? error;
  const name = (cause as { name?: unknown } | undefined)?.name;

  if (name === 'TimeoutError') {
    return new HttpError({ kind: 'timeout', message: `${request.method} ${request.url} timed out`, request, context, cause: error });
  }
  if (name === 'AbortError') {
    return new HttpError({ kind: 'abort', message: `${request.method} ${request.url} was aborted`, request, context, cause: error });
  }
  return new HttpError({ kind: 'network', message: `${request.method} ${request.url} could not reach the server`, request, context, cause: error });
}
