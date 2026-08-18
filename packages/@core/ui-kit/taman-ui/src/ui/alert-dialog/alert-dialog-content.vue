<script setup lang="ts">
import type { AlertDialogContentEmits, AlertDialogContentProps } from 'akar';
import type { HTMLAttributes } from 'vue';

import { reactiveOmit } from '@vueuse/core';
import {
  AlertDialogContent,
  AlertDialogPortal,
  useForwardPropsEmits,
} from 'akar';
import { ref } from 'vue';

import { useDialogStateEvents } from '../dialog/use-dialog-state-events';
import AlertDialogOverlay from './alert-dialog-overlay.vue';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<
    AlertDialogContentProps & {
      centered?: boolean;
      class?: HTMLAttributes['class'];
      modal?: boolean;
      open?: boolean;
      overlayBlur?: number;
      zIndex?: number;
    }
  >(),
  { modal: true },
);
const emits = defineEmits<
  AlertDialogContentEmits & {
    close: [];
    closed: [];
    opened: [];
  }
>();

// When akar's AlertDialog is set to modal=true, it sets the body to pointer-events:none,
// making pop-ups (such as Select dropdowns) unclickable. This is avoided by passing :modal="false" to the parent component,
// and the AlertDialogOverlay component renders the overlay and locks scrolling.
// AlertDialogOverlay uses v-if to control mounting/unmounting, and its internal useScrollLock automatically unlocks scrolling when the component
// is unmounted.
const delegatedProps = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegatedProps, emits);

const contentRef = ref<InstanceType<typeof AlertDialogContent> | null>(null);

const { handleAnimationEvent } = useDialogStateEvents({
  contentRef,
  isOpen: () => props.open,
  onClosed: () => emits('closed'),
  onOpened: () => emits('opened'),
});

defineExpose({
  getContentRef: () => contentRef.value,
});
</script>

<template>
  <AlertDialogPortal>
    <Transition
      enter-active-class="transition-opacity-300"
      leave-active-class="transition-opacity-300"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <AlertDialogOverlay
        v-if="open && modal"
        :overlay-blur="overlayBlur"
        position="fixed"
        :z-index="zIndex"
        @click="() => emits('close')"
      />
    </Transition>

    <AlertDialogContent
      ref="contentRef"
      data-slot="alert-dialog-content"
      :style="{ ...(zIndex ? { zIndex } : {}), position: 'fixed' }"
      v-bind="{ ...$attrs, ...forwarded }"
      class="border rounded-lg bg-background max-w-[calc(100%-2rem)] w-full shadow-lg translate-x-[-50%] left-[50%] fixed z-popup sm:max-w-lg data-[state=closed]:(animate-out fade-out-0 zoom-out-95) data-[state=open]:(animate-in fade-in-0 zoom-in-95) pohon:animate-duration-280"
      :class="
        [
          {
            'data-[state=closed]:slide-out-to-top-48% data-[state=open]:slide-in-from-top-48%':
              !centered,
            'data-[state=closed]:slide-out-to-top-148% data-[state=open]:slide-in-from-top-98%':
              centered,
            'top-[10vh]': !centered,
            'top-1/2 -translate-y-1/2': centered,
          },
          props.class,
        ]
      "
      @animationend="handleAnimationEvent"
      @animationcancel="handleAnimationEvent"
    >
      <slot />
    </AlertDialogContent>
  </AlertDialogPortal>
</template>
