import { FetchError } from 'ofetch';
import { describe, expect, it } from 'vitest';

import { ApiError } from './errors';

describe('ApiError', () => {
  it('carries code, status, data and message', () => {
    const err = new ApiError({
      code: 4001,
      data: { code: 4001, data: null, message: 'expired' },
      message: 'expired',
      status: 200,
    });
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('ApiError');
    expect(err.code).toBe(4001);
    expect(err.status).toBe(200);
    expect(err.message).toBe('expired');
    expect(err.data).toEqual({ code: 4001, data: null, message: 'expired' });
  });

  it('fromUnknown passes an ApiError through unchanged', () => {
    const original = new ApiError({ message: 'boom' });
    expect(ApiError.fromUnknown(original)).toBe(original);
  });

  it('fromUnknown maps a FetchError with an envelope-shaped body', () => {
    const fetchError = new FetchError('[GET] "/x": 500 Internal Server Error');
    fetchError.statusCode = 500;
    fetchError.data = { code: 9000, message: 'server exploded' };

    const err = ApiError.fromUnknown(fetchError);
    expect(err.status).toBe(500);
    expect(err.code).toBe(9000);
    expect(err.message).toBe('server exploded');
    expect(err.cause).toBe(fetchError);
  });

  it('fromUnknown maps a FetchError without a body (network failure)', () => {
    const fetchError = new FetchError('fetch failed');
    const err = ApiError.fromUnknown(fetchError);
    expect(err.status).toBeUndefined();
    expect(err.code).toBeUndefined();
    expect(err.message).toBe('fetch failed');
  });

  it('fromUnknown wraps arbitrary values', () => {
    const err = ApiError.fromUnknown('kaboom');
    expect(err).toBeInstanceOf(ApiError);
    expect(err.message).toBe('kaboom');
  });
});
