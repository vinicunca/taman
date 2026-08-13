<script lang="ts" setup>
const screen = defineModel<boolean>('screen');

function toggleScreen() {
  screen.value = !screen.value;
}
</script>

<template>
  <PButton
    :icon="screen ? 'lucide:minimize-2' : 'lucide:fullscreen'"
    size="sm"
    variant="ghost"
    color="neutral"
    class="h-full pohon:(p-2 border-l rounded-none)"
    @click="toggleScreen"
  />
</template>
