import type {
  TamanToggleGroupModel,
  TamanToggleGroupValue,
} from './taman-toggle-group.types';

/*
 * Akar's toggle group only toggles: it always clears a single selection when
 * the pressed item is clicked again, has no limit, and computes the next value
 * at click time. These helpers add `allowClear` and `maxCount`, and recompute
 * from the current selection after an async `beforeChange`, when akar's
 * proposed value may be stale. They also keep `false` and `0`, which akar
 * drops when it wraps a lone value.
 */

export function toToggleGroupSelection(
  { value, multiple }:
  { value: TamanToggleGroupModel; multiple: boolean },
): Array<TamanToggleGroupValue> {
  if (!Array.isArray(value)) {
    return value === undefined
      ? []
      : [value];
  }

  const selection = value.filter((item) => item !== undefined);

  return multiple
    ? selection
    : selection.slice(0, 1);
}

export function toggleGroupSelection(
  { selection, value, allowClear, maxCount, multiple }:
  {
    selection: Array<TamanToggleGroupValue>;
    value: TamanToggleGroupValue;
    allowClear: boolean;
    maxCount: number;
    multiple: boolean;
  },
): Array<TamanToggleGroupValue> {
  const isChecked = selection.includes(value);

  if (!multiple) {
    return isChecked && allowClear
      ? []
      : [value];
  }

  if (isChecked) {
    return selection.filter((item) => item !== value);
  }

  // At the limit, the newest pick replaces the previous newest one.
  const kept = maxCount > 0 && selection.length >= maxCount
    ? selection.slice(0, maxCount - 1)
    : selection;

  return [...kept, value];
}
