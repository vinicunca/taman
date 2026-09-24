import { describe, expect, it } from 'vitest';
import { todoCreateInput, todoEventSchema, todoListInput, todoUpdateInput } from './todo.schema';

const ID = '01920000-0000-7000-8000-000000000001';

describe('todoCreateInput', () => {
  it('trims the title and rejects blank or oversized titles', () => {
    expect(todoCreateInput.parse({ title: '  Buy milk  ' })).toEqual({ title: 'Buy milk' });
    expect(todoCreateInput.safeParse({ title: '   ' }).success).toBe(false);
    expect(todoCreateInput.safeParse({ title: 'x'.repeat(201) }).success).toBe(false);
  });
});

describe('todoUpdateInput', () => {
  it('requires at least one of title or completed', () => {
    expect(todoUpdateInput.safeParse({ id: ID }).success).toBe(false);
    expect(todoUpdateInput.safeParse({ id: ID, completed: true }).success).toBe(true);
  });

  it('accepts uuid v7 ids and rejects non-uuids', () => {
    expect(todoUpdateInput.safeParse({ id: 'nope', title: 'a' }).success).toBe(false);
  });
});

describe('todoListInput', () => {
  it('extends pagination with optional trimmed search and completed filters', () => {
    expect(todoListInput.parse({ search: '  milk ' })).toEqual({ page: 1, pageSize: 20, search: 'milk' });
  });
});

describe('todoEventSchema', () => {
  it('discriminates on type', () => {
    expect(todoEventSchema.safeParse({ type: 'removed', id: ID }).success).toBe(true);
    expect(todoEventSchema.safeParse({ type: 'removed', todo: {} }).success).toBe(false);
  });
});
