<script setup lang="ts">
defineOptions({
  name: 'LayoutAuthForm',
});

defineProps<{
  dataSide?: 'bottom' | 'left' | 'right' | 'top';
}>();
</script>

<template>
  <div
    class="px-6 py-10 bg-background flex-col-center relative lg:px-8 dark:bg-background-elevated lg:flex-initial"
  >
    <slot />

    <!-- Router View with Transition and KeepAlive -->
    <RouterView v-slot="{ Component, route }">
      <Transition
        appear
        mode="out-in"
        name="slide-right"
      >
        <KeepAlive :include="['Login']">
          <component
            :is="Component"
            :key="route.fullPath"
            class="side-content mt-6 w-full sm:mx-auto md:max-w-md"
            :data-side="dataSide"
          />
        </KeepAlive>
      </Transition>
    </RouterView>

    <!-- Footer Copyright -->
    <div
      class="text-xs color-text-muted text-center flex bottom-3 absolute"
    >
      <slot name="copyright" />
    </div>
  </div>
</template>
