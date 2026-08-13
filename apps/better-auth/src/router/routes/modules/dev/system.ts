import type { RouteRecordRaw } from 'vue-router';

import { authClient } from '#/auth';
import { $t } from '#/locales';
import { ROUTE_ORDER } from '../../routes.constants';

const routes: Array<RouteRecordRaw> = [
  {
    meta: {
      icon: 'ion:settings-outline',
      order: ROUTE_ORDER.SYSTEM,
      title: $t('system.title'),
    },
    name: 'System',
    path: '/system',
    children: [
      {
        path: 'user',
        name: 'SystemUser',
        meta: {
          icon: 'mdi:user',
          title: $t('system.user.title'),
          authority: (roles) =>
            roles.some((role) =>
              authClient.admin.checkRolePermission({
                role,
                permissions: { user: ['list'] },
              }),
            ),
        },
        component: () => import('#/views/system/user/list.vue'),
      },
      {
        path: 'role',
        name: 'SystemRole',
        meta: {
          icon: 'mdi:account-group',
          title: $t('system.role.title'),
        },
        component: () => import('#/views/system/role/list.vue'),
      },
      {
        path: 'menu',
        name: 'SystemMenu',
        meta: {
          icon: 'mdi:menu',
          title: $t('system.menu.title'),
        },
        component: () => import('#/views/system/menu/list.vue'),
      },
      {
        path: 'dept',
        name: 'SystemDept',
        meta: {
          icon: 'charm:organisation',
          title: $t('system.dept.title'),
        },
        component: () => import('#/views/system/dept/list.vue'),
      },
    ],
  },
];

export default routes;
