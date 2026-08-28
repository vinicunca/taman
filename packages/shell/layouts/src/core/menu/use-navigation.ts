import type { RouteRecordNormalized } from 'vue-router';

import { useRouter } from 'vue-router';

import { isHttpUrl, openRouteInNewWindow, openWindow } from '@taman/utils';

function useNavigation() {
  const router = useRouter();
  const routeMetaMap = new Map<string, RouteRecordNormalized>();

  // Initialize route meta map
  const initRouteMetaMap = () => {
    const routes = router.getRoutes();
    routes.forEach((route) => {
      routeMetaMap.set(route.path, route);
    });
  };

  initRouteMetaMap();

  // Refresh route meta map after navigation
  router.afterEach(() => {
    initRouteMetaMap();
  });

  // Whether the path should open in a new window
  const shouldOpenInNewWindow = (path: string): boolean => {
    if (isHttpUrl(path)) {
      return true;
    }
    const route = routeMetaMap.get(path);
    // External link or openInNewWindow meta
    return !!(route?.meta?.link || route?.meta?.openInNewWindow);
  };

  const resolveHref = (path: string): string => {
    return router.resolve(path).href;
  };

  const navigation = async (path: string) => {
    try {
      const route = routeMetaMap.get(path);
      const { openInNewWindow = false, query = {}, link } = route?.meta ?? {};

      // Handle external link meta
      if (link && typeof link === 'string') {
        openWindow(link, { target: '_blank' });
        return;
      }

      if (isHttpUrl(path)) {
        openWindow(path, { target: '_blank' });
      } else if (openInNewWindow) {
        openRouteInNewWindow(resolveHref(path));
      } else {
        await router.push({
          path,
          query,
        });
      }
    } catch (error) {
      console.error('Navigation failed:', error);
      throw error;
    }
  };

  const willOpenedByWindow = (path: string) => {
    return shouldOpenInNewWindow(path);
  };

  return { navigation, willOpenedByWindow };
}

export { useNavigation };
