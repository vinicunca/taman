import { describe, expect, it } from 'vitest';
import { createCorsOptions } from './cors';

describe('createCorsOptions', () => {
  it('does not use wildcard exposed headers with credentialed requests', () => {
    const options = createCorsOptions(['http://localhost:5556']);

    expect(options.credentials).toBe(true);
    expect(options.exposeHeaders).toEqual([]);
  });
});
