<script lang="ts" setup>
import type { ExtendedTamanDrawerApi, TamanDrawerProps } from './drawer.types';

import {
  useIsMobile,
  usePriorityValues,
  useSimpleLocale,
} from '@taman-core/composables';
import {
  DISMISSABLE_DRAWER_ID,
  ELEMENT_ID_MAIN_CONTENT,
} from '@taman-core/shared/constants';
import {
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetRoot,
  SheetTitle,
  TamanSpinner,
  VisuallyHidden,
} from '@taman-core/taman-ui';
import {
  computed,
  onDeactivated,
  provide,
  ref,
  unref,
  useId,
  watch,
} from 'vue';

interface Props extends TamanDrawerProps {
  drawerApi?: ExtendedTamanDrawerApi;
}

const props = withDefaults(defineProps<Props>(), {
  appendToMain: false,
  closeIconPlacement: 'right',
  destroyOnClose: false,
  drawerApi: undefined,
  submitting: false,
  zIndex: 1000,
});

const id = useId();
provide(DISMISSABLE_DRAWER_ID, id);

// @ts-expect-error unused
const wrapperRef = ref<HTMLElement>();
const { $t } = useSimpleLocale();
const { isMobile } = useIsMobile();

const state = props.drawerApi?.useStore?.();

const {
  appendToMain,
  cancelText,
  class: drawerClass,
  closable,
  closeIconPlacement,
  closeOnClickModal,
  closeOnPressEscape,
  confirmLoading,
  confirmText,
  contentClass,
  description,
  destroyOnClose,
  footer: showFooter,
  footerClass,
  header: showHeader,
  headerClass,
  loading: showLoading,
  modal,
  openAutoFocus,
  overlayBlur,
  placement,
  showCancelButton,
  showConfirmButton,
  submitting,
  title,
  titleTooltip,
  zIndex,
} = usePriorityValues(props, state);

/**
 * With keepAlive enabled, browser back/gesture navigation does not close the drawer
 */
onDeactivated(() => {
  // Close the drawer if it is not mounted to the content area
  if (!appendToMain.value) {
    props.drawerApi?.close();
  }
});

function interactOutside(e: Event) {
  if (!closeOnClickModal.value || submitting.value) {
    e.preventDefault();
  }
}
function escapeKeyDown(e: KeyboardEvent) {
  if (!closeOnPressEscape.value || submitting.value) {
    e.preventDefault();
  }
}
// pointer-down-outside
function pointerDownOutside(e: Event) {
  const target = e.target as HTMLElement;
  const dismissableDrawer = target?.dataset.dismissableDrawer;
  if (
    submitting.value
    || !closeOnClickModal.value
    || dismissableDrawer !== id
  ) {
    e.preventDefault();
  }
}

function handerOpenAutoFocus(e: Event) {
  if (!openAutoFocus.value) {
    e?.preventDefault();
  }
}

function handleFocusOutside(e: Event) {
  e.preventDefault();
  e.stopPropagation();
}

const getAppendTo = computed(() => {
  return appendToMain.value
    ? `#${ELEMENT_ID_MAIN_CONTENT}>div:not(.absolute)>div`
    : undefined;
});

/**
 * Improved destroyOnClose behavior
 */
// Whether the drawer has been opened at least once
const hasOpened = ref(false);
const isClosed = ref(true);
watch(
  () => state?.value?.isOpen,
  (value) => {
    if (!value) {
      return;
    }
    isClosed.value = false;
    if (!unref(hasOpened)) {
      hasOpened.value = true;
    }
  },
);
function handleClosed() {
  isClosed.value = true;
  props.drawerApi?.onClosed();
}
const getForceMount = computed(() => {
  return !unref(destroyOnClose) && unref(hasOpened);
});
</script>

