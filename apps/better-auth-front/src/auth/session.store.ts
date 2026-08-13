import type { AuthRoleNames } from '@taman/rbac';
import { LOGIN_PATH } from '@taman/constants';
import { $t } from '@taman/locales';
import { resetAllStores } from '@taman/stores';
import { useQuery } from '@tanstack/vue-query';
import { acceptHMRUpdate, defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getErrors } from '#/api/errors';
import { authClient } from './auth.client';
import { clearAuthCache, sessionQueryOptions } from './auth.session';

export const useSessionStore = defineStore('auth-session', () => {
  const toast = useToast();
  const router = useRouter();

  const { data: authData } = useQuery(sessionQueryOptions);

  const user = computed(() => authData.value?.user ?? null);
  const session = computed(() => authData.value?.session ?? null);
  const isAuthenticated = computed(() => !!user.value);
  const roles = computed(() =>
    (user.value?.role ? [user.value.role] : []) as Array<AuthRoleNames>,
  );

  async function signInWithGoogle() {
    try {
      // Better Auth's client resolves (never rejects) on HTTP errors — the
      // failure comes back in `error`, not via `.catch()`. Only genuine
      // network/CORS failures reject and land in the `catch` below.
      const callbackURL = new URL(
        import.meta.env.VITE_BASE,
        window.location.origin,
      ).toString();
      const { data, error } = await authClient.signIn.social({
        provider: 'google',
        callbackURL,
      });

      if (error) {
        notifyAuthError(error);
        return;
      }

      return data;
    } catch (error) {
      notifyAuthError(error);
    }
  }

  const isLoggingIn = ref(false);

  async function logout() {
    try {
      await authClient.signOut();
    } catch {
      // Ignore sign-out API errors; we still clear local state below.
    } finally {
      clearAuthCache();
      resetAllStores();
    }

    await router.replace({
      path: LOGIN_PATH,
      query: {
        redirect: encodeURIComponent(router.currentRoute.value.fullPath),
      },
    });
  }

  function notifyAuthError(error: unknown) {
    toast.add({
      title: $t('ui.fallback.offlineError'),
      description: getErrors(error),
      color: 'error',
    });
  }

  function $reset() {
    isLoggingIn.value = false;
  }

  return {
    // State
    isAuthenticated,
    roles,
    session,
    user,
    isLoggingIn,

    // Actions
    logout,
    signInWithGoogle,
    $reset,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSessionStore, import.meta.hot));
}
