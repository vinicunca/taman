import type { HttpClient, HttpRequestContext } from '@vinicunca/request/http';
import { createHttpClient, refreshTokenInterceptor } from '@vinicunca/request/http';
import { reactive, ref } from 'vue';

export interface DummyUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
}

export type LogKind = 'request' | 'unauthorized' | 'refresh' | 'retry' | 'success' | 'failure' | 'info';

export interface LogEntry {
  at: Date;
  kind: LogKind;
  message: string;
}

export interface AuthSession {
  accessToken?: string;
  refreshToken?: string;
  user?: DummyUser;
}

export interface AuthDemoOptions {
  fetch?: typeof globalThis.fetch;
  baseURL?: string;
}

const LOG_LIMIT = 50;
const REPLACED_TOKEN = 'expired.invalid.token';

interface LoginResponse extends DummyUser {
  accessToken: string;
  refreshToken: string;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Auth + interceptor demo against dummyjson.com: a reactive session, a
 * request interceptor that attaches the bearer token, and
 * `refreshTokenInterceptor` wired to `/auth/refresh`. Kept free of the
 * error-message preset so it stays testable without a toaster — pages add
 * `errorMessageInterceptor` to `demo.client` themselves.
 */
export function createAuthDemo(options: AuthDemoOptions = {}) {
  const session = reactive<AuthSession>({});
  const log = ref<Array<LogEntry>>([]);

  function pushLog(kind: LogKind, message: string): void {
    log.value = [{ at: new Date(), kind, message }, ...log.value].slice(0, LOG_LIMIT);
  }

  const client: HttpClient = createHttpClient({
    baseURL: options.baseURL ?? 'https://dummyjson.com',
    fetch: options.fetch,
  });

  client.addRequestInterceptor((context) => {
    const { accessToken } = session;
    if (accessToken) {
      context.options.headers.set('authorization', `Bearer ${accessToken}`);
      pushLog('request', `request ${context.options.method} ${context.url} (token …${accessToken.slice(-6)})`);
    }
  });

  // Installed before the refresh preset so a 401 is always recorded, even
  // when the retry that follows succeeds.
  client.addResponseInterceptor({
    rejected(error) {
      if (error.status === 401) {
        pushLog('unauthorized', `${error.request.method} ${error.request.url} → 401`);
      }
      throw error;
    },
  });

  client.addResponseInterceptor(refreshTokenInterceptor({
    client,
    refresh: async () => {
      // `skipAuthRefresh` keeps this call's own 401 (an invalid refresh
      // token) from re-entering this same refresh flow.
      const response = await client.post<RefreshResponse>('/auth/refresh', {
        refreshToken: session.refreshToken,
        expiresInMins: 1,
      }, { skipAuthRefresh: true });
      session.accessToken = response.accessToken;
      session.refreshToken = response.refreshToken;
      pushLog('refresh', 'refreshed access + refresh tokens');
      return response.accessToken;
    },
    applyToken: (context: HttpRequestContext, token: string) => {
      context.options.headers.set('authorization', `Bearer ${token}`);
      pushLog('retry', `retrying ${context.options.method} ${context.url}`);
    },
    onAuthFailure: () => {
      session.accessToken = undefined;
      session.refreshToken = undefined;
      session.user = undefined;
      pushLog('failure', 'refresh failed — session cleared');
    },
  }));

  async function login(username = 'emilys', password = 'emilyspass'): Promise<void> {
    const response = await client.post<LoginResponse>('/auth/login', {
      username,
      password,
      expiresInMins: 1,
    }, { skipAuthRefresh: true });

    session.accessToken = response.accessToken;
    session.refreshToken = response.refreshToken;
    session.user = {
      id: response.id,
      username: response.username,
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
      gender: response.gender,
      image: response.image,
    };
    pushLog('success', `logged in as ${response.username}`);
  }

  function logout(): void {
    session.accessToken = undefined;
    session.refreshToken = undefined;
    session.user = undefined;
    pushLog('info', 'logged out');
  }

  async function fetchMe(): Promise<void> {
    const user = await client.get<DummyUser>('/auth/me');
    session.user = user;
    pushLog('success', `fetched /auth/me as ${user.username}`);
  }

  function expireAccessToken(): void {
    session.accessToken = REPLACED_TOKEN;
    pushLog('info', 'access token replaced with an invalid value');
  }

  function breakRefreshToken(): void {
    session.refreshToken = REPLACED_TOKEN;
    pushLog('info', 'refresh token replaced with an invalid value');
  }

  return { client, session, log, login, logout, fetchMe, expireAccessToken, breakRefreshToken };
}
