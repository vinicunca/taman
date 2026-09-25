import { describe, expect, it } from 'vitest';
import { appendQueryString, serializeQuery } from './query';

function decoded(query: Record<string, unknown>, format?: Parameters<typeof serializeQuery>[1]) {
  return decodeURIComponent(serializeQuery(query, format));
}

describe('serializeQuery', () => {
  it('serializes flat values', () => {
    expect(decoded({ a: 1, b: 'x', t: true, f: false })).toBe('a=1&b=x&t=true&f=false');
  });

  it('nests objects with bracket paths', () => {
    expect(decoded({ user: { name: 'Ana', role: { id: 2 } } })).toBe('user[name]=Ana&user[role][id]=2');
  });

  it('supports every array format', () => {
    expect(decoded({ ids: [1, 2] }, 'repeat')).toBe('ids=1&ids=2');
    expect(decoded({ ids: [1, 2] }, 'brackets')).toBe('ids[]=1&ids[]=2');
    expect(decoded({ ids: [1, 2] }, 'indices')).toBe('ids[0]=1&ids[1]=2');
    expect(decoded({ ids: [1, 2] }, 'comma')).toBe('ids=1,2');
  });

  it('always uses indices for arrays that contain objects', () => {
    expect(decoded({ items: [{ n: 'a' }, { n: 'b' }] }, 'repeat')).toBe('items[0][n]=a&items[1][n]=b');
  });

  it('writes Dates as ISO strings, null as empty and omits undefined and empty arrays', () => {
    expect(decoded({ d: new Date(0), z: null, u: undefined, e: [] })).toBe('d=1970-01-01T00:00:00.000Z&z=');
  });

  it('encodes values the URLSearchParams way', () => {
    expect(serializeQuery({ s: 'a b&c' })).toBe('s=a+b%26c');
  });
});

describe('appendQueryString', () => {
  it('adds ? or & as needed and ignores an empty string', () => {
    expect(appendQueryString('/a', 'x=1')).toBe('/a?x=1');
    expect(appendQueryString('/a?y=2', 'x=1')).toBe('/a?y=2&x=1');
    expect(appendQueryString('/a', '')).toBe('/a');
  });
});
