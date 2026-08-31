/**
 * This file can be adjusted according to business logic
 */
import type { AxiosResponseHeaders, RequestClientOptions } from '@vben/request';

import { useAppTamanConfig } from '@taman/composables';
import { preferences } from '@taman/preferences';
import { useAccessStore } from '@taman/stores';
import { clone } from '@taman/utils';
import {
  authenticateResponseInterceptor,
  defaultResponseInterceptor,
  errorMessageResponseInterceptor,
  RequestClient,
} from '@vben/request';
import JSONBigInt from 'json-bigint';

import { useSessionStore } from '#/auth';

const { apiUrl } = useAppTamanConfig(import.meta.env, import.meta.env.PROD);

function createRequestClient(baseURL: string, options?: RequestClientOptions) {
  const client = new RequestClient({
    ...options,
    baseURL,
    transformResponse: (data: any, header: AxiosResponseHeaders) => {
      // storeAsString stores BigInt as string; false uses the native BigInt type
      if (
        header.getContentType()?.toString().includes('application/json')
        && typeof data === 'string'
      ) {
        return clone(
          JSONBigInt({ storeAsString: true, strict: true }).parse(data),
        );
      }
      return data;
    },
  });

  /**
   * Re-authentication logic. Better Auth is cookie-based, so an unauthorized
   * response means the session is gone/expired: surface the expired modal or
   * sign the user out.
   */
  async function doReAuthenticate() {
    console.warn('Session is invalid or expired.');
    const accessStore = useAccessStore();
    const sessionStore = useSessionStore();
    if (
      preferences.app.loginExpiredMode === 'modal'
      && accessStore.isAccessChecked
    ) {
      accessStore.setLoginExpired(true);
    } else {
      await sessionStore.logout();
    }
  }

  /**
   * Cookie-based sessions have no client-side refresh token; this is a no-op
   * kept to satisfy the interceptor contract (never invoked while
   * `enableRefreshToken` is false).
   */
  async function doRefreshToken() {
    return '';
  }

  function formatToken(token: null | string) {
    return token ? `Bearer ${token}` : null;
  }

  // Request header handling: send the session cookie with every request.
  client.addRequestInterceptor({
    fulfilled: async (config) => {
      config.withCredentials = true;
      config.headers['Accept-Language'] = preferences.app.locale;
      return config;
    },
  });

  // Normalize response data format
  client.addResponseInterceptor(
    defaultResponseInterceptor({
      codeField: 'code',
      dataField: 'data',
      successCode: 0,
    }),
  );

  // Expired session handling. Refresh is disabled for cookie-based Better Auth:
  // a 401 goes straight to re-authentication.
  client.addResponseInterceptor(
    authenticateResponseInterceptor({
      client,
      doReAuthenticate,
      doRefreshToken,
      enableRefreshToken: false,
      formatToken,
    }),
  );

  // Generic error handling; used when the interceptors above do not handle the error
  client.addResponseInterceptor(
    errorMessageResponseInterceptor((msg: string, error) => {
      // Customize per business: use error payload and codes instead of showing msg directly
      // Mock APIs return errors in `error` or `message`
      const responseData = error?.response?.data ?? {};
      const errorMessage = responseData?.error ?? responseData?.message ?? '';
      // Falls back to status-code message when no error text is present
      // message.error(errorMessage || msg);
    }),
  );

  return client;
}

export const requestClient = createRequestClient(apiUrl, {
  responseReturn: 'data',
});

export const baseRequestClient = new RequestClient({ baseURL: apiUrl });

export interface PageFetchParams {
  [key: string]: any;
  pageNo?: number;
  pageSize?: number;
}
