import type { MutationObserverOptions, QueryFunction, QueryFunctionContext, QueryKey, QueryObserverOptions } from '@tanstack/query-core';
import type { HttpError } from './http/errors';
import type { HttpClient, HttpMethod, HttpQuery, HttpRequestOptions } from './http/types';

/**
 * Request options forwarded to the HTTP client; everything else goes to
 * TanStack Query. `retry`, `retryDelay` and `meta` exist on both sides, so
 * here they belong to TanStack — set HTTP-level retries on the client.
 */
const REQUEST_OPTION_KEYS = [
  'query',
  'headers',
  'credentials',
  'timeout',
  'responseReturn',
  'responseType',
  'arrayFormat',
  'querySerializer',
  'parseResponse',
] as const;

type RequestOptionKey = typeof REQUEST_OPTION_KEYS[number];
export type HttpQueryRequestOptions = Pick<HttpRequestOptions, RequestOptionKey>;

/** Options accepted by `get(path).queryOptions()`: request options + TanStack query options. */
export type HttpQueryOptionsIn<TData, TSelected> = HttpQueryRequestOptions
  & Omit<QueryObserverOptions<TData, HttpError, TSelected, TData, QueryKey>, 'queryKey' | 'queryFn'>;

/** What `queryOptions()` adds to the options you passed. */
export interface HttpQueryOptionsBase<TData> {
  queryKey: QueryKey;
  queryFn: QueryFunction<TData>;
  enabled?: boolean;
}

/** Options accepted by `post(path).mutationOptions()` and friends. */
export type HttpMutationOptionsIn<TData, TVariables, TContext> = HttpQueryRequestOptions
  & Omit<MutationObserverOptions<TData, HttpError, TVariables, TContext>, 'mutationKey' | 'mutationFn'>
  & {
    /** Maps the mutation variables to the request body. Default: the variables themselves. */
    body?: (variables: TVariables) => unknown;
  };

export interface HttpQueryEndpoint<TData> {
  /** `[...root, 'GET', path]`: matches every query of this path. */
  key: () => QueryKey;
  queryOptions: <U, TSelected = TData>(
    options?: U & HttpQueryOptionsIn<TData, TSelected>,
  ) => NoInfer<Omit<U, RequestOptionKey> & HttpQueryOptionsBase<TData>>;
}

export interface HttpMutationEndpoint<TData, TVariables> {
  key: () => QueryKey;
  mutationOptions: <TContext = unknown>(
    options?: HttpMutationOptionsIn<TData, TVariables, TContext>,
  ) => NoInfer<MutationObserverOptions<TData, HttpError, TVariables, TContext>>;
}

type MutationPath<TVariables> = string | ((variables: TVariables) => string);

export interface HttpQueryUtils {
  /** `[...root]`, or `[...root, 'GET', path]`. */
  key: (path?: string) => QueryKey;
  get: <TData = unknown>(path: string) => HttpQueryEndpoint<TData>;
  post: <TData = unknown, TVariables = void>(path: MutationPath<TVariables>) => HttpMutationEndpoint<TData, TVariables>;
  put: <TData = unknown, TVariables = void>(path: MutationPath<TVariables>) => HttpMutationEndpoint<TData, TVariables>;
  patch: <TData = unknown, TVariables = void>(path: MutationPath<TVariables>) => HttpMutationEndpoint<TData, TVariables>;
  delete: <TData = unknown, TVariables = void>(path: MutationPath<TVariables>) => HttpMutationEndpoint<TData, TVariables>;
}

function splitOptions(options: object): [HttpQueryRequestOptions, Record<string, unknown>] {
  const request: Record<string, unknown> = {};
  const rest = { ...options } as Record<string, unknown>;
  for (const key of REQUEST_OPTION_KEYS) {
    if (key in rest) {
      request[key] = rest[key];
      Reflect.deleteProperty(rest, key);
    }
  }
  return [request as HttpQueryRequestOptions, rest];
}

/** Keys must be JSON-serializable for TanStack's hashing. */
function keyQuery(query: HttpQuery | undefined): unknown {
  return query instanceof URLSearchParams ? query.toString() : query ?? null;
}

/** TanStack Query options builders for an `./http` client. */
export function createHttpQueryUtils(client: HttpClient, options: { key?: ReadonlyArray<unknown> } = {}): HttpQueryUtils {
  const root = [...(options.key ?? [])];

  function mutation<TData, TVariables>(method: Exclude<HttpMethod, 'GET' | 'HEAD'>, path: MutationPath<TVariables>): HttpMutationEndpoint<TData, TVariables> {
    const key = () => (typeof path === 'string' ? [...root, method, path] : [...root, method]);
    return {
      key,
      mutationOptions(mutationOptions = {} as never) {
        const { body, ...withoutBody } = mutationOptions as { body?: (variables: TVariables) => unknown };
        const [request, rest] = splitOptions(withoutBody);
        return {
          ...rest,
          mutationKey: key(),
          mutationFn: (variables: TVariables) => client.request<TData>(typeof path === 'function' ? path(variables) : path, {
            ...request,
            method,
            body: body ? body(variables) : variables,
          }),
        } as never;
      },
    };
  }

  return {
    key: (path) => (path === undefined ? [...root] : [...root, 'GET', path]),
    get<TData>(path: string): HttpQueryEndpoint<TData> {
      return {
        key: () => [...root, 'GET', path],
        queryOptions(queryOptions = {} as never) {
          const [request, rest] = splitOptions(queryOptions);
          return {
            ...rest,
            queryKey: [...root, 'GET', path, { query: keyQuery(request.query) }],
            queryFn: ({ signal }: QueryFunctionContext) => client.request<TData>(path, { ...request, method: 'GET', signal }),
          } as never;
        },
      };
    },
    post: (path) => mutation('POST', path),
    put: (path) => mutation('PUT', path),
    patch: (path) => mutation('PATCH', path),
    delete: (path) => mutation('DELETE', path),
  };
}
