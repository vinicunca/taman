import { TODO_TITLE_MAX } from '@vinicunca/taman-api-contract';
import { describe, expect, it } from 'vitest';
import { clampPage, parseTodoListQuery, toTodoListQuery } from './todo-list-params';

describe('parseTodoListQuery', () => {
  it('reads well-formed values', () => {
    expect(parseTodoListQuery({ page: '3', pageSize: '20', search: 'milk', completed: 'true' }))
      .toEqual({ page: 3, pageSize: 20, search: 'milk', completed: true });
  });

  it('falls back to safe defaults for hand-edited garbage', () => {
    expect(parseTodoListQuery({ page: 'abc', pageSize: '5000', completed: 'maybe' }))
      .toEqual({ page: 1, pageSize: 10, search: undefined, completed: undefined });
    expect(parseTodoListQuery({ page: '-4', pageSize: '0' })).toMatchObject({ page: 1, pageSize: 10 });
    expect(parseTodoListQuery({ page: '2.7' })).toMatchObject({ page: 2 });
  });

  it('ignores blank search and takes the first value of repeated keys', () => {
    expect(parseTodoListQuery({ search: '   ' }).search).toBeUndefined();
    expect(parseTodoListQuery({ page: ['4', '9'] }).page).toBe(4);
  });

  it('caps an over-long hand-edited search at the server max instead of letting it become a BAD_REQUEST', () => {
    const overLong = 'x'.repeat(TODO_TITLE_MAX + 50);
    expect(parseTodoListQuery({ search: overLong }).search).toBe(overLong.slice(0, TODO_TITLE_MAX));
    expect(parseTodoListQuery({ search: overLong }).search).toHaveLength(TODO_TITLE_MAX);
  });

  it('treats a page that is not a safe integer (e.g. 1e20) as page 1', () => {
    expect(parseTodoListQuery({ page: '1e20' })).toMatchObject({ page: 1 });
    expect(parseTodoListQuery({ page: 'Infinity' })).toMatchObject({ page: 1 });
    expect(parseTodoListQuery({ page: String(Number.MAX_SAFE_INTEGER + 10) })).toMatchObject({ page: 1 });
  });
});

describe('toTodoListQuery', () => {
  it('omits defaults and empty filters so URLs stay short', () => {
    expect(toTodoListQuery({ page: 1, pageSize: 10 })).toEqual({});
    expect(toTodoListQuery({ page: 2, pageSize: 20, search: 'a', completed: false }))
      .toEqual({ page: '2', pageSize: '20', search: 'a', completed: 'false' });
  });
});

describe('clampPage', () => {
  it('moves past-the-end pages back to the last page', () => {
    expect(clampPage(5, 4)).toBe(4);
    expect(clampPage(3, 4)).toBe(3);
  });

  it('keeps page 1 when there are no results', () => {
    expect(clampPage(3, 0)).toBe(1);
  });
});
