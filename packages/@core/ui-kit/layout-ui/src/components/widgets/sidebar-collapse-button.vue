<script setup lang="ts">
const collapsed = defineModel<boolean>('collapsed');

function handleCollapsed() {
  collapsed.value = !collapsed.value;
}
</script>

<template>
  <PButton
    class="bottom-2 left-3 absolute z-10"
    :icon="collapsed ? 'i-lucide-chevrons-right' : 'i-lucide-chevrons-left'"
    color="neutral"
    size="sm"
    variant="soft"
    @click.stop="handleCollapsed"
  />
</template>
