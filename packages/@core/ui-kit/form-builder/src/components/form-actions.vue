<script lang="ts" setup>
import type { FormApi } from '../form-api';
import type { FormBuilderMessages } from '../types';
import { computed } from 'vue';

import { useFormBuilderConfig } from '../plugin';

const props = defineProps<{
  collapsed?: boolean;
  collapsible?: boolean;
  formApi: FormApi;
  messages?: Partial<FormBuilderMessages>;
  showResetButton?: boolean;
}>();

const emit = defineEmits<{ toggleCollapsed: [] }>();

const config = useFormBuilderConfig();
const messages = computed(() => ({ ...config.messages, ...props.messages }));

async function onReset() {
  await props.formApi.resetForm();
}
</script>

<template>
  <div class="flex gap-2 items-center justify-end">
    <slot name="reset-before" />
    <PButton
      v-if="showResetButton !== false"
      type="button"
      variant="outline"
      @click="onReset"
    >
      {{ messages.reset }}
    </PButton>
    <PButton type="submit">
      {{ messages.submit }}
    </PButton>
    <slot name="submit-after" />
    <PButton
      v-if="collapsible"
      type="button"
      variant="ghost"
      @click="emit('toggleCollapsed')"
    >
      {{ collapsed ? messages.expand : messages.collapse }}
    </PButton>
  </div>
</template>
