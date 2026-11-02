import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import { useSessionStore } from './session.store';

const mocks = vi.hoisted(() => ({
  signOut: vi.fn(),
  clearAuthCache: vi.fn(),
  resetAllStores: vi.fn(),
  router: {
    currentRoute: {
      value: { path: '/todo', fullPath: '/todo?page=2#item' },
    },
    replace: vi.fn(),
  },
}));
vi.mock('vue-router', () => ({
  useRouter: () => mocks.router,
}));
vi.mock('@tanstack/vue-query', () => ({
  useQuery: () => ({
    data: ref(null),
  }),
}));
vi.mock('@taman/stores', () => ({
  resetAllStores: mocks.resetAllStores,
  useAccessStore: () => ({}),
}));
vi.mock('@taman/locales', () => ({
  $t: (key: string) => key,
}));
vi.mock('#/api/errors', () => ({
  getErrors: () => 'error',
}));
vi.mock('./auth.client', () => ({
  authClient: { signOut: mocks.signOut },
}));
vi.mock('./auth.session', () => ({
  clearAuthCache: mocks.clearAuthCache,
  refreshSession: vi.fn(),
  sessionQueryOptions: {},
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('useToast', () => ({
    add: vi.fn(),
  }));
  setActivePinia(createPinia());
  mocks.signOut.mockResolvedValue({});
  mocks.router.currentRoute.value = { path: '/todo', fullPath: '/todo?page=2#item' };
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('session logout redirect', () => {
  it('preserves the business page query and hash as the return target', async () => {
    await useSessionStore().logout();
    expect(mocks.router.replace).toHaveBeenCalledWith({
      path: '/auth/login',
      query: {
        redirect: encodeURIComponent('/todo?page=2#item'),
      },
    });
  });

  it('does not wrap the login page or an existing redirect on repeated logout', async () => {
    mocks.router.currentRoute.value = { path: '/auth/login', fullPath: '/auth/login?redirect=%2Ftodo' };
    const store = useSessionStore();
    await store.logout();
    await store.logout();
    expect(mocks.router.replace).toHaveBeenCalledTimes(2);
    for (const [destination] of mocks.router.replace.mock.calls) {
      expect(destination).toEqual({ path: '/auth/login', query: {} });
    }
  });

  it('still clears local state and avoids self-redirects when sign-out fails', async () => {
    mocks.signOut.mockRejectedValue(new Error('offline'));
    mocks.router.currentRoute.value = { path: '/auth/login', fullPath: '/auth/login' };
    await useSessionStore().logout();
    expect(mocks.clearAuthCache).toHaveBeenCalledOnce();
    expect(mocks.resetAllStores).toHaveBeenCalledOnce();
    expect(mocks.router.replace).toHaveBeenCalledWith({ path: '/auth/login', query: {} });
  });
});
