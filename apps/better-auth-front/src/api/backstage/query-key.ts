import type { ComputedRef, MaybeRefOrGetter } from 'vue';

import { computed, toValue } from 'vue';

export type QueryParams = Record<string, unknown>;

/** Default query key: [url] or [url, query], fully reactive. */
export function buildQueryKey(
  url: MaybeRefOrGetter<string>,
  query?: MaybeRefOrGetter<QueryParams | undefined>,
): ComputedRef<ReadonlyArray<unknown>> {
  return computed(() => {
    const resolvedQuery = toValue(query);
    return resolvedQuery === undefined
      ? [toValue(url)]
      : [toValue(url), resolvedQuery];
  });
}
