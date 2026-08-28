<script setup lang="ts">
const { title = '' } = defineProps<{
  title?: string;
}>();
</script>

<template>
  <div class="p-4 flex flex-col gap-3">
    <h3 class="leading-none tracking-tight font-600">
      {{ title }}
    </h3>

    <slot />
  </div>
</template>
