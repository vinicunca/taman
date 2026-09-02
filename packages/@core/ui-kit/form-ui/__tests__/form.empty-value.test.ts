import { describe, expect, it } from 'vitest';

import { isEmptyFormValue, toFormFieldValue } from '../src/form.empty-value';

function makeFile(name: string) {
  return new File(['content'], name, { type: 'image/png' });
}

describe('isEmptyFormValue', () => {
  it('treats a selected File as present', () => {
    const file = makeFile('photo.png');

    expect(isEmptyFormValue(file)).toBe(false);
  });

  it('treats a non-empty File list as present', () => {
    expect(isEmptyFormValue([makeFile('a.png')])).toBe(false);
  });

  it('treats missing values as empty', () => {
    expect(isEmptyFormValue(undefined)).toBe(true);
    expect(isEmptyFormValue(null)).toBe(true);
    expect(isEmptyFormValue('')).toBe(true);
    expect(isEmptyFormValue([])).toBe(true);
  });

  it('marks File values so Vue will not wrap them in a reactive proxy', () => {
    const file = makeFile('photo.png');
    const stored = toFormFieldValue(file) as File;

    expect(stored).toBe(file);
    expect(URL.createObjectURL(stored)).toMatch(/^blob:/);
  });
});
