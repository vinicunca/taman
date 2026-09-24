import { ORPCError } from '@vinicunca/taman-request/orpc';
import { describe, expect, it, vi } from 'vitest';
import { getErrors } from './errors';

vi.mock('@taman/locales', () => ({ $t: (key: string) => key }));

describe('getErrors with oRPC errors', () => {
  it('shows the organization message for ORG_REQUIRED', () => {
    const error = new ORPCError('FORBIDDEN', { message: 'Organization required', data: { code: 'ORG_REQUIRED' } });
    expect(getErrors(error)).toBe('Organization required');
  });

  it('shows the first validation issue for BAD_REQUEST', () => {
    const error = new ORPCError('BAD_REQUEST', {
      message: 'Input validation failed',
      data: { issues: [{ path: ['title'], message: 'Title is required.' }] },
    });
    expect(getErrors(error)).toBe('Title is required.');
  });

  it('maps well-known codes to localized fallbacks', () => {
    expect(getErrors(new ORPCError('UNAUTHORIZED'))).toBe('ui.fallback.http.unauthorized');
    expect(getErrors(new ORPCError('NOT_FOUND'))).toBe('ui.fallback.http.notFound');
  });

  it('falls back to the server message for other codes', () => {
    expect(getErrors(new ORPCError('SERVICE_UNAVAILABLE', { message: 'Unable to reach the database. Is it running?' })))
      .toBe('Unable to reach the database. Is it running?');
  });

  it('still maps network TypeErrors', () => {
    expect(getErrors(new TypeError('Failed to fetch'))).toBe('ui.fallback.http.networkError');
  });
});
