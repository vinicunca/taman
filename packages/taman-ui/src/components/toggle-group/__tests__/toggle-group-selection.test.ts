import { describe, expect, it } from 'vitest';

import { toggleGroupSelection, toToggleGroupSelection } from '../toggle-group-selection';

describe('toToggleGroupSelection', () => {
  it('is empty when there is no value', () => {
    expect(toToggleGroupSelection({ value: undefined, multiple: false })).toEqual([]);
    expect(toToggleGroupSelection({ value: [], multiple: true })).toEqual([]);
  });

  it('wraps a single value', () => {
    expect(toToggleGroupSelection({ value: 'a', multiple: false })).toEqual(['a']);
  });

  it('keeps falsy values that are not undefined', () => {
    expect(toToggleGroupSelection({ value: false, multiple: false })).toEqual([false]);
    expect(toToggleGroupSelection({ value: 0, multiple: false })).toEqual([0]);
  });

  it('keeps every array item in multiple mode', () => {
    expect(toToggleGroupSelection({
      value: ['a', undefined as never, 'b'],
      multiple: true,
    })).toEqual(['a', 'b']);
  });

  it('keeps only the first array item in single mode', () => {
    expect(toToggleGroupSelection({
      value: ['a', 'b'],
      multiple: false,
    })).toEqual(['a']);
  });
});

describe('toggleGroupSelection', () => {
  it('replaces the selection in single mode', () => {
    expect(toggleGroupSelection({
      selection: ['a'],
      value: 'b',
      allowClear: false,
      maxCount: 0,
      multiple: false,
    })).toEqual(['b']);
  });

  it('keeps the value selected when clicked again in single mode', () => {
    expect(toggleGroupSelection({
      selection: ['a'],
      value: 'a',
      allowClear: false,
      maxCount: 0,
      multiple: false,
    })).toEqual(['a']);
  });

  it('clears the value when clicked again with allowClear', () => {
    expect(
      toggleGroupSelection({
        selection: ['a'],
        value: 'a',
        allowClear: true,
        maxCount: 0,
        multiple: false,
      }),
    ).toEqual([]);
  });

  it('adds and removes values in multiple mode', () => {
    expect(toggleGroupSelection({
      selection: ['a'],
      value: 'b',
      allowClear: false,
      maxCount: 0,
      multiple: true,
    })).toEqual(['a', 'b']);
    expect(toggleGroupSelection({
      selection: ['a', 'b'],
      value: 'a',
      allowClear: false,
      maxCount: 0,
      multiple: true,
    })).toEqual(['b']);
  });

  it('replaces the last pick once maxCount is reached', () => {
    expect(
      toggleGroupSelection({
        selection: ['a', 'b'],
        value: 'c',
        allowClear: false,
        maxCount: 2,
        multiple: true,
      }),
    ).toEqual(['a', 'c']);
  });

  it('still allows removing a value at maxCount', () => {
    expect(
      toggleGroupSelection({
        selection: ['a', 'b'],
        value: 'b',
        allowClear: false,
        maxCount: 2,
        multiple: true,
      }),
    ).toEqual(['a']);
  });

  it('does not mutate the current selection', () => {
    const current = ['a'];
    toggleGroupSelection({
      selection: current,
      value: 'b',
      allowClear: false,
      maxCount: 0,
      multiple: true,
    });

    expect(current).toEqual(['a']);
  });
});
