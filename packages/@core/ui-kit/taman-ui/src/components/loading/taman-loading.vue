<script lang="ts" setup>
import type { TamanLoadingIcon } from './types';
import { isString } from '@taman-core/shared/utils';
import PIcon from 'pohon-ui/components/Icon.vue';
import { computed, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    minLoadingTime?: number;
    spinning?: boolean;
    text?: string;
    icon?: TamanLoadingIcon;
  }>(),
  {
    minLoadingTime: 50,
    icon: 'svg-spinners:ring-resize',
  },
);

const DEFAULT_ICON_NAME = 'svg-spinners:ring-resize';

const iconProps = computed(() => {
  const icon = props.icon ?? DEFAULT_ICON_NAME;

  if (isString(icon)) {
    return { name: icon };
  }

  return {
    ...icon,
    name: icon.name ?? DEFAULT_ICON_NAME,
  };
});

// const startTime = ref(0);
const showSpinner = ref(false);
const renderSpinner = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;

watch(
  () => props.spinning,
  (show) => {
    if (!show) {
      showSpinner.value = false;
      timer && clearTimeout(timer);
      return;
    }

    // startTime.value = performance.now();
    timer = setTimeout(() => {
      // const loadingTime = performance.now() - startTime.value;

      showSpinner.value = true;
      if (showSpinner.value) {
        renderSpinner.value = true;
      }
    }, props.minLoadingTime);
  },
  {
    immediate: true,
  },
);

function onTransitionEnd() {
  if (!showSpinner.value) {
    renderSpinner.value = false;
  }
}
</script>

<template>
  <div
    class="color-primary bg-background-elevated/75 flex-col-center size-full transition-all-500 left-0 top-0 absolute z-100 backdrop-blur-xs"
    :class="
      {
        'invisible pointer-events-none opacity-0': !showSpinner,
        'pointer-events-auto': showSpinner,
      }
    "
    @transitionend="onTransitionEnd"
  >
    <PIcon
      v-if="renderSpinner"
      v-bind="iconProps"
    />

    <div
      v-if="text"
      class="text-xs mt-4"
    >
      {{ text }}
    </div>

    <slot />
  </div>
</template>
