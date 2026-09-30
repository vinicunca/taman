import { describe, expect, it } from 'vitest';
import { todoTable } from './todo.schema';

describe('todo schema', () => {
  it('scopes rows to an organization and defaults completed to false', () => {
    expect(todoTable.organizationId.notNull).toBe(true);
    expect(todoTable.title.notNull).toBe(true);
    expect(todoTable.completed.notNull).toBe(true);
    expect(todoTable.completed.default).toBe(false);
    expect(todoTable.createdBy.notNull).toBe(false);
  });
});
