import type { RouteRecordRaw } from 'vue-router';

import { LOGIN_PATH } from '@taman/constants';
import { preferences } from '@taman/preferences';

import { $t } from '#/locales';

const CoreLayout = () => import('#/layouts/basic.vue');
const AuthPageLayout = () => import('#/layouts/auth.vue');
/** Global 404 fallback route */
const fallbackNotFoundRoute: RouteRecordRaw = {
  component: () => import('#/views/_core/fallback/not-found.vue'),
  meta: {
    // No auth meta — protected by default. Guests hitting unknown paths
    // (e.g. /dashboard before dynamic routes exist) redirect to login;
    // authenticated users with access already checked see the 404 page.
    hideInBreadcrumb: true,
    hideInMenu: true,
    hideInTab: true,
    title: '404',
  },
  name: 'FallbackNotFound',
  path: '/:path(.*)*',
};

/** Core routes that must always exist */
const coreRoutes: Array<RouteRecordRaw> = [
  /**
   * Root route.
   * Uses CoreLayout as the parent shell; child routes need not set CoreLayout.
   * This route must exist and should not be changed.
   */
  {
    component: CoreLayout,
    meta: {
      // Declarative only — resolveAuthMetaFromMatched (auth-middleware.ts)
      // hardcodes a skip for this route name via AUTH_LAYOUT_ROUTE_NAMES, so
      // this value is never actually read. Kept for readability/defense in
      // depth; if you rename this route, update AUTH_LAYOUT_ROUTE_NAMES too.
      auth: false,
      hideInBreadcrumb: true,
      title: 'Root',
    },
    name: 'Root',
    path: '/',
    redirect: preferences.app.defaultHomePath,
    children: [fallbackNotFoundRoute],
  },
  {
    component: AuthPageLayout,
    meta: {
      hideInTab: true,
      title: 'Authentication',
    },
    name: 'Authentication',
    path: '/auth',
    redirect: LOGIN_PATH,
    children: [
      {
        name: 'Login',
        path: 'login',
        component: () => import('#/views/_core/authentication/login.vue'),
        meta: {
          auth: { only: 'guest' },
          title: $t('page.auth.login'),
        },
      },
      {
        name: 'CodeLogin',
        path: 'code-login',
        component: () => import('#/views/_core/authentication/code-login.vue'),
        meta: {
          auth: { only: 'guest' },
          title: $t('page.auth.codeLogin'),
        },
      },
      {
        name: 'QrCodeLogin',
        path: 'qrcode-login',
        component: () =>
          import('#/views/_core/authentication/qrcode-login.vue'),
        meta: {
          auth: { only: 'guest' },
          title: $t('page.auth.qrcodeLogin'),
        },
      },
      {
        name: 'ForgetPassword',
        path: 'forget-password',
        component: () =>
          import('#/views/_core/authentication/forget-password.vue'),
        meta: {
          auth: { only: 'guest' },
          title: $t('page.auth.forgetPassword'),
        },
      },
      {
        name: 'Register',
        path: 'register',
        component: () => import('#/views/_core/authentication/register.vue'),
        meta: {
          auth: { only: 'guest' },
          title: $t('page.auth.register'),
        },
      },
    ],
  },
];

export { coreRoutes };
