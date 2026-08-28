<script lang="ts" setup>
import type { DialogProps, ExtendedDialogApi } from './dialog.types';
import { usePriorityValues, useSimpleLocale } from '@taman-core/composables';
import { DISMISSABLE_DIALOG_ID, ELEMENT_ID_MAIN_CONTENT } from '@taman-core/shared/constants';
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  TamanButtonIcon,
  TamanSpinner,
  VisuallyHidden,
} from '@taman-core/taman-ui';
import PButton from 'pohon-ui/components/Button.vue';
import PTooltip from 'pohon-ui/components/Tooltip.vue';
import PIcon from 'pohon-ui/runtime/vue/components/Icon.vue';
import {
  computed,
  nextTick,
  onDeactivated,
  provide,
  ref,
  unref,
  useId,
  watch,
} from 'vue';
import { useDialogDraggable } from './use-dialog-draggable';

interface Props extends DialogProps {
  dialogApi?: ExtendedDialogApi;
  closeDisabled?: boolean;
  closeClass?: string;
}

const props = withDefaults(
  defineProps<Props>(),
  {
    appendToMain: false,
    destroyOnClose: false,
    dialogApi: undefined,
    closable: true,
  },
);

const contentRef = ref();
const dialogRef = ref();
const headerRef = ref();

const { $t } = useSimpleLocale();
const state = props.dialogApi?.useStore?.();

const id = useId();
// The mask layer, identified by this id, is only allowed to be closed if a click occurs on the current dialog's mask.
provide(DISMISSABLE_DIALOG_ID, id);

const {
  appendToMain,
  bordered,
  cancelText,
  centered,
  class: dialogClass,
  closable,
  closeOnClickModal,
  closeOnPressEscape,
  confirmDisabled,
  confirmLoading,
  confirmText,
  contentClass,
  description,
  destroyOnClose,
  draggable,
  overflow,
  footer: showFooter,
  footerClass,
  fullscreen: shouldFullscreen,
  fullscreenButton,
  header,
  headerClass,
  loading: showLoading,
  modal,
  openAutoFocus,
  overlayBlur,
  showCancelButton,
  showConfirmButton,
  submitting,
  title,
  titleTooltip,
  animationType,
  zIndex,
} = usePriorityValues(props, state);

const shouldDraggable = computed(
  () => draggable.value && !shouldFullscreen.value && header.value,
);

const shouldCentered = computed(
  () => centered.value && !shouldFullscreen.value,
);

const getAppendTo = computed(() => {
  return appendToMain.value
    ? `#${ELEMENT_ID_MAIN_CONTENT}`
    : undefined;
});

const { dragging, transform } = useDialogDraggable(
  {
    targetRef: contentRef,
    dragRef: headerRef,
    draggable: shouldDraggable,
    containerSelector: getAppendTo,
    centered: shouldCentered,
    isOverflow: overflow,
  },
);

const firstOpened = ref(false);
const isClosed = ref(true);

watch(
  () => state?.value?.isOpen,
  async (isOpen_) => {
    if (!contentRef.value) {
      return;
    }

    if (isOpen_) {
      isClosed.value = false;
      if (!firstOpened.value) {
        firstOpened.value = true;
      }
      await nextTick();
      if (!contentRef.value) {
        return;
      }
      const innerContentRef = contentRef.value.getContentRef();
      dialogRef.value = innerContentRef?.$el;
      // reopen modal reassign value
      const { offsetX, offsetY } = transform;
      dialogRef.value.style.transform = shouldCentered.value
        ? `translate(${offsetX}px, calc(-50% + ${offsetY}px))`
        : `translate(${offsetX}px, ${offsetY}px)`;
    }
  },
  { immediate: true },
);

/**
 * With keepAlive enabled, browser back/gesture navigation does not close the modal
 */
onDeactivated(() => {
  // Close the modal if it is not mounted to the content area
  if (!appendToMain.value) {
    props.dialogApi?.close();
  }
});

function handleFullscreen() {
  props.dialogApi?.setState((prev) => {
    return { ...prev, fullscreen: !shouldFullscreen.value };
  });
}

function handleInteractOutside(event: Event) {
  if (!closeOnClickModal.value || submitting.value) {
    event.preventDefault();
    event.stopPropagation();
  }
}
function handleEscapeKeydown(event: KeyboardEvent) {
  if (!closeOnPressEscape.value || submitting.value) {
    event.preventDefault();
  }
}

function handleOpenAutoFocus(event: Event) {
  if (!openAutoFocus.value) {
    event?.preventDefault();
  }
}

function handlePointerDownOutside(event: Event) {
  const target = event.target as HTMLElement;
  const isDismissableModal = target?.dataset.dismissableModal;
  if (
    !closeOnClickModal.value
    || isDismissableModal !== id
    || submitting.value
  ) {
    event.preventDefault();
    event.stopPropagation();
  }
}

function handleFocusOutside(event: Event) {
  event.preventDefault();
  event.stopPropagation();
}

