import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { formatNow } from '../date';

describe('formatNow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 5, 9, 3, 7));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should format the current local time', () => {
    expect(formatNow('YYYY-MM-DD HH:mm:ss')).toBe('2026-01-05 09:03:07');
  });

  it('should keep non-token characters', () => {
    expect(formatNow('YYYY-MM-DD ')).toBe('2026-01-05 ');
  });
});
