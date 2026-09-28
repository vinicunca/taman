import { markRaw } from 'vue';

/**
 * perkakas `isEmpty` treats a File as empty because `Object.keys(file)` is [].
 * Form required/selectRequired rules must not use that for upload values.
 */
export function isEmptyFormValue(value: unknown): boolean {
  if (value instanceof File || value instanceof Blob) {
    return false;
  }

  if (value == null || value === '') {
    return true;
  }

  if (Array.isArray(value)) {
    return value.length === 0 || value.every((item) => isEmptyFormValue(item));
  }

  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }

  return false;
}

export function toFormFieldValue(value: unknown): unknown {
  if (value instanceof File || value instanceof Blob) {
    return markRaw(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => toFormFieldValue(item));
  }

  return value;
}
