<script setup lang="ts">
import type { ActionItem } from './types';

import { computed, ref } from 'vue';

import { useSimpleLocale } from '@taman-core/composables';
import { cn } from '@taman-core/shared/utils';

import {
  DropdownMenuItem,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../ui';
import { VbenButton } from '../button';
import { VbenIcon } from '../icon';

const props = defineProps<{ action: ActionItem }>();
const emit = defineEmits<{ confirm: [] }>();
const { $t } = useSimpleLocale();
const open = ref(false);

const itemClass = computed(() =>
  cn(
    'cursor-pointer gap-2',
    props.action.danger && 'color-error focus:color-error',
  ),
);

/**
 * Prevent default reka-ui event behavior for:
 * - @select: keep menu open after click so popconfirm can show;
 * - @open-auto-focus: avoid popover stealing focus (conflicts with menu focus trap);
 * - @focus-outside: avoid closing popover when menu reclaims focus.
 */
function preventDefault(event: Event) {
  event.preventDefault();
}

function onClick() {
  if (props.action.disabled) return;
  props.action.onClick?.();
}

function onConfirm() {
  open.value = false;
  const pc = props.action.popConfirm;
  if (pc?.confirm) {
    pc.confirm();
  } else {
    props.action.onClick?.();
  }
  // Close the entire dropdown after confirm
  emit('confirm');
}

function onCancel() {
  open.value = false;
}
</script>

<template>
  <!--
    Popconfirm: menu item doubles as Popover trigger.
    Dual as-child (DropdownMenuItem + PopoverTrigger merge onto the same leaf element)
    makes it both menu item and popover trigger; @select prevents menu auto-close on click.
  -->
  <Popover v-if="action.popConfirm" v-model:open="open">
    <PopoverTrigger as-child>
      <DropdownMenuItem
        as-child
        :class="itemClass"
        :disabled="action.disabled"
        @select="preventDefault"
      >
        <div>
          <VbenIcon v-if="action.icon" :icon="action.icon" class="size-4" />
          {{ action.text }}
        </div>
      </DropdownMenuItem>
    </PopoverTrigger>
    <PopoverContent
      class="z-popup w-60"
      side="left"
      @focus-outside="preventDefault"
      @open-auto-focus="preventDefault"
    >
      <div class="color-text mb-3 text-sm">
        {{ action.popConfirm.title ?? $t('confirmTitle') }}
      </div>
      <div class="flex justify-end gap-2">
        <VbenButton size="sm" variant="outline" @click="onCancel">
          {{ action.popConfirm.cancelText ?? $t('cancel') }}
        </VbenButton>
        <VbenButton
          :variant="action.danger ? 'destructive' : 'default'"
          size="sm"
          @click="onConfirm"
        >
          {{ action.popConfirm.okText ?? $t('confirm') }}
        </VbenButton>
      </div>
    </PopoverContent>
  </Popover>

  <!-- Plain dropdown item -->
  <DropdownMenuItem
    v-else
    :class="itemClass"
    :disabled="action.disabled"
    @click="onClick"
  >
    <VbenIcon v-if="action.icon" :icon="action.icon" class="size-4" />
    {{ action.text }}
  </DropdownMenuItem>
</template>
