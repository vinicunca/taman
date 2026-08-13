import { describe, expect, it } from 'vitest';

import type { FieldConfig } from '../types';

import { applyTransformsIn, applyTransformsOut } from '../transforms';

const Noop = {} as any;

describe('applyTransformsIn', () => {
  it('maps API values to form values per field', () => {
    const fields: FieldConfig[] = [
      {
        component: Noop,
        name: 'range',
        transform: {
          in: (_apiValue, values) => [values.startDate, values.endDate],
        },
      },
    ];
    const result = applyTransformsIn(fields, {
      startDate: '2026-01-01',
      endDate: '2026-01-31',
    });
    expect(result.range).toEqual(['2026-01-01', '2026-01-31']);
    expect(result.startDate).toBe('2026-01-01'); // untouched keys pass through
  });

  it('returns a new object and leaves input untouched', () => {
    const incoming = { a: 1 };
    const result = applyTransformsIn([], incoming);
    expect(result).toEqual({ a: 1 });
    expect(result).not.toBe(incoming);
  });
});

describe('applyTransformsOut', () => {
  it('runs transform.out; undefined return drops the field; setExtra adds keys', () => {
    const fields: FieldConfig[] = [
      {
        component: Noop,
        name: 'range',
        transform: {
          out: (value: any, setExtra) => {
            setExtra('startDate', value?.[0]);
            setExtra('endDate', value?.[1]);
            return undefined;
          },
        },
      },
    ];
    const result = applyTransformsOut(fields, { range: ['a', 'b'], keep: 1 });
    expect(result).toEqual({ startDate: 'a', endDate: 'b', keep: 1 });
    expect('range' in result).toBe(false);
  });

  it('transforms in place when out returns a value', () => {
    const fields: FieldConfig[] = [
      {
        component: Noop,
        name: 'tags',
        transform: { out: (value: any) => (value ?? []).join(',') },
      },
    ];
    expect(applyTransformsOut(fields, { tags: ['a', 'b'] })).toEqual({ tags: 'a,b' });
  });

  it('prunes if===false fields unless keepValueOnHide', () => {
    const fields: FieldConfig[] = [
      { component: Noop, name: 'gone' },
      { component: Noop, name: 'kept', keepValueOnHide: true },
    ];
    const result = applyTransformsOut(
      fields,
      { gone: 1, kept: 2, other: 3 },
      { isIfFalse: () => true },
    );
    expect(result).toEqual({ kept: 2, other: 3 });
  });

  it('handles nested dot-path fields', () => {
    const fields: FieldConfig[] = [
      {
        component: Noop,
        name: 'user.name',
        transform: { out: (value: any) => String(value).trim() },
      },
    ];
    expect(applyTransformsOut(fields, { user: { name: '  x  ' } })).toEqual({
      user: { name: 'x' },
    });
  });

  it('throws when setExtra collides with a later field that has its own transform.out', () => {
    const fields: FieldConfig[] = [
      {
        component: Noop,
        name: 'a',
        transform: {
          out: (_value: any, setExtra) => {
            setExtra('b', 'from-a');
            return undefined;
          },
        },
      },
      {
        component: Noop,
        name: 'b',
        transform: { out: (value: any) => value },
      },
    ];
    expect(() => applyTransformsOut(fields, { a: 1, b: 2 })).toThrow(/collides/);
  });

  it('throws when setExtra collides with an earlier field that has its own transform.out', () => {
    const fields: FieldConfig[] = [
      {
        component: Noop,
        name: 'b',
        transform: { out: (value: any) => value },
      },
      {
        component: Noop,
        name: 'a',
        transform: {
          out: (_value: any, setExtra) => {
            setExtra('b', 'from-a');
            return undefined;
          },
        },
      },
    ];
    expect(() => applyTransformsOut(fields, { a: 1, b: 2 })).toThrow(/collides/);
  });

  it('throws when setExtra collides with an if-pruned field', () => {
    const fields: FieldConfig[] = [
      {
        component: Noop,
        name: 'a',
        transform: {
          out: (_value: any, setExtra) => {
            setExtra('gone', 'from-a');
            return undefined;
          },
        },
      },
      { component: Noop, name: 'gone' },
    ];
    expect(() =>
      applyTransformsOut(fields, { a: 1, gone: 2 }, { isIfFalse: name => name === 'gone' }),
    ).toThrow(/collides/);
  });

  it('allows setExtra to overwrite a plain declared field deterministically', () => {
    const fields: FieldConfig[] = [
      {
        component: Noop,
        name: 'a',
        transform: {
          out: (_value: any, setExtra) => {
            setExtra('plain', 'from-a');
            return undefined;
          },
        },
      },
      { component: Noop, name: 'plain' },
    ];
    const result = applyTransformsOut(fields, { a: 1, plain: 'original' });
    expect(result).toEqual({ plain: 'from-a' });
  });

  it('allows setExtra to write to the current field own name', () => {
    const fields: FieldConfig[] = [
      {
        component: Noop,
        name: 'self',
        transform: {
          out: (_value: any, setExtra) => {
            setExtra('self', 'via-extra');
            return undefined;
          },
        },
      },
    ];
    expect(applyTransformsOut(fields, { self: 1 })).toEqual({});
  });
});
