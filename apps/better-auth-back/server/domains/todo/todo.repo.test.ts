// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { escapeLike } from './todo.repo.ts';

describe('escapeLike', () => {
  it('escapes LIKE wildcards and the escape character so search is literal', () => {
    expect(escapeLike('100%')).toBe('100\\%');
    expect(escapeLike('snake_case')).toBe('snake\\_case');
    expect(escapeLike('back\\slash')).toBe('back\\\\slash');
    expect(escapeLike('plain')).toBe('plain');
  });
});
