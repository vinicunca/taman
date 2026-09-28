<script lang="ts" setup>
import type { DialogContentEmits, DialogContentProps } from 'akar';
import type { SheetVariants } from './sheet.variants';
import { DialogContent, DialogPortal, useForwardPropsEmits } from 'akar';
import { computed, ref } from 'vue';
import { useDialogStateEvents } from '../dialog/use-dialog-state-events';
import SheetOverlay from './sheet-overlay.vue';
import { sheetVariants } from './sheet.variants';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<
    DialogContentProps & {
      appendTo?: HTMLElement | string;
      class?: any;
      modal?: boolean;
      open?: boolean;
      overlayBlur?: number;
      side?: SheetVariants['side'];
      zIndex?: number;
    }
  >(),
  {
    appendTo: 'body',
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
    side: _side,
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

// Akar's Dialog won't render the overlay when modal=false. Here, the SheetOverlay component renders the overlay layer and locks scrolling.
// The SheetOverlay component uses v-if to control mounting/unmounting. Its internal useScrollLock automatically unlocks scrolling when the component is unmounted.
// This avoids the issue of pop-ups (such as Select dropdowns) becoming unclickable when modal=true because the body has pointer-events:none set.
const forwarded = useForwardPropsEmits(delegatedProps, emits);
const contentRef = ref<InstanceType<typeof DialogContent> | null>(null);

const { handleAnimationEvent } = useDialogStateEvents({
  contentRef,
  isOpen: () => props.open,
  onClosed: () => emits('closed'),
  onOpened: () => emits('opened'),
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
      <SheetOverlay
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
      data-slot="sheet-content"
      class="border-border bg-background shadow-lg transition ease-in-out z-popup data-[state=closed]:(animate-out animate-duration-300) data-[state=open]:(animate-in animate-duration-500)"
      :class="[
        sheetVariants({ side }),
        props.class,
      ]"
      v-bind="{ ...forwarded, ...$attrs }"
      @animationend="handleAnimationEvent"
      @animationcancel="handleAnimationEvent"
    >
      <slot />
    </DialogContent>
  </DialogPortal>
</template>
