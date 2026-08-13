import { describe, expect, it } from 'vitest';
import { ref } from 'vue';

import { buildQueryKey } from './query-key';

describe('buildQueryKey', () => {
  it('derives [url] when there is no query', () => {
    expect(buildQueryKey('/users').value).toEqual(['/users']);
  });

  it('derives [url, query] when query params exist', () => {
    expect(buildQueryKey('/users', { page: 1 }).value).toEqual([
      '/users',
      { page: 1 },
    ]);
  });

  it('is reactive to url refs and getters', () => {
    const id = ref(1);
    const key = buildQueryKey(() => `/users/${id.value}`);
    expect(key.value).toEqual(['/users/1']);

    id.value = 2;
    expect(key.value).toEqual(['/users/2']);
  });

  it('is reactive to query refs', () => {
    const query = ref<Record<string, unknown> | undefined>({ page: 1 });
    const key = buildQueryKey('/users', query);
    expect(key.value).toEqual(['/users', { page: 1 }]);

    query.value = { page: 2 };
    expect(key.value).toEqual(['/users', { page: 2 }]);

    query.value = undefined;
    expect(key.value).toEqual(['/users']);
  });
});
