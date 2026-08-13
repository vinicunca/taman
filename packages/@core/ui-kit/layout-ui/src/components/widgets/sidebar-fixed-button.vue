<script setup lang="ts">
const expandOnHover = defineModel<boolean>('expandOnHover');

function toggleFixed() {
  expandOnHover.value = !expandOnHover.value;
}
</script>

<template>
  <PButton
    class="bottom-2 right-3 absolute z-10"
    :icon="expandOnHover ? 'i-lucide-pin' : 'i-lucide-pin-off'"
    color="neutral"
    size="sm"
    variant="soft"
    @click.stop="toggleFixed"
  />
</template>
