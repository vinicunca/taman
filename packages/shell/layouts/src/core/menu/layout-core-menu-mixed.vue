<script lang="ts" setup>
import type { NormalMenuProps } from '@vinicunca/taman-ui/menu';
import type { TamanMenuRecordRaw } from '@taman/types';

import { NormalMenu } from '@vinicunca/taman-ui/menu';
import { onBeforeMount } from 'vue';
import { useRoute } from 'vue-router';
import { findMenuByPath } from '@taman/utils';

interface Props extends NormalMenuProps {}

const props = defineProps<Props>();

const emits = defineEmits<{
  defaultSelect: [TamanMenuRecordRaw, TamanMenuRecordRaw?];
  enter: [TamanMenuRecordRaw];
  select: [TamanMenuRecordRaw];
}>();

const route = useRoute();

onBeforeMount(() => {
  const menu = findMenuByPath(props.menus || [], route.path);
  if (menu) {
    const rootMenu = (props.menus || []).find(
      (item) => item.path === menu.parents?.[0],
    );
    emits('defaultSelect', menu, rootMenu);
  }
});
</script>

<template>
  <NormalMenu
    :active-path="activePath"
    :collapse="collapse"
    :menus="menus"
    :rounded="rounded"
    :theme="theme"
    @enter="(menu) => emits('enter', menu)"
    @select="(menu) => emits('select', menu)"
  />
</template>
