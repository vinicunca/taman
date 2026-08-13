import { describe, expect, it } from 'vitest';

import { AuthError, unwrapAuthResult } from './auth.result';

describe('unwrapAuthResult', () => {
  it('resolves with data on success', async () => {
    const result = unwrapAuthResult(
      Promise.resolve({ data: { id: '1' }, error: null }),
    );

    await expect(result).resolves.toEqual({ id: '1' });
  });

  it('throws an AuthError with the i18n status message on failure, even when better-auth provides its own message', async () => {
    const result = unwrapAuthResult(
      Promise.resolve({
        data: null,
        error: { message: 'not allowed', status: 403, statusText: 'Forbidden' },
      }),
    );

    await expect(result).rejects.toThrow('ui.fallback.http.forbidden');
  });

  it('carries status and statusText as real properties on the thrown AuthError', async () => {
    const caught = await unwrapAuthResult(
      Promise.resolve({
        data: null,
        error: { message: 'not allowed', status: 403, statusText: 'Forbidden' },
      }),
    ).catch((error_: unknown) => error_);

    expect(caught).toBeInstanceOf(AuthError);
    expect((caught as AuthError).status).toBe(403);
    expect((caught as AuthError).statusText).toBe('Forbidden');
  });

  it('falls back to the i18n status message when the error has no message', async () => {
    const result = unwrapAuthResult(
      Promise.resolve({
        data: null,
        error: { status: 500, statusText: 'Internal Server Error' },
      }),
    );

    await expect(result).rejects.toThrow('ui.fallback.http.internalServerError');
  });

  it('preserves the original error via cause', async () => {
    const error = { message: 'nope', status: 400, statusText: 'Bad Request' };

    const caught = await unwrapAuthResult(
      Promise.resolve({ data: null, error }),
    ).catch((error_: unknown) => error_);

    expect(caught).toBeInstanceOf(Error);
    expect((caught as Error).cause).toBe(error);
  });
});
