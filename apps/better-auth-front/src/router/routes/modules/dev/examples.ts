import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';
import { ROUTE_ORDER } from '../../routes.constants';

const routes: Array<RouteRecordRaw> = [
  {
    meta: {
      icon: 'ion:layers-outline',
      keepAlive: true,
      order: ROUTE_ORDER.EXAMPLES,
      title: $t('examples.title'),
    },
    name: 'Examples',
    path: '/examples',
    children: [
      {
        name: 'FormExample',
        path: 'form',
        meta: {
          icon: 'mdi:form-select',
          title: $t('examples.form.title'),
        },
        children: [
          {
            name: 'FormAllFieldsExample',
            path: 'all-fields',
            component: () => import('#/views/examples/form/all-fields.vue'),
            meta: {
              title: $t('examples.form.allFields.title'),
            },
          },
          {
            name: 'FormRulesExample',
            path: 'rules',
            component: () => import('#/views/examples/form/rules.vue'),
            meta: {
              title: $t('examples.form.rules'),
            },
          },
          {
            name: 'FormDynamicExample',
            path: 'dynamic',
            component: () => import('#/views/examples/form/dynamic.vue'),
            meta: {
              title: $t('examples.form.dynamic'),
            },
          },
          {
            name: 'FormLayoutExample',
            path: 'custom-layout',
            component: () => import('#/views/examples/form/custom-layout.vue'),
            meta: {
              title: $t('examples.form.layout'),
            },
          },
          {
            name: 'FormCustomExample',
            path: 'custom',
            component: () => import('#/views/examples/form/custom.vue'),
            meta: {
              title: $t('examples.form.custom'),
            },
          },
          {
            name: 'FormApiExample',
            path: 'api',
            component: () => import('#/views/examples/form/api.vue'),
            meta: {
              title: $t('examples.form.api'),
            },
          },
          {
            name: 'FormMergeExample',
            path: 'merge',
            component: () => import('#/views/examples/form/merge.vue'),
            meta: {
              title: $t('examples.form.merge'),
            },
          },
          {
            name: 'FormScrollToErrorExample',
            path: 'scroll-to-error-test',
            component: () =>
              import('#/views/examples/form/scroll-to-error-test.vue'),
            meta: {
              title: $t('examples.form.scrollToError'),
            },
          },
          {
            name: 'FormCollapsibleExample',
            path: 'collapsible-test',
            component: () => import('#/views/examples/form/collapsible.vue'),
            meta: {
              title: $t('examples.form.collapsible'),
            },
          },
          {
            name: 'FormArrayFieldsExample',
            path: 'array-fields',
            component: () => import('#/views/examples/form/array-fields.vue'),
            meta: {
              title: 'Form Array Fields',
            },
          },
        ],
      },
      {
        name: 'DialogExample',
        path: 'dialog',
        component: () => import('#/views/examples/dialog/index.vue'),
        meta: {
          icon: 'system-uicons:window-content',
          keepAlive: true,
          title: $t('examples.dialog.title'),
        },
      },
      {
        name: 'DrawerExample',
        path: 'drawer',
        component: () => import('#/views/examples/drawer/index.vue'),
        meta: {
          icon: 'iconoir:drawer',
          keepAlive: true,
          title: $t('examples.drawer.title'),
        },
      },
      {
        name: 'CountTo',
        path: 'count-to',
        component: () => import('#/views/examples/count-to/index.vue'),
        meta: {
          icon: 'mdi:animation-play',
          title: 'CountTo',
        },
      },
      {
        name: 'Loading',
        path: 'loading',
        component: () => import('#/views/examples/loading/index.vue'),
        meta: {
          icon: 'mdi:circle-double',
          title: 'Loading',
        },
      },
      {
        name: 'ButtonGroup',
        path: 'button-group',
        component: () => import('#/views/examples/button-group/index.vue'),
        meta: {
          icon: 'mdi:check-circle',
          title: $t('examples.button-group.title'),
        },
      },
      {
        name: 'OrpcExample',
        path: 'orpc',
        meta: {
          icon: 'mdi:api',
          title: $t('examples.orpc.title'),
        },
        children: [
          {
            name: 'OrpcPlainCrudExample',
            path: 'plain/crud',
            component: () => import('#/views/examples/orpc/plain/crud.vue'),
            meta: { title: $t('examples.orpc.plainCrud') },
          },
          {
            name: 'OrpcPlainPaginationExample',
            path: 'plain/pagination',
            component: () => import('#/views/examples/orpc/plain/pagination.vue'),
            meta: { title: $t('examples.orpc.plainPagination') },
          },
          {
            name: 'OrpcPlainLiveExample',
            path: 'plain/live',
            component: () => import('#/views/examples/orpc/plain/live.vue'),
            meta: { title: $t('examples.orpc.plainLive') },
          },
        ],
      },
    ],
  },
];

export default routes;
