<script setup lang="ts">
import type { TamanMenuRecordRaw } from '@taman-core/typings';

import type { MenuProps } from './menu.types';

import { useForwardProps } from '@taman-core/composables';

import { TamanMenuRoot } from './components';
import TamanSubMenu from './taman-sub-menu.vue';

interface Props extends MenuProps {
  menus: Array<TamanMenuRecordRaw>;
}

defineOptions({
  name: 'TamanMenu',
});

const props = withDefaults(
  defineProps<Props>(),
  {
    collapse: false,
  },
);

const forward = useForwardProps(props);
</script>

<template>
  <TamanMenuRoot v-bind="forward">
    <template
      v-for="menu in menus"
      :key="menu.path"
    >
      <TamanSubMenu :menu="menu" />
    </template>
  </TamanMenuRoot>
</template>
