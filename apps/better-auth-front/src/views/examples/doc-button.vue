<script lang="ts" setup>
import { VBEN_DOC_URL } from '@taman/constants';
import { openWindow } from '@taman/utils';

const props = defineProps<{ path: string }>();

function handleClick() {
  // Without .html, opening the page may result in a 404
  const path
    = VBEN_DOC_URL
      + (props.path.toLowerCase().endsWith('.html')
        ? props.path
        : `${props.path}.html`);
  openWindow(path);
}
</script>

<template>
  <Button @click="handleClick">
    查看组件文档
  </Button>
</template>
