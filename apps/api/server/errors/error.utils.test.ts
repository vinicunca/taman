import { describe, expect, it } from 'vitest';
import { jsonError } from './error.utils';

/**
 * Minimal event: `applyCorsToResponse` only reads the request's `origin` and
 * the worker env's trusted-origin list.
 */
function makeEvent(origin: null | string) {
  return {
    req: {
      headers: new Headers(origin ? { origin } : {}),
    },
  } as any;
}

const body = {
  error: true,
  status: 400,
  message: 'Validation failed',
  detail: [{ path: 'legalName', message: 'legalName is required.' }],
} as const;

describe('jsonError', () => {
  it('carries CORS headers so a browser can actually read the error', async () => {
    const response = jsonError(makeEvent('http://localhost:5556'), 400, { ...body });

    // Without these the browser blocks the response and surfaces a CORS
    // failure instead of the 400 — the body never reaches the app.
    expect(response.headers.get('access-control-allow-origin')).toBe(
      'http://localhost:5556',
    );
    expect(response.headers.get('access-control-allow-credentials')).toBe('true');
    expect(response.headers.get('vary')).toBe('Origin');
  });

  it('keeps the status, content type, and body intact', async () => {
    const response = jsonError(makeEvent('http://localhost:5556'), 400, { ...body });

    expect(response.status).toBe(400);
    expect(response.headers.get('content-type')).toContain('application/json');
    await expect(response.json()).resolves.toEqual(body);
  });

  it('omits CORS headers for an origin that is not trusted', () => {
    const response = jsonError(makeEvent('https://evil.example'), 400, { ...body });

    expect(response.headers.get('access-control-allow-origin')).toBeNull();
    expect(response.status).toBe(400);
  });

  it('works for a request with no Origin at all (curl, server-to-server)', async () => {
    const response = jsonError(makeEvent(null), 503, {
      error: true,
      status: 503,
      message: 'Unable to reach the database. Is it running?',
    });

    expect(response.headers.get('access-control-allow-origin')).toBeNull();
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({ status: 503 });
  });
});
