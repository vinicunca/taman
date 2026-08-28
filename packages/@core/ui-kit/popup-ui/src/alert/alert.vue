<script lang="ts" setup>
import type { Component } from 'vue';
import type { AlertProps } from './alert';

import { useSimpleLocale } from '@taman-core/composables';
import { usePreferences } from '@taman-core/preferences';
import { isString } from '@taman-core/shared/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  TamanButtonIcon,
  TamanRenderContent,
  TamanSpinner,
} from '@taman-core/taman-ui';
import PButton from 'pohon-ui/components/Button.vue';
import PIcon from 'pohon-ui/runtime/vue/components/Icon.vue';
import { computed, h, nextTick, ref } from 'vue';
import { provideAlertContext } from './alert';

const props = withDefaults(
  defineProps<AlertProps>(),
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

const getIconRender = computed(() => {
  let iconRender: Component | null = null;
  if (props.icon) {
    if (isString(props.icon)) {
      switch (props.icon) {
        case 'error': {
          iconRender = h(PIcon, {
            name: 'lucide:x-circle',
            class: 'color-error',
          });
          break;
        }
        case 'info': {
          iconRender = h(PIcon, {
            name: 'lucide:info',
            class: 'color-info',
          });
          break;
        }
        case 'question': {
          iconRender = h(PIcon, {
            name: 'lucide:help-circle',
            class: 'color-info',
          });
          break;
        }
        case 'success': {
          iconRender = h(
            PIcon,
            {
              name: 'lucide:check-circle',
              class: 'color-success',
            },
          );
          break;
        }
        case 'warning': {
          iconRender = h(PIcon, {
            name: 'lucide:alert-circle',
            class: 'color-warning',
          });
          break;
        }
        default: {
          iconRender = null;
          break;
        }
      }
    }
  } else {
    iconRender = props.icon ?? null;
  }
  return iconRender;
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
          <div class="flex items-center">
            <component
              :is="getIconRender"
              class="mr-2"
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
          <div class="m-4 min-h-7.5">
            <TamanRenderContent
              :content="content"
              render-br
            />
          </div>

          <TamanSpinner
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
