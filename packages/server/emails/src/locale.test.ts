// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { matchEmailLocale } from './locale.ts';

describe('matchEmailLocale', () => {
  it.each([
    [undefined, 'en-US'],
    [null, 'en-US'],
    ['', 'en-US'],
    ['*', 'en-US'],
    ['id-ID,id;q=0.9,en-US;q=0.8', 'id-ID'],
    ['id', 'id-ID'],
    ['ID-id', 'id-ID'],
    ['en-GB,en;q=0.9', 'en-US'],
    ['fr-FR,fr;q=0.9', 'en-US'],
    ['fr;q=1, id;q=0.5', 'id-ID'],
    ['en;q=0.4, id-ID;q=0.8', 'id-ID'],
    ['id;q=0, en', 'en-US'],
    // Language-only match for a regional tag, before lower-ranked tags.
    ['en-GB, id;q=0.5', 'en-US'],
    ['id-XX, en;q=0.5', 'id-ID'],
  ])('%s → %s', (header, expected) => {
    expect(matchEmailLocale(header)).toBe(expected);
  });
});
