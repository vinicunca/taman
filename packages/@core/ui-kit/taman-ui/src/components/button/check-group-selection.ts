import type {
  TamanButtonCheckGroupModel,
  TamanButtonCheckGroupValue,
} from './taman-button-check-group.types';

interface ToggleOptions {
  allowClear: boolean;
  maxCount: number;
  multiple: boolean;
}

export function toCheckGroupSelection(
  value: TamanButtonCheckGroupModel,
  multiple: boolean,
): Array<TamanButtonCheckGroupValue> {
  if (!Array.isArray(value)) {
    return value === undefined ? [] : [value];
  }

  const selection = value.filter((item) => item !== undefined);

  return multiple ? selection : selection.slice(0, 1);
}

export function fromCheckGroupSelection(
  selection: Array<TamanButtonCheckGroupValue>,
  multiple: boolean,
): TamanButtonCheckGroupModel {
  return multiple ? [...selection] : selection[0];
}

export function toggleCheckGroupSelection(
  selection: Array<TamanButtonCheckGroupValue>,
  value: TamanButtonCheckGroupValue,
  { allowClear, maxCount, multiple }: ToggleOptions,
): Array<TamanButtonCheckGroupValue> {
  const isChecked = selection.includes(value);

  if (!multiple) {
    return isChecked && allowClear ? [] : [value];
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
