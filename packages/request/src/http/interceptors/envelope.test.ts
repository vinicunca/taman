// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { createHttpClient } from '../client';
import { isHttpError } from '../errors';
import { createFakeFetch } from '../testing';
import { envelopeInterceptor } from './envelope';

function setup(options?: Parameters<typeof envelopeInterceptor>[0]) {
  const fake = createFakeFetch({
    '/ok': () => Response.json({ code: 0, data: { id: 1 }, message: 'ok' }),
    '/bad': () => Response.json({ code: 7, message: 'Nope' }),
    '/custom': () => Response.json({ status: 'success', result: { id: 2 } }),
    '/empty': () => new Response(null, { status: 204 }),
  });
  const http = createHttpClient({ baseURL: 'http://api.test', fetch: fake.fetch, retry: false });
  http.addResponseInterceptor(envelopeInterceptor(options));
  return http;
}

describe('envelopeInterceptor', () => {
  it('unwraps data for responseReturn: data', async () => {
    await expect(setup().get('/ok', { responseReturn: 'data' })).resolves.toEqual({ id: 1 });
  });

  it('leaves body and raw requests untouched', async () => {
    const http = setup();
    await expect(http.get('/ok')).resolves.toEqual({ code: 0, data: { id: 1 }, message: 'ok' });
    await expect(http.get('/bad')).resolves.toEqual({ code: 7, message: 'Nope' });
  });

  it('throws an envelope HttpError when the code is not the success code', async () => {
    const error = await setup().get('/bad', { responseReturn: 'data' }).catch((error_: unknown) => error_);
    expect(isHttpError(error)).toBe(true);
    expect(error).toMatchObject({ kind: 'envelope', status: 200, code: 7, message: 'Nope' });
  });

  it('accepts a function dataField and successCode', async () => {
    const http = setup({
      codeField: 'status',
      successCode: (code) => code === 'success',
      dataField: (body) => body.result,
    });
    await expect(http.get('/custom', { responseReturn: 'data' })).resolves.toEqual({ id: 2 });
  });

  it('resolves an empty (204) body to undefined instead of failing the code check', async () => {
    await expect(setup().get('/empty', { responseReturn: 'data' })).resolves.toBeUndefined();
  });
});
