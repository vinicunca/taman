import type { AuthRoleNames } from '@taman/rbac';
import { LOGIN_PATH } from '@taman/constants';
import { $t } from '@taman/locales';
import { preferences } from '@taman/preferences';
import { resetAllStores, useAccessStore } from '@taman/stores';
import { useQuery } from '@tanstack/vue-query';
import { acceptHMRUpdate, defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getErrors } from '#/api/errors';
import { authClient } from './auth.client';
import { clearAuthCache, refreshSession, sessionQueryOptions } from './auth.session';

export const useSessionStore = defineStore('auth-session', () => {
  const toast = useToast();
  const router = useRouter();
  const accessStore = useAccessStore();

  const { data: authData } = useQuery(sessionQueryOptions);

  const user = computed(() => authData.value?.user ?? null);
  const session = computed(() => authData.value?.session ?? null);
  const isAuthenticated = computed(() => !!user.value);
  const roles = computed(() =>
    (user.value?.role ? [user.value.role] : []) as Array<AuthRoleNames>,
  );

  const isLoggingIn = ref(false);

  async function signInWithEmail(
    params: { email: string; password: string },
    onSuccess?: () => Promise<void> | void,
  ) {
    try {
      isLoggingIn.value = true;

      // Better Auth's client resolves (never rejects) on HTTP errors — the
      // failure comes back in `error`, not via `.catch()`. Only genuine
      // network/CORS failures reject and land in the `catch` below.
      const { error } = await authClient.signIn.email({
        email: params.email,
        password: params.password,
      });

      if (error) {
        notifyAuthError(error);
        return;
      }

      // Email login stays in the SPA (no full reload). The guard may already
      // have cached an anonymous session from the login page (staleTime 60s),
      // so refresh before navigating or ensureSession() would still see "signed out".
      await refreshSession();
      // Same SPA continuity: force the access guard to rebuild menus/routes for
      // this user. Google sign-in does neither — it redirects away and remounts
      // the app, so Pinia + the query cache start empty.
      accessStore.setIsAccessChecked(false);

      await (onSuccess
        ? onSuccess()
        : router.push(preferences.app.defaultHomePath));
    } catch (error) {
      notifyAuthError(error);
    } finally {
      isLoggingIn.value = false;
    }
  }

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
    const isNetworkFailure = error instanceof TypeError;

    toast.add({
      title: isNetworkFailure
        ? $t('ui.fallback.offlineError')
        : resolveAuthErrorDescription(error),
      description: isNetworkFailure
        ? $t('ui.fallback.offlineErrorDesc')
        : undefined,
      color: 'error',
    });
  }

  /**
   * Prefer Better Auth's own message for credential failures (e.g. wrong
   * password). `getErrors` maps 401 → "Unauthorized…", which is a poor
   * login tip. Network TypeErrors still go through `getErrors`.
   */
  function resolveAuthErrorDescription(error: unknown): string {
    if (error instanceof TypeError) {
      return $t('ui.fallback.offlineErrorDesc');
    }

    if (error && typeof error === 'object') {
      const { message } = error as { message?: string };
      if (message) {
        return message;
      }
    }

    return getErrors(error);
  }

  function $reset() {
    isLoggingIn.value = false;
  }

  return {
    // State
    isAuthenticated,
    isLoggingIn,
    roles,
    session,
    user,

    // Actions
    logout,
    signInWithEmail,
    signInWithGoogle,
    $reset,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSessionStore, import.meta.hot));
}
