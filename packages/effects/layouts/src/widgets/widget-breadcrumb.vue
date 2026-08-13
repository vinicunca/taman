<script lang="ts" setup>
import type { BreadcrumbItem } from '@taman-core/taman-ui';

import { $t } from '@taman/locales';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

interface Props {
  hideWhenOnlyOne?: boolean;
  showHome?: boolean;
  showIcon?: boolean;
}

const props = withDefaults(
  defineProps<Props>(),
  {
    showHome: false,
    showIcon: false,
    type: 'normal',
  },
);

const route = useRoute();

const breadcrumbs = computed<Array<BreadcrumbItem>>(() => {
  const matched = route.matched;

  const resultBreadcrumb: Array<BreadcrumbItem> = [];

  for (const match of matched) {
    const { meta, path } = match;
    const {
      hideChildrenInMenu,
      hideInBreadcrumb,
      icon,
      name,
      title,
    } = meta || {};

    if (hideInBreadcrumb || hideChildrenInMenu || !path) {
      continue;
    }

    resultBreadcrumb.push({
      icon: props.showIcon ? icon : undefined,
      to: path || route.path,
      label: title ? $t((title || name) as string) : '',
    });
  }

  if (props.showHome) {
    resultBreadcrumb.unshift({
      icon: 'mdi:home-outline',
      to: '/',
    });
  }
  if (props.hideWhenOnlyOne && resultBreadcrumb.length === 1) {
    return [];
  }

  return resultBreadcrumb;
});
</script>

<template>
  <PBreadcrumb
    :items="breadcrumbs"
    class="ml-2"
  />
</template>
