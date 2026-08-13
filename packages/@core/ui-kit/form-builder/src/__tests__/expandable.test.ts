import { describe, expect, it } from 'vitest';

import { computeKeepItemIndex, computeRowMapping } from '../expandable';

describe('computeRowMapping', () => {
  it('assigns items to rows by cumulative row heights', () => {
    // two rows of 40px; items at y 0,0,0 (row 1) and 45,45 (row 2)
    const mapping = computeRowMapping([40, 40], [0, 0, 0, 45, 45], 2);
    expect(mapping).toEqual({ 1: 3, 2: 2 });
  });

  it('ignores items beyond collapsedRows', () => {
    const mapping = computeRowMapping([40, 40, 40], [0, 45, 85], 1);
    expect(mapping).toEqual({ 1: 1 });
  });

  it('returns empty mapping for no items', () => {
    expect(computeRowMapping([40], [], 1)).toEqual({});
  });
});

describe('computeKeepItemIndex', () => {
  it('keeps items of rows 1..collapsedRows minus the action cell', () => {
    expect(computeKeepItemIndex({ 1: 3, 2: 2 }, 1)).toBe(2); // 3 - 1
    expect(computeKeepItemIndex({ 1: 3, 2: 2 }, 2)).toBe(4); // 5 - 1
  });

  it('falls back to 1 when the math collapses to zero', () => {
    expect(computeKeepItemIndex({}, 1)).toBe(1);
    expect(computeKeepItemIndex({ 1: 1 }, 1)).toBe(1); // 1-1=0 -> fallback 1
  });
});
