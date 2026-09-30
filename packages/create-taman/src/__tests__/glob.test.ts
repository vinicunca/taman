import { describe, expect, it } from 'vitest';
import { globToRegExp, matchesAny } from '../glob';

describe('globToRegExp', () => {
  it('matches a single path segment with *', () => {
    expect(globToRegExp('apps/*/examples.json').test('apps/web/examples.json')).toBe(true);
    expect(globToRegExp('apps/*/examples.json').test('apps/web/src/examples.json')).toBe(false);
  });

  it('matches any depth with ** and a leading **/', () => {
    expect(globToRegExp('internal/**').test('internal/tsconfig/package.json')).toBe(true);
    expect(globToRegExp('**/graphify-out/**').test('graphify-out/graph.json')).toBe(true);
    expect(globToRegExp('**/graphify-out/**').test('apps/web/graphify-out/graph.json')).toBe(true);
  });

  it('treats dots and other regex characters literally', () => {
    expect(globToRegExp('CLAUDE.md').test('CLAUDExmd')).toBe(false);
    expect(globToRegExp('.github/**').test('.github/workflows/release.yml')).toBe(true);
  });

  it('never matches a prefix of a longer name', () => {
    expect(globToRegExp('packages/request/**').test('packages/request-extra/package.json')).toBe(false);
  });
});

describe('matchesAny', () => {
  it('is true when any glob matches', () => {
    expect(matchesAny('docs/a.md', ['CLAUDE.md', 'docs/**'])).toBe(true);
    expect(matchesAny('src/a.ts', ['docs/**'])).toBe(false);
  });
});
