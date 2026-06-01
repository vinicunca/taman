import { resetStaticRoutes } from '@taman/utils';
import {
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';

import { createRouterGuard } from './guard';
import { routes } from './routes';

const router = createRouter({
  history:
    import.meta.env.VITE_ROUTER_HISTORY === 'hash'
      ? createWebHashHistory(import.meta.env.VITE_BASE)
      : createWebHistory(import.meta.env.VITE_BASE),
  // It should be added to the initial route list of the route.
  routes,
  scrollBehavior: (to, _from, savedPosition) => {
    if (savedPosition) {
      return savedPosition;
    }
    return to.hash ? { behavior: 'smooth', el: to.hash } : { left: 0, top: 0 };
  },
});

const resetRoutes = () => resetStaticRoutes(router, routes);

createRouterGuard(router);

export { resetRoutes, router };
