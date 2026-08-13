<script setup lang="ts">
defineOptions({
  name: 'AppCardAction',
});
</script>

<template>
  <div
    data-slot="card-action"
    class="row-span-2 col-start-2 row-start-1 self-start justify-self-end"
  >
    <slot />
  </div>
</template>
