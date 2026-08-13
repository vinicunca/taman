import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import type { FieldConfig } from '../types';

import { assertUniqueFieldNames, composeZodSchema, isRequiredRule } from '../schema';

const Noop = {} as any; // component irrelevant for schema tests

describe('composeZodSchema', () => {
  it('groups dot paths into nested objects', () => {
    const fields: FieldConfig[] = [
      { component: Noop, name: 'user.email', rules: z.string().min(1) },
      { component: Noop, name: 'user.age', rules: z.number() },
      { component: Noop, name: 'note', rules: z.string().optional() },
    ];
    const schema = composeZodSchema(fields);
    const bad = schema.safeParse({ user: { email: '', age: 'x' }, note: undefined });
    expect(bad.success).toBe(false);
    const paths = bad.error!.issues.map((issue) => issue.path.join('.'));
    expect(paths).toContain('user.email');
    expect(paths).toContain('user.age');

    const ok = schema.safeParse({ user: { email: 'a@b.co', age: 3 } });
    expect(ok.success).toBe(true);
  });

  it('skips fields without a name or without rules', () => {
    const fields: FieldConfig[] = [
      { component: Noop, label: 'Heading only' },
      { component: Noop, name: 'free' },
    ];
    const schema = composeZodSchema(fields);
    expect(schema.safeParse({}).success).toBe(true);
  });

  it('excludes fields the runtime marks excluded (if === false)', () => {
    const fields: FieldConfig[] = [
      { component: Noop, name: 'a', rules: z.string().min(1) },
      { component: Noop, name: 'b', rules: z.string().min(1) },
    ];
    const schema = composeZodSchema(fields, { isExcluded: (name) => name === 'b' });
    expect(schema.safeParse({ a: 'x' }).success).toBe(true);
  });

  it('applies dynamic rule overrides from the runtime', () => {
    const fields: FieldConfig[] = [
      { component: Noop, name: 'a', rules: z.string().optional() },
    ];
    const schema = composeZodSchema(fields, {
      dynamicRule: (name) => (name === 'a' ? z.string().min(5) : undefined),
    });
    expect(schema.safeParse({ a: 'ab' }).success).toBe(false);
    expect(schema.safeParse({ a: 'abcde' }).success).toBe(true);
  });

  it('wraps repeat fields in z.array with min/max and indexed issue paths', () => {
    const fields: FieldConfig[] = [
      {
        component: Noop,
        name: 'contacts',
        repeat: {
          fields: [{ component: Noop, name: 'email', rules: z.string().email() }],
          min: 1,
          max: 3,
        },
      },
    ];
    const schema = composeZodSchema(fields);
    expect(schema.safeParse({ contacts: [] }).success).toBe(false);

    const bad = schema.safeParse({ contacts: [{ email: 'nope' }] });
    expect(bad.success).toBe(false);
    expect(bad.error!.issues[0].path.join('.')).toBe('contacts.0.email');

    expect(
      schema.safeParse({ contacts: [{ email: 'a@b.co' }] }).success,
    ).toBe(true);
  });

  it('throws on leaf/subtree collision (leaf first, then nested)', () => {
    const fields: FieldConfig[] = [
      { component: Noop, name: 'user', rules: z.string() },
      { component: Noop, name: 'user.email', rules: z.string().min(1) },
    ];
    expect(() => composeZodSchema(fields)).toThrowError(/collision.*user/i);
  });

  it('throws on leaf/subtree collision (nested first, then leaf)', () => {
    const fields: FieldConfig[] = [
      { component: Noop, name: 'user.email', rules: z.string().min(1) },
      { component: Noop, name: 'user', rules: z.string() },
    ];
    expect(() => composeZodSchema(fields)).toThrowError(/collision.*user/i);
  });

  it('explicit rules on a repeat field replace the generated array schema', () => {
    const fields: FieldConfig[] = [
      {
        component: Noop,
        name: 'tags',
        rules: z.array(z.string()).min(2),
        repeat: { fields: [{ component: Noop, name: 'ignored', rules: z.number() }] },
      },
    ];
    const schema = composeZodSchema(fields);
    expect(schema.safeParse({ tags: ['a'] }).success).toBe(false);
    expect(schema.safeParse({ tags: ['a', 'b'] }).success).toBe(true);
  });
});

describe('isRequiredRule', () => {
  it('detects required via safeParse(undefined)', () => {
    expect(isRequiredRule(z.string())).toBe(true);
    expect(isRequiredRule(z.string().optional())).toBe(false);
    expect(isRequiredRule(z.number().default(3))).toBe(false);
    expect(isRequiredRule(undefined)).toBe(false);
  });
});

describe('assertUniqueFieldNames', () => {
  it('throws on duplicate names, passes otherwise', () => {
    const dup: FieldConfig[] = [
      { component: Noop, name: 'a' },
      { component: Noop, name: 'a' },
    ];
    expect(() => assertUniqueFieldNames(dup)).toThrowError(/duplicate.*"a"/i);
    expect(() =>
      assertUniqueFieldNames([{ component: Noop, name: 'a' }, { component: Noop }]),
    ).not.toThrow();
  });
});
