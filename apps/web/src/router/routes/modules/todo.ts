import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';
import { ROUTE_ORDER } from '../routes.constants';

/**
 * Reference feature: one resource across every layer (rbac → schema →
 * contract → procedure → page). Copy this module when adding a feature.
 */
const routes: Array<RouteRecordRaw> = [
  {
    meta: {
      icon: 'lucide:list-todo',
      order: ROUTE_ORDER.TODO,
      title: $t('todo.title'),
    },
    name: 'Todos',
    path: '/todos',
    redirect: '/todos/manage',
    children: [
      {
        name: 'TodoManage',
        path: 'manage',
        component: () => import('#/views/todo/crud.vue'),
        meta: { title: $t('todo.manage') },
      },
      {
        name: 'TodoList',
        path: 'list',
        component: () => import('#/views/todo/pagination.vue'),
        meta: { title: $t('todo.list') },
      },
      {
        name: 'TodoLive',
        path: 'live',
        component: () => import('#/views/todo/live.vue'),
        meta: { title: $t('todo.live') },
      },
    ],
  },
];

export default routes;
