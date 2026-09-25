import type { FetchOptions } from 'ofetch';
import type {
  HttpClient,
  HttpClientOptions,
  HttpRequestContext,
  HttpRequestOptions,
  HttpResponse,
  RequestInterceptor,
  ResponseInterceptor,
} from './types';
import { ofetch } from 'ofetch';
import type { InternalRequestOptions } from './internal';
import { toHttpError } from './errors';
import { RETRIED } from './internal';
import { appendQueryString, serializeQuery } from './query';

export const DEFAULT_TIMEOUT = 10_000;

const HTTP_RESPONSE = Symbol.for('vinicunca.request.http-response');

export function isHttpResponse(value: unknown): value is HttpResponse {
  return typeof value === 'object' && value !== null && HTTP_RESPONSE in value;
}

function combineSignals(signal: AbortSignal | undefined, timeout: number): AbortSignal | undefined {
  // ofetch ignores its own `timeout` whenever a `signal` is present, so the
  // client owns the timeout and merges it with the caller's signal.
  const signals = [signal, timeout > 0 ? AbortSignal.timeout(timeout) : undefined]
    .filter((item): item is AbortSignal => item !== undefined);

  if (signals.length <= 1) {
    return signals[0];
  }
  return AbortSignal.any(signals);
}

/**
 * vben-style HTTP client on ofetch: typed methods, an interceptor chain that
 * can transform results and recover from errors, and `responseReturn`.
 */
export function createHttpClient(clientOptions: HttpClientOptions = {}): HttpClient {
  const { baseURL, fetch, headers: defaultHeaders, ...defaults } = clientOptions;
  const $fetch = ofetch.create({ baseURL }, fetch ? { fetch } : undefined);
  const requestInterceptors: Array<RequestInterceptor> = [];
  const responseInterceptors: Array<ResponseInterceptor> = [];

  function createContext(url: string, options: InternalRequestOptions): HttpRequestContext {
    const headers = new Headers(defaultHeaders);
    new Headers(options.headers).forEach((value, key) => headers.set(key, value));

    return {
      url,
      options: {
        ...defaults,
        ...options,
        method: options.method ?? 'GET',
        headers,
        responseReturn: options.responseReturn ?? defaults.responseReturn ?? 'body',
      },
      meta: options[RETRIED] ? { [RETRIED]: true } : {},
    };
  }

  async function send(context: HttpRequestContext): Promise<HttpResponse> {
    const {
      method,
      headers,
      body,
      query,
      credentials,
      timeout = DEFAULT_TIMEOUT,
      retry,
      retryDelay,
      retryStatusCodes,
      responseType,
      parseResponse,
      arrayFormat,
      querySerializer,
      signal,
    } = context.options;

    let url = context.url;
    let ofetchQuery: Record<string, unknown> | undefined;

    if (typeof query === 'string' || query instanceof URLSearchParams) {
      url = appendQueryString(url, query.toString().replace(/^\?/, ''));
    } else if (query && (querySerializer || arrayFormat)) {
      url = appendQueryString(url, querySerializer ? querySerializer(query) : serializeQuery(query, arrayFormat));
    } else if (query) {
      ofetchQuery = query;
    }

    try {
      const response = await $fetch.raw(url, {
        method,
        headers,
        body: body as FetchOptions['body'],
        query: ofetchQuery,
        credentials,
        retry,
        retryDelay,
        retryStatusCodes,
        responseType,
        parseResponse,
        signal: combineSignals(signal, timeout),
      } as FetchOptions);

      return {
        [HTTP_RESPONSE]: true,
        status: response.status,
        headers: response.headers,
        data: response._data,
        request: context,
        response,
      } as HttpResponse;
    } catch (error) {
      throw toHttpError(error, context);
    }
  }

  async function request<T>(url: string, options: HttpRequestOptions = {}): Promise<T> {
    const context = createContext(url, options);

    for (const interceptor of [...requestInterceptors]) {
      await interceptor(context);
    }

    let chain: Promise<unknown> = send(context);
    for (const { fulfilled, rejected } of [...responseInterceptors]) {
      chain = chain.then(
        (value) => (fulfilled && isHttpResponse(value) ? fulfilled(value) : value),
        (error: unknown) => {
          if (!rejected) {
            throw error;
          }
          return rejected(toHttpError(error, context));
        },
      );
    }

    const result = await chain;
    if (!isHttpResponse(result)) {
      return result as T;
    }
    // This request's own setting decides, even when a recovered response came
    // from a re-issued request.
    return (context.options.responseReturn === 'raw' ? result : result.data) as T;
  }

  function remover<T>(list: Array<T>, item: T): () => void {
    list.push(item);
    return () => {
      const index = list.indexOf(item);
      if (index !== -1) {
        list.splice(index, 1);
      }
    };
  }

  return {
    request,
    get: (url, options) => request(url, { ...options, method: 'GET' }),
    delete: (url, options) => request(url, { ...options, method: 'DELETE' }),
    post: (url, body, options) => request(url, { ...options, body, method: 'POST' }),
    put: (url, body, options) => request(url, { ...options, body, method: 'PUT' }),
    patch: (url, body, options) => request(url, { ...options, body, method: 'PATCH' }),
    addRequestInterceptor: (interceptor) => remover(requestInterceptors, interceptor),
    addResponseInterceptor: (interceptor) => remover(responseInterceptors, interceptor),
    raw: $fetch,
  };
}
