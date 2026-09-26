import { createHttpClient } from '@vinicunca/request/http';
import { createHttpQueryUtils } from '@vinicunca/request/http-query';

/**
 * Example non-RPC client: the public dummyjson.com API behind the vue-query
 * demos. Real integrations add interceptors here (auth header, envelope,
 * token refresh, error toasts) — see `@vinicunca/request`'s README.
 */
export const dummyjsonClient = createHttpClient({ baseURL: 'https://dummyjson.com' });

/** vue-query helpers — `useQuery(dummyjson.get<T>('/products').queryOptions(...))`. */
export const dummyjson = createHttpQueryUtils(dummyjsonClient, { key: ['dummyjson'] });
