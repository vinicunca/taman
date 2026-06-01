import type { Router } from 'vue-router';
import { preferences } from '@taman/preferences';
import { useAccessStore } from '@taman/stores';
import { startProgress, stopProgress } from '@taman/utils';
import { accessRoutes } from '#/router/routes';
import { generateAccess } from './access';

function createRouterGuard(router: Router) {
  setupCommonGuard(router);
  setupAccessGuard(router);
}

/**
 * General Guard Configuration
 */
function setupCommonGuard(router: Router) {
  // Record the pages that have been loaded
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
    // Record whether the page is loaded, if it has been loaded, the subsequent page switching animation and other effects are not repeated
    loadedPaths.add(to.path);

    // Close the page loading progress bar
    if (preferences.transition.progress) {
      stopProgress();
    }
  });
}

/**
 * Access Guard Configuration
 */
function setupAccessGuard(router: Router) {
  router.beforeEach(async (to, from) => {
    const accessStore = useAccessStore();
    const accessMenus = accessStore.accessMenus;

    // Have dynamic routes already been generated?
    if (accessStore.isAccessChecked) {
      return true;
    }

    // Generate menus and routes
    const { accessibleMenus, accessibleRoutes } = await generateAccess({
      roles: [],
      router,
      routes: accessRoutes,
    });

    accessStore.setAccessMenus(accessibleMenus);
    accessStore.setAccessRoutes(accessibleRoutes);
    accessStore.setIsAccessChecked(true);

    let redirectPath: string;
    if (from.query.redirect) {
      redirectPath = from.query.redirect as string;
    } else if (to.fullPath === preferences.app.defaultHomePath) {
      redirectPath = preferences.app.defaultHomePath;
      // TODO: implement user home path
      // else if (userInfo.homePath && to.fullPath === userInfo.homePath) {
      //   redirectPath = userInfo.homePath;
      // }
    } else {
      redirectPath = to.fullPath;
    }

    return {
      ...router.resolve(decodeURIComponent(redirectPath)),
      replace: true,
    };
  });
}

export { createRouterGuard };
