<script lang="ts" setup>
const emit = defineEmits(['refresh']);

function handleRefresh() {
  emit('refresh');
}
</script>

<template>
  <PButton
    icon="lucide:rotate-cw"
    size="sm"
    variant="ghost"
    color="neutral"
    class="h-full pohon:(p-2 border-l rounded-none)"
    @click="handleRefresh"
  />
</template>
