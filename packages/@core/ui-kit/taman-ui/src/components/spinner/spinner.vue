<script lang="ts" setup>
import { ref, watch } from 'vue';

interface Props {
  /**
   * Minimum loading time
   */
  minLoadingTime?: number;
  /**
   * Whether loading/spinning is active
   */
  spinning?: boolean;
}

defineOptions({
  name: 'TamanSpinner',
});

const props = withDefaults(
  defineProps<Props>(),
  {
    minLoadingTime: 50,
  },
);

const showSpinner = ref(false);
const renderSpinner = ref(false);
const timer = ref<ReturnType<typeof setTimeout>>();

watch(
  () => props.spinning,
  (show) => {
    if (!show) {
      showSpinner.value = false;
      clearTimeout(timer.value);
      return;
    }

    // startTime.value = performance.now();
    timer.value = setTimeout(() => {
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
    class="bg-overlay/70 flex-center size-full transition-all-500 left-0 top-0 absolute z-100 backdrop-blur-xs"
    :class="
      {
        'invisible pointer-events-none opacity-0': !showSpinner,
        'pointer-events-auto': showSpinner,
      }
    "
    @transitionend="onTransitionEnd"
  >
    <div
      v-if="renderSpinner"
      :class="{ paused: !renderSpinner }"
      class="loader size-12 relative after:(rounded bg-primary h-full w-full content-empty left-0 top-0 absolute) before:(rounded-full bg-primary/50 h-1.25 w-12 content-empty left-0 top-15 absolute)"
    />
  </div>
</template>

<style scoped>
.paused {
  &::before {
    animation-play-state: paused !important;
  }

  &::after {
    animation-play-state: paused !important;
  }
}

.loader {
  &::before {
    animation: loader-shadow-ani 0.5s linear infinite;
  }

  &::after {
    animation: loader-jump-ani 0.5s linear infinite;
  }
}

@keyframes loader-jump-ani {
  15% {
    border-bottom-right-radius: 3px;
  }

  25% {
    transform: translateY(9px) rotate(22.5deg);
  }

  50% {
    border-bottom-right-radius: 40px;
    transform: translateY(18px) scale(1, 0.9) rotate(45deg);
  }

  75% {
    transform: translateY(9px) rotate(67.5deg);
  }

  100% {
    transform: translateY(0) rotate(90deg);
  }
}

@keyframes loader-shadow-ani {
  0%,
  100% {
    transform: scale(1, 1);
  }

  50% {
    transform: scale(1.2, 1);
  }
}
</style>
