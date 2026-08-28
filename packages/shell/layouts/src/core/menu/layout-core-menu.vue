<script lang="ts" setup>
import type { MenuProps } from '@taman-core/menu-ui';
import type { TamanMenuRecordRaw } from '@taman/types';

import { TamanMenu } from '@taman-core/menu-ui';

interface Props extends MenuProps {
  menus?: Array<TamanMenuRecordRaw>;
}

const props = withDefaults(
  defineProps<Props>(),
  {
    accordion: true,
    menus: () => [],
  },
);

const emit = defineEmits<{
  open: [string, Array<string>];
  select: [string, string?];
}>();

function handleMenuSelect(key: string) {
  emit('select', key, props.mode);
}

function handleMenuOpen(key: string, path: Array<string>) {
  emit('open', key, path);
}
</script>

<template>
  <TamanMenu
    :accordion="accordion"
    :collapse="collapse"
    :collapse-show-title="collapseShowTitle"
    :default-active="defaultActive"
    :menus="menus"
    :mode="mode"
    :rounded="rounded"
    scroll-to-active
    :theme="theme"
    @open="handleMenuOpen"
    @select="handleMenuSelect"
  />
</template>
