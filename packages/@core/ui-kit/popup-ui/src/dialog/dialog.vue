<script lang="ts" setup>
import type { DialogProps, ExtendedDialogApi } from './dialog.types';
import { usePriorityValues, useSimpleLocale } from '@taman-core/composables';
import { DISMISSABLE_DIALOG_ID, ELEMENT_ID_MAIN_CONTENT } from '@taman-core/shared/constants';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  TamanSpinner,
  VisuallyHidden,
} from '@taman-core/taman-ui';
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
}

const props = withDefaults(
  defineProps<Props>(),
  {
    appendToMain: false,
    destroyOnClose: false,
    dialogApi: undefined,
  },
);

const contentRef = ref();
// @ts-expect-error unused
const wrapperRef = ref<HTMLElement>();
const dialogRef = ref();
const headerRef = ref();
// @ts-expect-error unused
const footerRef = ref();

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
    ? `#${ELEMENT_ID_MAIN_CONTENT}>div:not(.absolute)>div`
    : undefined;
});

const { dragging, transform } = useDialogDraggable(
  {
    targetRef: dialogRef,
    dragRef: headerRef,
    draggable: shouldDraggable,
    containerSelector: getAppendTo,
    centered: shouldCentered,
    isOverflow: overflow,
  },
);

const firstOpened = ref(false);
const isClosed = ref(true);

async function handleOpenToggle(value?: boolean) {
  if (!value) {
    return;
  }

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

watch(
  () => state?.value?.isOpen,
  handleOpenToggle,
  { immediate: true },
);

/**
 * When keepAlive is enabled, directly returning via browser buttons/gestures will not close the pop-up window.
 */
onDeactivated(() => {
  // If the pop-up is not mounted to the content area, close the pop-up.
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

// pointer-down-outside
function pointerDownOutside(event: Event) {
  const target = event.target as HTMLElement;
  const isDismissableDialog = target?.dataset.dismissableDialog;
  if (
    !closeOnClickModal.value
    || isDismissableDialog !== id
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
      :show-close-button="closable"
      :animation-type="animationType"
      :z-index="zIndex"
      :overlay-blur="overlayBlur"
      close-class="top-3"
      :close-disabled="submitting"
      @closed="handleClosed"
      @escape-key-down="handleEscapeKeydown"
      @focus-outside="handleFocusOutside"
      @interact-outside="handleInteractOutside"
      @open-auto-focus="handleOpenAutoFocus"
      @opened="handleOpened"
      @pointer-down-outside="pointerDownOutside"
    >
      <DialogHeader
        ref="headerRef"
        class="px-5 py-4"
        :class="
          [
            {
              'border-b': bordered,
              'hidden': !header,
              'cursor-move select-none': shouldDraggable,
            },
            headerClass,
          ]
        "
      >
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

        <VisuallyHidden v-if="!title || !description">
          <DialogTitle v-if="!title" />
          <DialogDescription v-if="!description" />
        </VisuallyHidden>
      </DialogHeader>

      <div
        ref="wrapperRef"
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
        ref="footerRef"
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
