<script lang="ts" setup>
import type { MenuItemProps } from '../menu.types';

import { TamanIcon } from '@taman-core/taman-ui';
import { computed } from 'vue';

import { useMenuContext } from '../composables';

interface Props extends MenuItemProps {
  isMenuMore?: boolean;
  isTopLevelMenuSubmenu: boolean;
  level?: number;
}

defineOptions({ name: 'SubMenuContent' });

const props = withDefaults(defineProps<Props>(), {
  isMenuMore: false,
  level: 0,
});

const rootMenu = useMenuContext();

const opened = computed(() => {
  return rootMenu?.openedMenus.includes(props.path);
});

const collapse = computed(() => {
  return rootMenu.props.collapse;
});

const isFirstLevel = computed(() => {
  return props.level === 1;
});

const getCollapseShowTitle = computed(() => {
  return (
    rootMenu.props.collapseShowTitle && isFirstLevel.value && collapse.value
  );
});

const mode = computed(() => {
  return rootMenu?.props.mode;
});

const showArrowIcon = computed(() => {
  return mode.value === 'horizontal' || !(isFirstLevel.value && collapse.value);
});

const hiddenTitle = computed(() => {
  return (
    mode.value === 'vertical'
    && isFirstLevel.value
    && collapse.value
    && !getCollapseShowTitle.value
  );
});

const iconName = computed(() => {
  return (mode.value === 'horizontal' && !isFirstLevel.value)
    || (mode.value === 'vertical' && collapse.value)
    ? 'lucide:chevron-right'
    : 'lucide:chevron-down';
});

const iconArrowStyle = computed(() => {
  return opened.value ? { transform: 'rotate(180deg)' } : {};
});
</script>

<template>
  <div
    class="taman-sub-menu-content"
    :class="[
      {
        'is-collapse-show-title': getCollapseShowTitle,
        'is-more': isMenuMore,
      },
    ]"
  >
    <slot />

    <TamanIcon
      v-if="!isMenuMore"
      class="taman-menu__icon"
      :icon="icon"
    />

    <div
      v-if="!hiddenTitle"
      class="taman-sub-menu-content__title"
    >
      <slot name="title" />
    </div>

    <TamanIcon
      v-if="!isMenuMore"
      v-show="showArrowIcon"
      :icon="iconName"
      :style="iconArrowStyle"
      class="taman-sub-menu-content__icon-arrow size-4"
    />
  </div>
</template>
