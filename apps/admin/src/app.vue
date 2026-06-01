<script lang="ts" setup>
const appConfig = useAppConfig();

appConfig.toaster = reactive({
  position: 'bottom-right' as const,
  expand: true,
  duration: 5000,
});
</script>

<template>
  <PApp
    :toaster="appConfig.toaster"
  >
    <RouterView />
  </PApp>
</template>
