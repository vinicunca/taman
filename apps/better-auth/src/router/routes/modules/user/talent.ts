import type { RouteRecordRaw } from 'vue-router';
import { $t } from '#/locales';
import { ROUTE_ORDER } from '../../routes.constants';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/talent',
    name: 'Talent',
    meta: {
      order: ROUTE_ORDER.TALENT,
      icon: 'lucide:mic-vocal',
      title: $t('page.talents.root'),
    },
    children: [
      {
        name: 'Talent List',
        path: 'list',
        component: () => import('#/views/talents/page.talents.list.vue'),
        meta: {
          title: $t('page.talents.list'),
          icon: 'lucide:users-round',
        },
      },
    ],
  },
];

export default routes;