function handleCloseAutoFocus(_event: Event) {
  // allow akar to return focus to the trigger element on close
}

const getForceMount = computed(() => {
  return !unref(destroyOnClose) && unref(firstOpened);
});

function handleOpened() {
  requestAnimationFrame(() => {
    props.dialogApi?.onOpened();
  });
}

function handleClosed() {
  isClosed.value = true;
  props.dialogApi?.onClosed();
}
</script>

<template>
  <DialogRoot
    :modal="false"
    :open="state?.isOpen"
    @update:open="() => (!submitting ? dialogApi?.close() : undefined)"
  >
    <DialogContent
      ref="contentRef"
      :append-to="getAppendTo"
      class="mx-auto flex flex-col w-130 inset-x-0 top-10vh"
      :class="[
        shouldFullscreen ? 'rounded-none' : 'rounded-$taman-radius',
        {
          'border border-border': bordered,
          'shadow-3xl': !bordered,
          'max-h-[min(80%,calc(100dvh-20px))] max-w-[calc(100vw-20px)]': !shouldFullscreen,
          'top-0 left-0 size-full! max-h-full! max-w-full! translate-0!':
            shouldFullscreen,
          'top-1/2': centered && !shouldFullscreen,
          'duration-300': !dragging,
          'hidden': isClosed,
        },
        dialogClass,
      ]"
      :force-mount="getForceMount"
      :modal="modal"
      :open="state?.isOpen"
      :animation-type="animationType"
      :z-index="zIndex"
      :overlay-blur="overlayBlur"
      @close-auto-focus="handleCloseAutoFocus"
      @closed="handleClosed"
      @escape-key-down="handleEscapeKeydown"
      @focus-outside="handleFocusOutside"
      @interact-outside="handleInteractOutside"
      @open-auto-focus="handleOpenAutoFocus"
      @opened="handleOpened"
      @pointer-down-outside="handlePointerDownOutside"
    >
      <DialogHeader
        ref="headerRef"
        class="justify-between"
        :class="
          [
            {
              'border-b': bordered,
              'hidden': !header,
              'cursor-move select-none': shouldDraggable,
              'items-center': !description,
              'items-start': description,
            },
            headerClass,
          ]
        "
      >
        <div class="flex flex-col gap-1">
          <DialogTitle
            v-if="title"
            class="text-left flex gap-1 items-center"
          >
            <slot name="title">
              {{ title }}

              <slot
                name="titleTooltip"
              >
                <PTooltip
                  v-if="titleTooltip"
                  :text="titleTooltip"
                >
                  <PIcon
                    name="lucide:circle-help"
                    class="color-text-muted"
                  />
                </PTooltip>
              </slot>
            </slot>
          </DialogTitle>

          <DialogDescription v-if="description">
            <slot name="description">
              {{ description }}
            </slot>
          </DialogDescription>
        </div>

        <div class="flex-center">
          <slot name="extra" />

          <DialogClose
            v-if="closable"
            as-child
            @click="handleClosed"
          >
            <TamanButtonIcon
              :disabled="submitting"
              :class="[
                closeClass,
              ]"
              icon="lucide:x"
            />
          </DialogClose>
        </div>

        <VisuallyHidden v-if="!title || !description">
          <DialogTitle v-if="!title" />
          <DialogDescription v-if="!description" />
        </VisuallyHidden>
      </DialogHeader>

      <div
        class="p-3 flex-1 min-h-40 relative overflow-y-auto"
        :class="
          [
            contentClass,
            {
              'pointer-events-none': showLoading || submitting,
            },
          ]
        "
      >
        <slot />
      </div>

      <TamanSpinner
        v-if="showLoading || submitting"
        spinning
      />

      <PButton
        v-if="fullscreenButton"
        class="right-12 top-2.5 absolute pohon:rounded-full"
        :icon="shouldFullscreen ? 'lucide:shrink' : 'lucide:expand'"
        color="neutral"
        variant="ghost"
        @click="handleFullscreen"
      />

      <DialogFooter
        v-if="showFooter"
        class="p-2 flex-row items-center justify-end"
        :class="
          [
            {
              'border-t': bordered,
            },
            footerClass,
          ]
        "
      >
        <slot name="leading-footer" />

        <slot name="footer">
          <PButton
            v-if="showCancelButton"
            variant="outline"
            color="neutral"
            :disabled="submitting"
            @click="() => dialogApi?.onCancel()"
          >
            <slot name="cancelText">
              {{ cancelText || $t('cancel') }}
            </slot>
          </PButton>

          <slot name="center-footer" />

          <PButton
            v-if="showConfirmButton"
            :disabled="confirmDisabled"
            :loading="confirmLoading || submitting"
            @click="() => dialogApi?.onConfirm()"
          >
            <slot name="confirmText">
              {{ confirmText || $t('confirm') }}
            </slot>
          </PButton>
        </slot>

        <slot name="trailing-footer" />
      </DialogFooter>
    </DialogContent>
  </DialogRoot>
</template>
