<script lang="ts" setup>
import type { TamanAlertProps } from './alert';

import { computed, useAttrs } from 'vue';
import Alert from './alert.vue';

defineOptions({ inheritAttrs: false });

const props = defineProps<TamanAlertProps>();
const emits = defineEmits<{
  'after:leave': [];
  'close': [result: { isConfirm: boolean }];
}>();
const open = defineModel<boolean>('open', { default: false });
const attrs = useAttrs();
const alertAttrs = computed(() => ({ ...props, ...attrs }));
function onClosed(isConfirm: boolean) {
  emits('close', { isConfirm });
  emits('after:leave');
}
</script>

<template>
  <Alert
    v-bind="alertAttrs"
    v-model:open="open"
    @closed="onClosed"
  />
</template>
