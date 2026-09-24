<script setup lang="ts">
import type { AboutProps, DescriptionItem } from './about';

import {
  VBEN_DOC_URL,
  VBEN_GITHUB_URL,
  VBEN_PREVIEW_URL,
} from '@taman/constants';
import { VbenRenderContent } from '@vben-core/shadcn-ui';
import { h } from 'vue';

import { Page } from '../../components';

interface Props extends AboutProps {}

defineOptions({
  name: 'AboutUI',
});

withDefaults(defineProps<Props>(), {
  description:
    '是一个现代化开箱即用的中后台解决方案，采用最新的技术栈，包括 Vue 3.0、Vite、TailwindCSS 和 TypeScript 等前沿技术，代码规范严谨，提供丰富的配置选项，旨在为中大型项目的开发提供现成的开箱即用解决方案及丰富的示例，同时，它也是学习和深入前端技术的一个极佳示例。',
  name: 'Taman Admin',
  title: '关于项目',
});

declare global {
  const __TAMAN_ADMIN_METADATA__: {
    authorEmail: string;
    authorName: string;
    authorUrl: string;
    buildTime: string;
    dependencies: Record<string, string>;
    description: string;
    devDependencies: Record<string, string>;
    homepage: string;
    license: string;
    repositoryUrl: string;
    version: string;
  };
}

function renderLink(href: string, text: string) {
  return h(
    'a',
    { href, target: '_blank', class: 'vben-link' },
    { default: () => text },
  );
}

const {
  authorEmail,
  authorName,
  authorUrl,
  buildTime,
  dependencies = {},
  devDependencies = {},
  homepage,
  license,
  version,
  // Global variables injected by vite inject-metadata plugin
} = __TAMAN_ADMIN_METADATA__ || {};

const vbenDescriptionItems: Array<DescriptionItem> = [
  {
    content: version,
    title: '版本号',
  },
  {
    content: license,
    title: '开源许可协议',
  },
  {
    content: buildTime,
    title: '最后构建时间',
  },
  {
    content: renderLink(homepage, '点击查看'),
    title: '主页',
  },
  {
    content: renderLink(VBEN_DOC_URL, '点击查看'),
    title: '文档地址',
  },
  {
    content: renderLink(VBEN_PREVIEW_URL, '点击查看'),
    title: '预览地址',
  },
  {
    content: renderLink(VBEN_GITHUB_URL, '点击查看'),
    title: 'Github',
  },
  {
    content: h('div', [
      renderLink(authorUrl, `${authorName}  `),
      renderLink(`mailto:${authorEmail}`, authorEmail),
    ]),
    title: '作者',
  },
];

const dependenciesItems = Object.keys(dependencies).map((key) => ({
  content: dependencies[key],
  title: key,
}));

const devDependenciesItems = Object.keys(devDependencies).map((key) => ({
  content: devDependencies[key],
  title: key,
}));
</script>

<template>
  <Page :title="title">
    <template #description>
      <p class="text-sm/6 color-text mt-3">
        <a
          :href="VBEN_GITHUB_URL"
          class="vben-link"
          target="_blank"
        >
          {{ name }}
        </a>
        {{ description }}
      </p>
    </template>
    <div class="card-box p-5">
      <div>
        <h5 class="text-lg color-text">
          基本信息
        </h5>
      </div>
      <div class="mt-4">
        <dl class="grid grid-cols-2 lg:grid-cols-4 md:grid-cols-3">
          <template
            v-for="item in vbenDescriptionItems"
            :key="item.title"
          >
            <div class="px-4 py-6 border-t border-border sm:px-0 sm:col-span-1">
              <dt class="text-sm/6 color-text font-medium">
                {{ item.title }}
              </dt>
              <dd class="text-sm/6 color-text mt-1 sm:mt-2">
                <VbenRenderContent :content="item.content" />
              </dd>
            </div>
          </template>
        </dl>
      </div>
    </div>

    <div class="card-box mt-6 p-5">
      <div>
        <h5 class="text-lg color-text">
          生产环境依赖
        </h5>
      </div>
      <div class="mt-4">
        <dl class="grid grid-cols-2 lg:grid-cols-4 md:grid-cols-3">
          <template
            v-for="item in dependenciesItems"
            :key="item.title"
          >
            <div class="px-4 py-3 border-t border-border sm:px-0 sm:col-span-1">
              <dt class="text-sm color-text">
                {{ item.title }}
              </dt>
              <dd class="text-sm color-text/80 mt-1 sm:mt-2">
                <VbenRenderContent :content="item.content" />
              </dd>
            </div>
          </template>
        </dl>
      </div>
    </div>
    <div class="card-box mt-6 p-5">
      <div>
        <h5 class="text-lg color-text">
          开发环境依赖
        </h5>
      </div>
      <div class="mt-4">
        <dl class="grid grid-cols-2 lg:grid-cols-4 md:grid-cols-3">
          <template
            v-for="item in devDependenciesItems"
            :key="item.title"
          >
            <div class="px-4 py-3 border-t border-border sm:px-0 sm:col-span-1">
              <dt class="text-sm color-text">
                {{ item.title }}
              </dt>
              <dd class="text-sm color-text/80 mt-1 sm:mt-2">
                <VbenRenderContent :content="item.content" />
              </dd>
            </div>
          </template>
        </dl>
      </div>
    </div>
  </Page>
</template>
