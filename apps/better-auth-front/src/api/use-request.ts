import type { RequestOptions } from '@taman/request';
import { useAppTamanConfig } from '@taman/composables';
import { createFetchClient } from '@taman/request';

const { apiUrl } = useAppTamanConfig(
  import.meta.env,
  import.meta.env.PROD,
);

export function useRequest() {
  const client = createFetchClient({
    baseURL: apiUrl,
    // Director authenticates off the Better Auth session cookie and runs on a
    // different origin, so cookies have to ride along — ofetch defaults to
    // `same-origin` and would send none. Director's CORS layer already replies
    // with `access-control-allow-credentials: true` for trusted origins.
    credentials: 'include',
  });

  /**
   * Envelope-aware: director's `/api/*` routes reply `{ code: 0, data, message }`
   * (see its `defineApiHandler`), and this unwraps to `data` or throws
   * `ApiError`.
   *
   * Failures are NOT enveloped — director returns `{ error, status, message }`
   * with a non-2xx status, which rejects here and becomes an `ApiError`
   * carrying that same `message` and status. So callers get one error type
   * either way.
   */
  function doRequest<T = unknown>(
    path: string,
    options?: RequestOptions,
  ): Promise<T> {
    return client.request<T>(path, options);
  }

  return {
    doRequest,
  };
}
