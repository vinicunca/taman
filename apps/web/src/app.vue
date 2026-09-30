<script lang="ts" setup>
import { VueQueryDevtools } from '@tanstack/vue-query-devtools';
</script>

<template>
  <PApp
    :tooltip="{
      delayDuration: 100,
    }"
    :toaster="{
      expand: false,
    }"
  >
    <RouterView />

    <VueQueryDevtools />
  </PApp>
</template>
