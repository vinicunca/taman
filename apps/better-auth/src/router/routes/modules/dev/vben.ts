import type { RouteRecordRaw } from 'vue-router';

import {
  VBEN_ANT_PREVIEW_URL,
  VBEN_ANTDV_NEXT_PREVIEW_URL,
  VBEN_DOC_URL,
  VBEN_ELE_PREVIEW_URL,
  VBEN_GITHUB_URL,
  VBEN_LOGO_URL,
  VBEN_NAIVE_PREVIEW_URL,
  VBEN_TD_PREVIEW_URL,
} from '@taman/constants';
import {
  SvgAntdvLogoIcon,
  SvgAntdvNextLogoIcon,
  SvgTDesignIcon,
} from '@vben/icons';

import { IFrameView } from '#/layouts';
import { $t } from '#/locales';
import { ROUTE_ORDER } from '../../routes.constants';

const routes: Array<RouteRecordRaw> = [
  {
    meta: {
      badgeType: 'dot',
      icon: VBEN_LOGO_URL,
      order: ROUTE_ORDER.PROJECT,
      title: $t('demos.vben.title'),
    },
    name: 'VbenProject',
    path: '/vben-admin',
    children: [
      {
        name: 'VbenDocument',
        path: 'document',
        component: IFrameView,
        meta: {
          icon: 'lucide:book-open-text',
          link: VBEN_DOC_URL,
          title: $t('demos.vben.document'),
        },
      },
      {
        name: 'VbenGithub',
        path: 'github',
        component: IFrameView,
        meta: {
          icon: 'mdi:github',
          link: VBEN_GITHUB_URL,
          title: 'Github',
        },
      },
      {
        name: 'VbenAntdv',
        path: 'antdv',
        component: IFrameView,
        meta: {
          badgeType: 'dot',
          icon: SvgAntdvLogoIcon,
          link: VBEN_ANT_PREVIEW_URL,
          title: $t('demos.vben.antdv'),
        },
      },
      {
        name: 'VbenAntdVNext',
        path: 'antdv-next',
        component: IFrameView,
        meta: {
          badgeType: 'dot',
          icon: SvgAntdvNextLogoIcon,
          link: VBEN_ANTDV_NEXT_PREVIEW_URL,
          title: $t('demos.vben.antdv-next'),
        },
      },

      {
        name: 'VbenNaive',
        path: 'naive',
        component: IFrameView,
        meta: {
          badgeType: 'dot',
          icon: 'logos:naiveui',
          link: VBEN_NAIVE_PREVIEW_URL,
          title: $t('demos.vben.naive-ui'),
        },
      },
      {
        name: 'VbenElementPlus',
        path: 'ele',
        component: IFrameView,
        meta: {
          badgeType: 'dot',
          icon: 'logos:element',
          link: VBEN_ELE_PREVIEW_URL,
          title: $t('demos.vben.element-plus'),
        },
      },
      {
        name: 'VbenTDesign',
        path: 'tdesign',
        component: IFrameView,
        meta: {
          badgeType: 'dot',
          icon: SvgTDesignIcon,
          link: VBEN_TD_PREVIEW_URL,
          title: $t('demos.vben.tdesign'),
        },
      },
    ],
  },
  {
    component: () => import('#/views/_core/about/index.vue'),
    meta: {
      icon: 'lucide:copyright',
      order: ROUTE_ORDER.ABOUT,
      title: $t('demos.vben.about'),
    },
    name: 'VbenAbout',
    path: 'about',
  },
  {
    name: 'Profile',
    path: '/profile',
    component: () => import('#/views/_core/profile/index.vue'),
    meta: {
      icon: 'lucide:user',
      hideInMenu: true,
      title: $t('page.auth.profile'),
    },
  },
];

export default routes;
