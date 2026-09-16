<script lang="ts" setup>
import { useEventListener, useThrottleFn } from '@vueuse/core';
import PButton from 'pohon-ui/components/Button.vue';
import { computed, onMounted, ref, shallowRef } from 'vue';
import { TamanButtonIcon } from '../button';

const props = withDefaults(
  defineProps<{
    bottom?: number;
    isGroup?: boolean;
    right?: number;
    target?: string;
    visibilityHeight?: number;
  }>(),
  {
    bottom: 20,
    isGroup: false,
    right: 24,
    target: '',
    visibilityHeight: 200,
  },
);

const backTopStyle = computed(() => ({
  bottom: `${props.bottom}px`,
  right: `${props.right}px`,
}));

const el = shallowRef<HTMLElement>();
const container = shallowRef<Document | HTMLElement>();
const visible = ref(false);

function handleScroll() {
  if (el.value) {
    visible.value = el.value.scrollTop >= (props?.visibilityHeight ?? 0);
  }
}

function handleClick() {
  el.value?.scrollTo({ behavior: 'smooth', top: 0 });
}

const handleScrollThrottled = useThrottleFn(handleScroll, 300, true);

useEventListener(container, 'scroll', handleScrollThrottled);
onMounted(() => {
  container.value = document;
  el.value = document.documentElement;

  if (props.target) {
    el.value = document.querySelector<HTMLElement>(props.target) ?? undefined;

    if (!el.value) {
      throw new Error(`target does not exist: ${props.target}`);
    }
    container.value = el.value;
  }
  // Give visible an initial value, fix #13066
  handleScroll();
});
</script>

<template>
  <Transition
    enter-active-class="transition-opacity,transform-280"
    leave-active-class="transition-opacity,transform-280"
    enter-from-class="opacity-0 translate-y-100%"
    leave-to-class="opacity-0 translate-y-100%"
  >
    <PButton
      v-if="visible"
      :style="backTopStyle"
      class="shadow-float fixed z-popup pohon:rounded-full"
      variant="outline"
      color="neutral"
      icon="lucide:arrow-up-to-line"
      size="xl"
      @click="handleClick"
    />
  </Transition>
</template>
