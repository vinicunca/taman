import { describe, expect, it } from 'vitest';
import { removeFiles } from '../remove';

describe('removeFiles', () => {
  it('drops matching paths and keeps the rest', () => {
    const files = new Map([
      ['internal/tsconfig/package.json', '{}'],
      ['apps/web/package.json', '{}'],
      ['CLAUDE.md', '# x'],
    ]);

    const result = removeFiles(files, ['internal/**', 'CLAUDE.md']);

    expect([...result.keys()]).toEqual(['apps/web/package.json']);
    expect(files.size).toBe(3);
  });
});
