import { describe, expect, it } from 'vitest';
import { paginationInput, toOffset, toTotalPages } from './pagination';

describe('paginationInput', () => {
  it('defaults page to 1 and pageSize to 20', () => {
    expect(paginationInput.parse({})).toEqual({ page: 1, pageSize: 20 });
  });

  it('rejects page below 1 and pageSize outside 1..100', () => {
    expect(paginationInput.safeParse({ page: 0 }).success).toBe(false);
    expect(paginationInput.safeParse({ pageSize: 0 }).success).toBe(false);
    expect(paginationInput.safeParse({ pageSize: 101 }).success).toBe(false);
    expect(paginationInput.safeParse({ page: 1.5 }).success).toBe(false);
  });
});

describe('toOffset', () => {
  it('converts a 1-based page to a row offset', () => {
    expect(toOffset({ page: 1, pageSize: 20 })).toBe(0);
    expect(toOffset({ page: 3, pageSize: 10 })).toBe(20);
  });
});

describe('toTotalPages', () => {
  it('is 0 for an empty result and rounds partial pages up', () => {
    expect(toTotalPages(0, 20)).toBe(0);
    expect(toTotalPages(20, 20)).toBe(1);
    expect(toTotalPages(21, 20)).toBe(2);
  });
});
