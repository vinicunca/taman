import { describe, expect, it } from 'vitest';

import { matchesAnyRole } from './matches-any-role';

describe('matchesAnyRole', () => {
  it('returns true when at least one required item is available', () => {
    expect(matchesAnyRole(['admin', 'editor'], ['editor'])).toBe(true);
  });

  it('returns false when no required item is available', () => {
    expect(matchesAnyRole(['admin'], ['editor', 'viewer'])).toBe(false);
  });

  it('returns false when required is empty', () => {
    expect(matchesAnyRole(['admin'], [])).toBe(false);
  });

  it('returns false when available is empty', () => {
    expect(matchesAnyRole([], ['admin'])).toBe(false);
  });
});
