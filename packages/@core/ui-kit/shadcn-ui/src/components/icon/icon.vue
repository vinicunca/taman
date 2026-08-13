<script setup lang="ts">
import type { Component } from 'vue';

import {
  isFunction,
  isHttpUrl,
  isPlainObject,
  isString,
} from '@taman-core/shared/utils';
import { IconDefault, IconifyIcon } from '@taman-core/icons';
import { computed } from 'vue';

const props = defineProps<{
  // Whether to show default icon when icon is missing
  fallback?: boolean;
  icon?: Component | Function | string;
}>();

const isRemoteIcon = computed(() => {
  return isString(props.icon) && isHttpUrl(props.icon);
});

const isComponent = computed(() => {
  const { icon } = props;
  return !isString(icon) && (isPlainObject(icon) || isFunction(icon));
});
</script>

<template>
  <component
    :is="icon as Component"
    v-if="isComponent"
    v-bind="$attrs"
  />
  <img
    v-else-if="isRemoteIcon"
    :src="icon as string"
    v-bind="$attrs"
  >
  <IconifyIcon
    v-else-if="icon"
    v-bind="$attrs"
    :icon="icon as string"
  />
  <IconDefault
    v-else-if="fallback"
    v-bind="$attrs"
  />
</template>
