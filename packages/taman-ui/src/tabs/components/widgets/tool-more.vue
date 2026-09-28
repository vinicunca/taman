<script lang="ts" setup>
import type { DropdownMenuProps } from 'pohon-ui';
import PButton from 'pohon-ui/components/Button.vue';
import PDropdownMenu from 'pohon-ui/components/DropdownMenu.vue';

const props = defineProps<DropdownMenuProps>();
</script>

<template>
  <PDropdownMenu :items="props.items">
    <PButton
      icon="lucide:layout-grid"
      size="sm"
      variant="ghost"
      color="neutral"
      class="h-full pohon:(p-2 border-l rounded-none)"
    />
  </PDropdownMenu>
</template>
