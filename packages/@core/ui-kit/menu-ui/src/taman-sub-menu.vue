<script setup lang="ts">
import type { TamanMenuRecordRaw } from '@taman-core/typings';

import { computed } from 'vue';
import { TamanMenuBadge, TamanMenuItem, TamanMenuSubMenu } from './components';
import TamanSubMenu from './taman-sub-menu.vue';

interface Props {
  /**
   * Menu item
   */
  menu: TamanMenuRecordRaw;
}

defineOptions({
  name: 'TamanSubMenu',
});

const props = withDefaults(
  defineProps<Props>(),
  {},
);

/**
 * Whether the item has children; renders menu-item or sub-menu-item accordingly
 */
const hasChildren = computed(() => {
  const { menu } = props;
  return (
    Reflect.has(menu, 'children') && !!menu.children && menu.children.length > 0
  );
});
</script>

<template>
  <TamanMenuItem
    v-if="!hasChildren"
    :key="menu.path"
    :active-icon="menu.activeIcon"
    :badge="menu.badge"
    :badge-type="menu.badgeType"
    :badge-variants="menu.badgeVariants"
    :icon="menu.icon"
    :path="menu.path"
    :query="menu.query"
  >
    <template #title>
      <span>{{ menu.name }}</span>
    </template>
  </TamanMenuItem>

  <TamanMenuSubMenu
    v-else
    :key="`${menu.path}_sub`"
    :active-icon="menu.activeIcon"
    :icon="menu.icon"
    :path="menu.path"
  >
    <template #content>
      <TamanMenuBadge
        :badge="menu.badge"
        :badge-type="menu.badgeType"
        :badge-variants="menu.badgeVariants"
        class="right-6"
      />
    </template>

    <template #title>
      <span>{{ menu.name }}</span>
    </template>

    <template
      v-for="childItem in menu.children || []"
      :key="childItem.path"
    >
      <TamanSubMenu :menu="childItem" />
    </template>
  </TamanMenuSubMenu>
</template>
