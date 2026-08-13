import type { ApiError, RequestOptions } from '@taman/request';
import type {
  MutationOptions,
  UseQueryOptions,
  UseQueryReturnType,
} from '@tanstack/vue-query';
import type { MaybeRefOrGetter } from 'vue';
import type { QueryParams } from './query-key';
import { isFunction } from '@taman/utils';
import { useMutation, useQuery } from '@tanstack/vue-query';
import { computed, toValue } from 'vue';
import { useRequest } from '../use-request';
import { buildQueryKey } from './query-key';

interface UseBackstageQueryOptions<T>
  extends Omit<UseQueryOptions<T, ApiError>, 'queryFn' | 'queryKey'> {
  /** Overrides the derived [url, query] key. */
  key?: MaybeRefOrGetter<ReadonlyArray<unknown>>;
  /** Reactive URL query params; part of the derived query key. */
  query?: MaybeRefOrGetter<QueryParams | undefined>;
}

export function useBackstageQuery<
  T,
>(
  url: MaybeRefOrGetter<string>,
  {
    fetchOptions,
    queryOptions = {},
  }: {
    fetchOptions?: RequestOptions;
    queryOptions?: UseBackstageQueryOptions<T>;
  },
): UseQueryReturnType<T, ApiError> {
  const { doRequest } = useRequest();

  const { key, query, ...restQueryOptions } = queryOptions;

  const queryKey = key
    ? computed(() => toValue(key))
    : buildQueryKey(url, query);

  return useQuery<T, ApiError>({
    queryKey,
    queryFn: () => doRequest<T>(
      toValue(url),
      {
        query: toValue(query),
        ...fetchOptions,
      },
    ),
    retry: false,
    ...restQueryOptions,
  });
}

/**
 * Extends vue-query's non-union `MutationOptions`, not `UseMutationOptions`.
 * The latter is `MaybeRefDeep<MutationOptions> | (() => ...)`, and
 * `Omit`/`extends` on that union collapses keys via `keyof` intersection —
 * so callbacks like `onSuccess` would disappear from this interface.
 */
interface UseBackstageMutationOptions<TData, TVars>
  extends Omit<MutationOptions<TData, ApiError, TVars>, 'mutationFn'> {
  /** Maps mutation variables to the request body. Default: vars itself. */
  body?: (vars: TVars) => unknown;
}

export function useBackstageMutation<
  TData,
  TVars = void,
>(
  url: string | ((vars: TVars) => string),
  {
    fetchOptions,
    mutationOptions = {},
  }: {
    fetchOptions?: RequestOptions;
    mutationOptions?: UseBackstageMutationOptions<TData, TVars>;
  },
) {
  const { doRequest } = useRequest();
  const { body, ...restMutationOptions } = mutationOptions;

  return useMutation<TData, ApiError, TVars>({
    ...restMutationOptions,
    mutationFn: (vars: TVars) => {
      return doRequest<TData>(
        isFunction(url) ? url(vars) : url,
        {
          body: (body ? body(vars) : vars) as RequestOptions['body'],
          ...fetchOptions,
        },
      );
    },
  });
}
