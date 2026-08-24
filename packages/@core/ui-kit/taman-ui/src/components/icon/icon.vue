<script lang="ts" setup>
import type { Component } from 'vue';
import {
  isHttpUrl,
  isString,
} from '@taman-core/shared/utils';
import PIcon from 'pohon-ui/runtime/vue/components/Icon.vue';
import { computed } from 'vue';

defineOptions({ name: 'TamanIcon' });

const props = defineProps<{
  icon?: Component | string;
}>();

const isRemoteIcon = computed(() => {
  return isString(props.icon) && isHttpUrl(props.icon);
});
</script>

<template>
  <img
    v-if="isRemoteIcon"
    :src="props.icon as string"
    v-bind="$attrs"
  >

  <PIcon
    v-else
    :name="props.icon"
    v-bind="$attrs"
  />
</template>
