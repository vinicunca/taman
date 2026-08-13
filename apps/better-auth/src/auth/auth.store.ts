import type { Recordable, UserInfo } from '@taman/types';

import { preferences } from '@taman/preferences';
import { useAccessStore } from '@taman/stores';
import { acceptHMRUpdate, defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authClient } from './auth.client';

/**
 * App-level auth orchestration built on Better Auth.
 *
 * This store owns the *flow* (sign-in/sign-out + post-auth navigation and store
 * resets). Session identity itself lives in `session.ts` / Better Auth cookies.
 */
export const useAuthStore = defineStore(
  'core-auth',
  () => {
    const accessStore = useAccessStore();
    const router = useRouter();

    const loginLoading = ref(false);

    /**
     * Sign in with email/password, then hydrate the session and route the user.
     * Accepts `email` or legacy `username` as the identifier.
     */
    async function authLogin(
      params: Recordable<any>,
      onSuccess?: () => Promise<void> | void,
    ): Promise<{ userInfo: null | UserInfo }> {
      let userInfo: null | UserInfo = null;
      try {
        loginLoading.value = true;

        const { error } = await authClient.signIn.email({
          email: params.email ?? params.username,
          password: params.password,
        });

        if (error) {
          throw new Error(error.message ?? 'Login failed');
        }

        // Force a fresh session fetch so roles/menus reflect the new user.
        // refreshSession's queryFn also syncs the user store.

        // Force the guard to regenerate dynamic routes for the new user.
        accessStore.setIsAccessChecked(false);
        // accessStore.setLoginExpired(false);

        await (onSuccess
          ? onSuccess()
          : router.push(
              userInfo?.homePath || preferences.app.defaultHomePath,
            ));
      } finally {
        loginLoading.value = false;
      }

      return { userInfo };
    }

    function $reset() {
      loginLoading.value = false;
    }

    return {
      $reset,
      authLogin,
      loginLoading,
    };
  },
);

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
