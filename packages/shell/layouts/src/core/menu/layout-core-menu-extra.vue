<script lang="ts" setup>
import type { TamanMenuRecordRaw } from '@taman/types';
import type { MenuProps } from '@vinicunca/taman-ui/menu';

import { TamanMenu } from '@vinicunca/taman-ui/menu';
import { useRoute } from 'vue-router';

import { useNavigation } from './use-navigation';

interface Props extends MenuProps {
  collapse?: boolean;
  menus?: Array<TamanMenuRecordRaw>;
}

withDefaults(defineProps<Props>(), {
  accordion: true,
  menus: () => [],
});

const route = useRoute();
const { navigation } = useNavigation();

async function handleSelect(key: string) {
  await navigation(key);
}
</script>

<template>
  <TamanMenu
    :accordion="accordion"
    :collapse="collapse"
    :default-active="route.meta?.activePath || route.path"
    :menus="menus"
    :rounded="rounded"
    :theme="theme"
    mode="vertical"
    @select="handleSelect"
  />
</template>
