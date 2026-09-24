import { afterEach, describe, expect, it, vi } from 'vitest';

import { createFetchClient } from './create-client';
import { ApiError } from './errors';

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
    status: 200,
    ...init,
  });
}

function stubFetch(...responses: Array<Response | Error>) {
  const mock = vi.fn();
  for (const r of responses) {
    if (r instanceof Error) {
      mock.mockRejectedValueOnce(r);
    } else {
      mock.mockResolvedValueOnce(r);
    }
  }
  vi.stubGlobal('fetch', mock);
  return mock;
}

const BASE_URL = 'https://api.test';

function createClient() {
  // retry: 0 keeps failure tests deterministic (ofetch retries GETs once by default)
  return createFetchClient({ baseURL: BASE_URL, retry: 0 });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('createFetchClient', () => {
  it('defaults to GET and unwraps the envelope into data as T', async () => {
    const fetchMock = stubFetch(
      jsonResponse({ code: 0, data: { id: 1, name: 'Nyoman' }, message: 'ok' }),
    );
    const api = createClient();

    const user = await api.request<{ id: number; name: string }>('/users/1');

    expect(user).toEqual({ id: 1, name: 'Nyoman' });
    const requestedUrl = fetchMock.mock.calls[0]?.[0];
    expect(String(requestedUrl)).toBe(`${BASE_URL}/users/1`);
    // Method omitted → no explicit method on the wire, which fetch treats as GET
    expect((fetchMock.mock.calls[0]?.[1] as RequestInit).method).toBeUndefined();
  });

  it('serializes query params', async () => {
    const fetchMock = stubFetch(
      jsonResponse({ code: 0, data: [], message: 'ok' }),
    );
    const api = createClient();

    await api.request('/users', { query: { page: 2, q: 'asep' } });

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      `${BASE_URL}/users?page=2&q=asep`,
    );
  });

  it('sends a JSON body for an explicit POST and unwraps', async () => {
    const fetchMock = stubFetch(
      jsonResponse({ code: 0, data: { id: 2 }, message: 'ok' }),
    );
    const api = createClient();

    const created = await api.request<{ id: number }>('/users', {
      body: { name: 'Euis' },
      method: 'POST',
    });

    expect(created).toEqual({ id: 2 });
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(init.method).toBe('POST');
    expect(init.body).toBe(JSON.stringify({ name: 'Euis' }));
  });

  it('throws ApiError with the business code when code !== successCode', async () => {
    stubFetch(jsonResponse({ code: 4001, data: null, message: 'token expired' }));
    const api = createClient();

    const error = await api.request('/me').catch((error_: unknown) => error_);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).code).toBe(4001);
    expect((error as ApiError).message).toBe('token expired');
    expect((error as ApiError).status).toBe(200);
  });

  it('normalizes a 204 empty-body response to ApiError', async () => {
    stubFetch(new Response(null, { status: 204 }));
    const api = createClient();

    const error = await api
      .request('/no-content')
      .catch((error_: unknown) => error_);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(204);
    expect((error as ApiError).message).toBe('Request failed');
    expect((error as ApiError).code).toBeUndefined();
  });

  it('reports the real 2xx status on a business failure envelope', async () => {
    stubFetch(
      jsonResponse(
        { code: 4100, data: null, message: 'not allowed' },
        { status: 201 },
      ),
    );
    const api = createClient();

    const error = await api
      .request('/created')
      .catch((error_: unknown) => error_);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(201);
    expect((error as ApiError).code).toBe(4100);
    expect((error as ApiError).message).toBe('not allowed');
  });

  it('respects a custom successCode', async () => {
    stubFetch(jsonResponse({ code: 200, data: 'yes', message: 'ok' }));
    const api = createFetchClient({ baseURL: BASE_URL, retry: 0, successCode: 200 });

    await expect(api.request<string>('/ping')).resolves.toBe('yes');
  });

  it('normalizes HTTP errors to ApiError', async () => {
    stubFetch(
      jsonResponse(
        { code: 5000, data: null, message: 'server exploded' },
        { status: 500 },
      ),
    );
    const api = createClient();

    const error = await api.request('/boom').catch((error_: unknown) => error_);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(500);
    expect((error as ApiError).code).toBe(5000);
    expect((error as ApiError).message).toBe('server exploded');
  });

  it('normalizes network failures to ApiError', async () => {
    stubFetch(new TypeError('fetch failed'));
    const api = createClient();

    const error = await api
      .request('/offline')
      .catch((error_: unknown) => error_);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBeUndefined();
    expect((error as ApiError).code).toBeUndefined();
  });

  it('supports any explicit method and body, still unwraps', async () => {
    const fetchMock = stubFetch(
      jsonResponse({ code: 0, data: { renamed: true }, message: 'ok' }),
    );
    const api = createClient();

    const result = await api.request<{ renamed: boolean }>('/users/1', {
      body: { name: 'Ujang' },
      method: 'PUT',
    });

    expect(result).toEqual({ renamed: true });
    expect((fetchMock.mock.calls[0]?.[1] as RequestInit).method).toBe('PUT');
  });

  it('an explicit DELETE unwraps too', async () => {
    const fetchMock = stubFetch(
      jsonResponse({ code: 0, data: null, message: 'ok' }),
    );
    const api = createClient();

    await api.request('/users/1', { method: 'DELETE' });

    expect((fetchMock.mock.calls[0]?.[1] as RequestInit).method).toBe('DELETE');
  });

  it('fetch bypasses envelope handling', async () => {
    stubFetch(jsonResponse({ anything: 'raw' }));
    const api = createClient();

    const raw = await api.native<{ anything: string }>('/third-party');

    expect(raw).toEqual({ anything: 'raw' });
  });

  it('runs user-provided onRequest hooks (auth-header extension point)', async () => {
    const fetchMock = stubFetch(
      jsonResponse({ code: 0, data: null, message: 'ok' }),
    );
    const api = createFetchClient({
      baseURL: BASE_URL,
      onRequest({ options }) {
        options.headers.set('Authorization', 'Bearer token-123');
      },
      retry: 0,
    });

    await api.request('/me');

    const headers = (fetchMock.mock.calls[0]?.[1] as RequestInit)
      .headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer token-123');
  });
});
