import type { FieldConfig, FormValues } from './types';

import { clone } from '@taman-core/shared/utils';

import { deletePath, getPath, setPath } from './paths';

export function applyTransformsIn(
  fields: ReadonlyArray<FieldConfig>,
  incoming: FormValues,
): FormValues {
  const result = clone(incoming);
  for (const field of fields) {
    if (!field.name || !field.transform?.in) {
      continue;
    }
    const apiValue = getPath(incoming, field.name);
    setPath(result, field.name, field.transform.in(apiValue, incoming));
  }
  return result;
}

export interface TransformsOutOptions {
  isIfFalse?: (name: string) => boolean;
}

export function applyTransformsOut(
  fields: ReadonlyArray<FieldConfig>,
  formValues: FormValues,
  opts: TransformsOutOptions = {},
): FormValues {
  const result = clone(formValues);
  const loopOwnedPaths = new Set<string>();
  for (const field of fields) {
    if (!field.name) {
      continue;
    }
    if (
      (opts.isIfFalse?.(field.name) && !field.keepValueOnHide)
      || field.transform?.out
    ) {
      loopOwnedPaths.add(field.name);
    }
  }
  for (const field of fields) {
    if (!field.name) {
      continue;
    }
    if (opts.isIfFalse?.(field.name) && !field.keepValueOnHide) {
      deletePath(result, field.name);
      continue;
    }
    if (!field.transform?.out) {
      continue;
    }
    const setExtra = (path: string, value: unknown) => {
      if (loopOwnedPaths.has(path) && path !== field.name) {
        throw new Error(
          `[form-builder] transform.out setExtra("${path}") collides with field "${path}", which also writes or prunes its own output — remove one of the two writers`,
        );
      }
      setPath(result, path, value);
    };
    const next = field.transform.out(getPath(formValues, field.name), setExtra, formValues);
    if (next === undefined) {
      deletePath(result, field.name);
    } else {
      setPath(result, field.name, next);
    }
  }
  return result;
}
