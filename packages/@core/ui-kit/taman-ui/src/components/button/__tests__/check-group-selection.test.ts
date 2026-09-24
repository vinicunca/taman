import { describe, expect, it } from 'vitest';

import {
  fromCheckGroupSelection,
  toCheckGroupSelection,
  toggleCheckGroupSelection,
} from '../check-group-selection';

describe('toCheckGroupSelection', () => {
  it('is empty when there is no value', () => {
    expect(toCheckGroupSelection(undefined, false)).toEqual([]);
    expect(toCheckGroupSelection([], true)).toEqual([]);
  });

  it('wraps a single value', () => {
    expect(toCheckGroupSelection('a', false)).toEqual(['a']);
  });

  it('keeps falsy values that are not undefined', () => {
    expect(toCheckGroupSelection(false, false)).toEqual([false]);
    expect(toCheckGroupSelection(0, false)).toEqual([0]);
  });

  it('keeps every array item in multiple mode', () => {
    expect(toCheckGroupSelection(['a', undefined as never, 'b'], true)).toEqual(['a', 'b']);
  });

  it('keeps only the first array item in single mode', () => {
    expect(toCheckGroupSelection(['a', 'b'], false)).toEqual(['a']);
  });
});

describe('fromCheckGroupSelection', () => {
  it('returns an array in multiple mode', () => {
    expect(fromCheckGroupSelection(['a', 'b'], true)).toEqual(['a', 'b']);
    expect(fromCheckGroupSelection([], true)).toEqual([]);
  });

  it('returns the first value in single mode', () => {
    expect(fromCheckGroupSelection(['a'], false)).toBe('a');
  });

  it('returns undefined for an empty single selection', () => {
    expect(fromCheckGroupSelection([], false)).toBeUndefined();
  });
});

describe('toggleCheckGroupSelection', () => {
  const single = { allowClear: false, maxCount: 0, multiple: false };
  const multiple = { allowClear: false, maxCount: 0, multiple: true };

  it('replaces the selection in single mode', () => {
    expect(toggleCheckGroupSelection(['a'], 'b', single)).toEqual(['b']);
  });

  it('keeps the value selected when clicked again in single mode', () => {
    expect(toggleCheckGroupSelection(['a'], 'a', single)).toEqual(['a']);
  });

  it('clears the value when clicked again with allowClear', () => {
    expect(
      toggleCheckGroupSelection(['a'], 'a', { ...single, allowClear: true }),
    ).toEqual([]);
  });

  it('adds and removes values in multiple mode', () => {
    expect(toggleCheckGroupSelection(['a'], 'b', multiple)).toEqual(['a', 'b']);
    expect(toggleCheckGroupSelection(['a', 'b'], 'a', multiple)).toEqual(['b']);
  });

  it('replaces the last pick once maxCount is reached', () => {
    expect(
      toggleCheckGroupSelection(['a', 'b'], 'c', { ...multiple, maxCount: 2 }),
    ).toEqual(['a', 'c']);
  });

  it('still allows removing a value at maxCount', () => {
    expect(
      toggleCheckGroupSelection(['a', 'b'], 'b', { ...multiple, maxCount: 2 }),
    ).toEqual(['a']);
  });

  it('does not mutate the current selection', () => {
    const current = ['a'];
    toggleCheckGroupSelection(current, 'b', multiple);

    expect(current).toEqual(['a']);
  });
});
