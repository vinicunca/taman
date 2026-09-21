<script setup lang="ts">
import PCollapsible from 'pohon-ui/components/Collapsible.vue';

interface Props {
  collapsible?: boolean;
}

defineOptions({ inheritAttrs: false });

const props = defineProps<Props>();

const open = defineModel<boolean>('open', { default: true });
</script>

<template>
  <PCollapsible
    v-if="props.collapsible"
    v-model:open="open"
    :unmount-on-hide="false"
  >
    <template #content>
      <slot />
    </template>
  </PCollapsible>

  <slot v-else />
</template>
