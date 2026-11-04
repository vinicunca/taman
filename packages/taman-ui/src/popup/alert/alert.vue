<script lang="ts" setup>
import type { TamanAlertProps } from './alert';

import { useOverlayZIndex, useSimpleLocale } from '@vinicunca/taman-core/composables';
import { usePreferences } from '@vinicunca/taman-core/preferences';
import { isString } from '@vinicunca/taman-core/utils';
import PButton from 'pohon-ui/components/Button.vue';
import { computed, nextTick, ref } from 'vue';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  TamanButtonIcon,
  TamanIcon,
  TamanLoading,
  TamanRenderContent,
} from '../..';
import { provideAlertContext } from './alert';

const props = withDefaults(
  defineProps<TamanAlertProps>(),
  {
    bordered: true,
    buttonAlign: 'end',
    centered: true,
    escapeKeyClose: true,
  },
);

const emits = defineEmits<{
  closed: [isConfirm: boolean];
  confirm: [];
  opened: [];
}>();
const { globalEscapeShortcutKey } = usePreferences();

const open = defineModel<boolean>(
  'open',
  { default: false },
);
const { $t } = useSimpleLocale();
const isConfirm = ref(false);
const zIndex = useOverlayZIndex(open);

function onAlertClosed() {
  emits('closed', isConfirm.value);
  isConfirm.value = false;
}

function onEscapeKeyDown(event: KeyboardEvent) {
  // Mark that close was triggered by Esc (used for isConfirm and related logic)
  isConfirm.value = false;

  // Block close only when both component and global Esc settings are false
  if (!props.escapeKeyClose && !globalEscapeShortcutKey.value) {
    event.preventDefault();
  }
}

const iconData = computed(() => {
  if (!props.icon) {
    return;
  }

  if (!isString(props.icon)) {
    return {
      name: props.icon,
      class: '',
    };
  }

  const iconMapping = {
    error: {
      name: 'lucide:x-circle',
      class: 'color-error',
    },
    info: {
      name: 'lucide:info',
      class: 'color-info',
    },
    question: {
      name: 'lucide:help-circle',
      class: 'color-info',
    },
    success: {
      name: 'lucide:check-circle',
      class: 'color-success',
    },
    warning: {
      name: 'lucide:alert-circle',
      class: 'color-warning',
    },
  };

  return iconMapping[props.icon as keyof typeof iconMapping];
});

function doCancel() {
  handleCancel();
  handleOpenChange(false);
}

function doConfirm() {
  handleConfirm();
  handleOpenChange(false);
}

provideAlertContext({
  doCancel,
  doConfirm,
});

function handleConfirm() {
  isConfirm.value = true;
  emits('confirm');
}

function handleCancel() {
  isConfirm.value = false;
}

const loading = ref(false);
async function handleOpenChange(val: boolean) {
  await nextTick(); // Wait for isConfirm to be updated
  if (!val && props.beforeClose) {
    loading.value = true;
    try {
      const res = await props.beforeClose({ isConfirm: isConfirm.value });
      if (res !== false) {
        open.value = false;
      }
    } finally {
      loading.value = false;
    }
  } else {
    open.value = val;
  }
}
</script>

<template>
  <AlertDialog
    :open="open"
    @update:open="handleOpenChange"
  >
    <AlertDialogContent
      :open="open"
      :centered="centered"
      :overlay-blur="overlayBlur"
      :z-index="zIndex"
      class="flex flex-col max-h-[80%] inset-x-0 sm:(rounded-$taman-radius max-w-[80%] w-130)"
      :class="
        [
          containerClass,
          {
            'border border-border': bordered,
            'shadow-3xl': !bordered,
          },
        ]
      "
      @opened="emits('opened')"
      @closed="onAlertClosed"
      @escape-key-down="onEscapeKeyDown($event)"
    >
      <div
        class="p-3 flex-1 relative overflow-y-auto"
        :class="contentClass"
      >
        <AlertDialogTitle v-if="title">
          <div class="flex gap-2 items-center">
            <TamanIcon
              v-if="props.icon"
              :icon="iconData?.name"
              :class="iconData?.class"
              size="24"
            />

            <span class="flex-auto">{{ $t(title) }}</span>

            <AlertDialogCancel
              v-if="showCancel"
              as-child
            >
              <TamanButtonIcon
                :disabled="loading"
                icon="lucide:x"
                @click="handleCancel"
              />
            </AlertDialogCancel>
          </div>
        </AlertDialogTitle>

        <AlertDialogDescription>
          <div
            class="py-4"
            :class="{
              'px-8': props.icon,
            }"
          >
            <TamanRenderContent
              :content="content"
              render-br
            />
          </div>

          <TamanLoading
            v-if="loading && contentMasking"
            :spinning="loading"
          />
        </AlertDialogDescription>

        <div
          class="flex gap-x-2 items-center justify-end"
          :class="`justify-${buttonAlign}`"
        >
          <TamanRenderContent :content="footer" />

          <AlertDialogCancel
            v-if="showCancel"
            as-child
          >
            <PButton
              :disabled="loading"
              variant="outline"
              color="neutral"
              @click="handleCancel"
            >
              {{ cancelText || $t('cancel') }}
            </PButton>
          </AlertDialogCancel>

          <AlertDialogAction as-child>
            <PButton
              :loading="loading"
              @click="handleConfirm"
            >
              {{ confirmText || $t('confirm') }}
            </PButton>
          </AlertDialogAction>
        </div>
      </div>
    </AlertDialogContent>
  </AlertDialog>
</template>
