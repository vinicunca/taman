<script lang="ts" setup>
import { TamanDialogProvider, TamanDrawerProvider } from '@taman/common-ui';
import { VueQueryDevtools } from '@tanstack/vue-query-devtools';
import { initAppContext } from '#/adapter/context';

initAppContext();
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

    <TamanDialogProvider />
    <TamanDrawerProvider />

    <VueQueryDevtools />
  </PApp>
</template>
