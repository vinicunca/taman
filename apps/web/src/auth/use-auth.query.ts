import { useQuery } from '@tanstack/vue-query';
import { authClient } from './auth.client';
import { AUTH_QUERY_KEY } from './auth.constant';
import { unwrapAuthResult } from './auth.result';

const authQueryKeys = {
  all: () => [AUTH_QUERY_KEY] as const,
  listUsers: () => [AUTH_QUERY_KEY, 'listUsers'] as const,
};

export function useListUsersQuery() {
  return useQuery({
    queryKey: authQueryKeys.listUsers(),
    queryFn: () => unwrapAuthResult(
      authClient.admin.listUsers({
        query: {},
      }),
    ),
  });
}
