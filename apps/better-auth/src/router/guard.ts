import type { AuthRoleNames } from '@taman/rbac';
import type { Router } from 'vue-router';

import { LOGIN_PATH, ONBOARDING_PATH } from '@taman/constants';
import { preferences } from '@taman/preferences';
import { USER_ROLES } from '@taman/rbac';
import { useAccessStore } from '@taman/stores';
import { startProgress, stopProgress } from '@taman/utils';
import { ensureSession } from '#/auth';
import { accessRoutes } from '#/router/routes';
import { generateAccess } from './access';
import { resolveAuthDecision, resolveAuthMetaFromMatched } from './auth-middleware';

/**
 * Common route guard setup.
 * @param router
 */
function setupCommonGuard(router: Router) {
  // Track pages that have already been loaded
  const loadedPaths = new Set<string>();

  router.beforeEach((to) => {
    to.meta.loaded = loadedPaths.has(to.path);

    // Page loading progress bar
    if (!to.meta.loaded && preferences.transition.progress) {
      startProgress();
    }
    return true;
  });

  router.afterEach((to) => {
    // Mark page as loaded; skip repeat transition effects on later visits
    loadedPaths.add(to.path);

    // Stop page loading progress bar
    if (preferences.transition.progress) {
      stopProgress();
    }
  });
}

/**
 * Access permission route guard setup.
 * @param router
 */
function setupAccessGuard(router: Router) {
  router.beforeEach(async (to, from) => {
    const accessStore = useAccessStore();

    // Resolve the [AUTH_QUERY_KEY, 'session'] query; cached within staleTime, so
    // repeat navigation are free. The queryFn also syncs the user store,
    // so `userInfo` below reflects the cookie session.
    //
    // Use the resolved session directly rather than the reactive
    // sessionStore.isAuthenticated/roles: those derive from useQuery's own
    // long-lived observer, which isn't guaranteed to have re-notified yet
    // by this point (e.g. right after clearAuthCache() on logout) — reading
    // them here can see the pre-navigation value for one guard pass.
    const session = await ensureSession();
    const isAuthenticated = Boolean(session?.user);
    const needsOnboarding = isAuthenticated
      && session?.user?.role !== USER_ROLES.ADMIN
      && !session?.session?.activeOrganizationId;

    const decision = resolveAuthDecision({
      authMeta: resolveAuthMetaFromMatched(to.matched),

      isAuthenticated,

      needsOnboarding,

      defaults: {
        guestTarget: LOGIN_PATH,
        userTarget: preferences.app.defaultHomePath,
        onboardingTarget: ONBOARDING_PATH,
      },
    });

    if (decision.type === 'redirectToLogin') {
      // Defensive: unreachable under correct route config (the login
      // route itself is `only: 'guest'`, never protected).
      if (to.fullPath === decision.target) {
        return true;
      }
      return {
        path: decision.target,
        // Remove query if not needed
        query:
          to.fullPath === preferences.app.defaultHomePath
            ? {}
            : { redirect: encodeURIComponent(to.fullPath) },
        // Preserve current URL for post-login redirect
        replace: true,
      };
    }

    if (decision.type === 'redirectAuthenticated') {
      return decodeURIComponent(
        (to.query?.redirect as string)
        || decision.target,

        // TODO: Implement redirect to user's selected home path
      );
    }

    if (decision.type === 'redirectToOnboarding') {
      // Defensive: unreachable under correct route config (the onboarding
      // route itself is `only: 'onboarding'`, never falls into this branch).
      if (to.fullPath === decision.target) {
        return true;
      }
      return decision.target;
    }

    if (decision.type === 'allow') {
      return true;
    }

    // decision.type === 'generateAccess' here — the only remaining variant
    // Whether dynamic routes have already been generated
    if (accessStore.isAccessChecked) {
      return true;
    }

    // Generate menus and routes
    const { accessibleMenus, accessibleRoutes } = await generateAccess({
      roles: (session?.user?.role ? [session?.user?.role] : []) as Array<AuthRoleNames>,
      router,
      // Shown in menu but visits redirect to 403 when forbidden
      routes: accessRoutes,
    });

    // Persist menu and route data
    accessStore.setAccessMenus(accessibleMenus);
    accessStore.setAccessRoutes(accessibleRoutes);
    accessStore.setIsAccessChecked(true);

    // TODO: Implement redirect to user's selected home path
    let redirectPath: string;
    if (from.query.redirect) {
      redirectPath = from.query.redirect as string;
    } else if (to.fullPath === preferences.app.defaultHomePath) {
      redirectPath = preferences.app.defaultHomePath;
    } else {
      redirectPath = to.fullPath;
    }

    return {
      ...router.resolve(decodeURIComponent(redirectPath)),
      replace: true,
    };
  });
}

/**
 * Application route guard setup.
 * @param router
 */
function createRouterGuard(router: Router) {
  /** Common guards */
  setupCommonGuard(router);
  /** Access guards */
  setupAccessGuard(router);
}

export { createRouterGuard };
