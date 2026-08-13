<script setup lang="ts">
import type { DialogContentEmits, DialogContentProps } from 'akar';
import type { HTMLAttributes } from 'vue';

import {
  DialogClose,
  DialogContent,
  DialogPortal,
  useForwardPropsEmits,
} from 'akar';
import { computed, ref } from 'vue';

import DialogOverlay from './dialog-overlay.vue';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<
    DialogContentProps & {
      animationType?: 'scale' | 'slide';
      appendTo?: HTMLElement | string;
      class?: HTMLAttributes['class'];
      closeClass?: HTMLAttributes['class'];
      closeDisabled?: boolean;
      modal?: boolean;
      open?: boolean;
      overlayBlur?: number;
      showCloseButton?: boolean;
      zIndex?: number;
    }
  >(),
  {
    appendTo: 'body',
    animationType: 'slide',
    closeDisabled: false,
    showCloseButton: true,
  },
);

const emits = defineEmits<
  DialogContentEmits & {
    close: [];
    closed: [];
    opened: [];
  }
>();

const delegatedProps = computed(() => {
  const {
    class: _,
    modal: _modal,
    open: _open,
    showCloseButton: __,
    animationType: ___,
    ...delegated
  } = props;

  return delegated;
});

function isAppendToBody() {
  return (
    props.appendTo === 'body'
    || props.appendTo === document.body
    || !props.appendTo
  );
}

const position = computed(() => {
  return isAppendToBody() ? 'fixed' : 'absolute';
});

// Akar's Dialog won't render the overlay when modal=false. Here, the DialogOverlay component renders the overlay layer and locks scrolling.
// The DialogOverlay component uses v-if to control mounting/unmounting. Its internal useScrollLock automatically unlocks scrolling when the component is unmounted.
// This avoids the issue of pop-ups (such as Select dropdowns) becoming unclickable when modal=true because the body has pointer-events:none set.
const forwarded = useForwardPropsEmits(delegatedProps, emits);

const contentRef = ref<InstanceType<typeof DialogContent> | null>(null);

function onAnimationEnd(event: AnimationEvent) {
  // Only trigger opened/closed events when the animation of contentRef is complete.
  if (event.target === contentRef.value?.$el) {
    if (props.open) {
      emits('opened');
    } else {
      emits('closed');
    }
  }
}

defineExpose({
  getContentRef: () => contentRef.value,
});
</script>

<template>
  <DialogPortal :to="appendTo">
    <Transition
      enter-active-class="transition-opacity-300"
      leave-active-class="transition-opacity-300"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <DialogOverlay
        v-if="open && modal"
        :overlay-blur="overlayBlur"
        :position="position"
        :z-index="zIndex"
        @click="() => emits('close')"
      />
    </Transition>

    <DialogContent
      ref="contentRef"
      :style="{
        ...(zIndex ? { zIndex } : {}),
        position,
      }"
      data-slot="dialog-content"
      class="outline-hidden bg-background shadow-lg z-popup sm:rounded-xl data-[state=closed]:(animate-out fade-out-0 zoom-out-95) data-[state=open]:(animate-in fade-in-0 zoom-in-95) pohon:animate-duration-280"
      v-bind="forwarded"
      :class="[
        {
          'data-[state=closed]:slide-out-to-top-48% data-[state=open]:slide-in-from-top-48%': animationType === 'slide',
        },
        props.class,
      ]
      "
      @animationend="onAnimationEnd"
    >
      <slot />

      <DialogClose
        v-if="showCloseButton"
        :disabled="closeDisabled"
        data-slot="dialog-close"
        class="right-3 top-2.5 absolute"
        :class="[
          closeClass,
        ]"
        as-child
        @click="() => emits('close')"
      >
        <PButton
          icon="lucide:x"
          color="neutral"
          variant="ghost"
          class="pohon:rounded-full"
        />
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
