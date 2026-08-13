<script setup lang="ts">
import type { TamanMenuRecordRaw } from '@taman-core/typings';

import type { NormalMenuProps } from './normal-menu';

import { TamanIcon } from '@taman-core/taman-ui';

interface Props extends NormalMenuProps {}

defineOptions({
  name: 'TamanNormalMenu',
});

const props = withDefaults(defineProps<Props>(), {
  activePath: '',
  collapse: false,
  menus: () => [],
  theme: 'dark',
});

const emit = defineEmits<{
  enter: [TamanMenuRecordRaw];
  select: [TamanMenuRecordRaw];
}>();

function menuIcon(menu: TamanMenuRecordRaw) {
  return props.activePath === menu.path
    ? menu.activeIcon || menu.icon
    : menu.icon;
}
</script>

<template>
  <ul
    :class="[
      theme,
      `is-${theme}`,
      {
        'is-collapse': collapse,
        'is-rounded': rounded,
      },
    ]"
    class="taman-normal-menu relative"
  >
    <template
      v-for="menu in menus"
      :key="menu.path"
    >
      <li
        class="taman-normal-menu__item"
        :class="{
          'is-active': activePath === menu.path,
        }"
        @click="() => emit('select', menu)"
        @mouseenter="() => emit('enter', menu)"
      >
        <TamanIcon
          class="taman-normal-menu__icon"
          :icon="menuIcon(menu)"
        />

        <span
          class="taman-normal-menu__name truncate"
        > {{ menu.name }}</span>
      </li>
    </template>
  </ul>
</template>
