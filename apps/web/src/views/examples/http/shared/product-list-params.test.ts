import { describe, expect, it } from 'vitest';
import { parseProductListQuery, toProductListQuery } from './product-list-params';

describe('parseProductListQuery', () => {
  it('reads well-formed values', () => {
    expect(parseProductListQuery({ page: '3', pageSize: '20', search: 'phone' }))
      .toEqual({ page: 3, pageSize: 20, search: 'phone' });
  });

  it('falls back to safe defaults for hand-edited garbage', () => {
    expect(parseProductListQuery({ page: 'abc', pageSize: '5000' }))
      .toEqual({ page: 1, pageSize: 10, search: undefined });
    expect(parseProductListQuery({ page: '-4', pageSize: '0' })).toMatchObject({ page: 1, pageSize: 10 });
    expect(parseProductListQuery({ page: '2.7' })).toMatchObject({ page: 2 });
  });

  it('ignores blank search and takes the first value of repeated keys', () => {
    expect(parseProductListQuery({ search: '   ' }).search).toBeUndefined();
    expect(parseProductListQuery({ page: ['4', '9'] }).page).toBe(4);
  });

  it('caps an over-long hand-edited search at 100 chars', () => {
    const overLong = 'x'.repeat(150);
    expect(parseProductListQuery({ search: overLong }).search).toBe(overLong.slice(0, 100));
    expect(parseProductListQuery({ search: overLong }).search).toHaveLength(100);
  });

  it('treats a page that is not a safe integer (e.g. 1e20) as page 1', () => {
    expect(parseProductListQuery({ page: '1e20' })).toMatchObject({ page: 1 });
    expect(parseProductListQuery({ page: 'Infinity' })).toMatchObject({ page: 1 });
    expect(parseProductListQuery({ page: String(Number.MAX_SAFE_INTEGER + 10) })).toMatchObject({ page: 1 });
  });
});

describe('toProductListQuery', () => {
  it('omits defaults so URLs stay short', () => {
    expect(toProductListQuery({ page: 1, pageSize: 10 })).toEqual({});
    expect(toProductListQuery({ page: 2, pageSize: 20, search: 'a' }))
      .toEqual({ page: '2', pageSize: '20', search: 'a' });
  });
});
