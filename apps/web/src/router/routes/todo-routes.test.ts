import { describe, expect, it, vi } from 'vitest';
import enTodo from '#/locales/langs/en-US/todo.json';
import idTodo from '#/locales/langs/id-ID/todo.json';
import { overridesPreferences } from '#/preferences';

vi.mock('#/locales', () => ({ $t: (key: string) => key }));
vi.mock('./core', () => ({ coreRoutes: [] }));

describe('todo reference feature routes', () => {
  it('registers /todos with manage, list and live pages', async () => {
    const { default: todoRoutes } = await import('./modules/todo');
    const [root] = todoRoutes;

    expect(root?.path).toBe('/todos');
    expect(root?.redirect).toBe('/todos/manage');
    expect(root?.children?.map((route) => route.path)).toEqual(['manage', 'list', 'live']);
  });

  it('loads route modules outside the dev gallery', async () => {
    const { accessRoutes } = await import('./index');

    expect(accessRoutes.map((route) => route.name)).toContain('Todos');
  });

  it('lands on the todo page after login', () => {
    expect(overridesPreferences.app?.defaultHomePath).toBe('/todos/manage');
  });

  it('has the same todo copy keys in every language', () => {
    expect(Object.keys(idTodo).sort()).toEqual(Object.keys(enTodo).sort());
  });
});
