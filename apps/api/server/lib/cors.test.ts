import type { H3Event } from 'nitro';
import { handleCors } from 'nitro/h3';
import { describe, expect, it } from 'vitest';
import { createCorsOptions } from './cors';

describe('createCorsOptions', () => {
  it('does not use wildcard exposed headers with credentialed requests', () => {
    const options = createCorsOptions(['http://localhost:5556']);

    expect(options.credentials).toBe(true);
    expect(options.exposeHeaders).toEqual([]);
  });

  it('allows Last-Event-ID (case-insensitively) so the oRPC client can resume a dropped realtime stream', () => {
    const options = createCorsOptions(['http://localhost:5556']);

    expect(options.allowHeaders.map((header) => header.toLowerCase())).toContain('last-event-id');
  });
});

/**
 * Minimal preflight event: h3's `handleCors` only reads `req.method`,
 * `req.headers`, and writes onto `res.headers`/`res.errHeaders`.
 */
function makePreflightEvent(requestHeaders: string): H3Event {
  return {
    req: {
      method: 'OPTIONS',
      headers: new Headers({
        'access-control-request-headers': requestHeaders,
        'access-control-request-method': 'GET',
        'origin': 'http://localhost:5556',
      }),
    },
    res: {
      errHeaders: new Headers(),
      headers: new Headers(),
    },
  } as any;
}

describe('handleCors preflight', () => {
  it('answers a preflight that asks for content-type and last-event-id with both allowed', () => {
    const event = makePreflightEvent('content-type,last-event-id');

    const response = handleCors(event, createCorsOptions(['http://localhost:5556']));

    expect(response).not.toBe(false);
    const allowHeaders = (event.res.headers as Headers).get('access-control-allow-headers');
    expect(allowHeaders?.toLowerCase()).toContain('last-event-id');
    expect(allowHeaders?.toLowerCase()).toContain('content-type');
  });
});