<template>
  <SheetRoot
    :modal="false"
    :open="state?.isOpen"
    @update:open="() => drawerApi?.close()"
  >
    <SheetContent
      :append-to="getAppendTo"
      class="flex flex-col w-130"
      :class="
        [
          {
            'w-full!':
              isMobile || placement === 'bottom' || placement === 'top',
            'max-h-screen': placement === 'bottom' || placement === 'top',
            'hidden': isClosed,
          },
          drawerClass,
        ]
      "
      :modal="modal"
      :open="state?.isOpen"
      :side="placement"
      :z-index="zIndex"
      :force-mount="getForceMount"
      :overlay-blur="overlayBlur"
      @close-auto-focus="handleFocusOutside"
      @closed="handleClosed"
      @escape-key-down="escapeKeyDown"
      @focus-outside="handleFocusOutside"
      @interact-outside="interactOutside"
      @open-auto-focus="handerOpenAutoFocus"
      @opened="() => drawerApi?.onOpened()"
      @pointer-down-outside="pointerDownOutside"
    >
      <SheetHeader
        v-if="showHeader"
        class="border-b items-center justify-between"
        :class="
          [
            headerClass,
            {
              'px-4 py-3': closable,
              'pl-2': closable && closeIconPlacement === 'left',
            },
          ]
        "
      >
        <div class="flex items-center">
          <SheetClose
            v-if="closable && closeIconPlacement === 'left'"
            as-child
            :disabled="submitting"
            class="ml-0.5 rounded-full opacity-80 cursor-pointer transition-opacity focus:outline-hidden data-[state=open]:bg-secondary hover:opacity-100 disabled:pointer-events-none"
          >
            <slot name="close-icon">
              <PButton
                icon="lucide:x"
                color="neutral"
                variant="ghost"
                class="pohon:rounded-full"
              />
            </slot>
          </SheetClose>

          <PSeparator
            v-if="closable && closeIconPlacement === 'left'"
            class="ml-1 mr-2 h-8"
            decorative
            orientation="vertical"
          />

          <SheetTitle
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
          </SheetTitle>

          <SheetDescription
            v-if="description"
            class="text-xs mt-1"
          >
            <slot name="description">
              {{ description }}
            </slot>
          </SheetDescription>
        </div>

        <VisuallyHidden v-if="!title || !description">
          <SheetTitle v-if="!title" />
          <SheetDescription v-if="!description" />
        </VisuallyHidden>

        <div class="flex-center">
          <slot name="extra" />
          <SheetClose
            v-if="closable && closeIconPlacement === 'right'"
            as-child
            :disabled="submitting"
            class="ml-0.5 rounded-full opacity-80 cursor-pointer transition-opacity focus:outline-hidden data-[state=open]:bg-secondary hover:opacity-100 disabled:pointer-events-none"
          >
            <slot name="close-icon">
              <PButton
                icon="lucide:x"
                color="neutral"
                variant="ghost"
                class="pohon:rounded-full"
              />
            </slot>
          </SheetClose>
        </div>
      </SheetHeader>
      <template v-else>
        <VisuallyHidden>
          <SheetTitle />
          <SheetDescription />
        </VisuallyHidden>
      </template>
      <div
        ref="wrapperRef"
        class="p-3 flex-1 relative overflow-y-auto"
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

      <SheetFooter
        v-if="showFooter"
        class="p-2 px-3 border-t flex-row w-full items-center justify-end"
        :class="
          [
            footerClass,
          ]
        "
      >
        <slot name="prepend-footer" />

        <slot name="footer">
          <PButton
            v-if="showCancelButton"
            variant="outline"
            color="neutral"
            :disabled="submitting"
            @click="() => drawerApi?.onCancel()"
          >
            <slot name="cancelText">
              {{ cancelText || $t('cancel') }}
            </slot>
          </PButton>

          <slot name="center-footer" />

          <PButton
            v-if="showConfirmButton"
            :loading="confirmLoading || submitting"
            @click="() => drawerApi?.onConfirm()"
          >
            <slot name="confirmText">
              {{ confirmText || $t('confirm') }}
            </slot>
          </PButton>
        </slot>

        <slot name="append-footer" />
      </SheetFooter>
    </SheetContent>
  </SheetRoot>
</template>
