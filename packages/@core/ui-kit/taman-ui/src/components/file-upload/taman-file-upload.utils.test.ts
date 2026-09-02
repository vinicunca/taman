import { describe, expect, it } from 'vitest';

import { toFileList } from './taman-file-upload.utils';

function makeFile(name: string) {
  return new File(['content'], name, { type: 'text/plain' });
}

describe('toFileList', () => {
  it('returns an empty array for nullish values', () => {
    expect(toFileList(null)).toEqual([]);
    expect(toFileList(undefined)).toEqual([]);
  });

  it('wraps a single File when multiple is false', () => {
    const file = makeFile('one.txt');

    expect(toFileList(file)).toEqual([file]);
  });

  it('returns File[] as-is when multiple is true', () => {
    const files = [makeFile('a.txt'), makeFile('b.txt')];

    expect(toFileList(files)).toBe(files);
  });
});
